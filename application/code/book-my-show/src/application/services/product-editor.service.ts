import { removeEscapeChars } from '../../framework/core/Application';
import { Service } from '../../framework/decorators/Service';
import { AsyncTask } from '../../framework/core/AsyncTask';
import { KeyValuePair } from '../../framework/core/ResourceDictionary';
import { DateFormatProvider } from '../../framework/providers/DateFormatProvider';
import { HttpRequest, HttpRequestConfig, HttpParams } from '../../framework/providers/HttpRequest';

import { WritableProduct, Product } from '../models/product/Product.Interface';
import { IComment, IProductComments } from '../models/product/ProductComments.Interface'
import { ProductImport } from '../models/product/ProductImport.Interface';
import { ProductEmitter } from '../models/product/ProductEmitter.Interface';
import { appConfig, endpoints } from '../config';
import { ProductPlatform } from '../models/product/ProductPlatform.Interface';

@Service()
class ProductEditorService {
    private http: HttpRequest;
    
  public Products: Product[];
  public SelectedProduct: Product;
  public SelectedEmitter: ProductEmitter;

  public FilteredItems: Product[];

  constructor() {
    const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: endpoints.get('ProductEditBasePath'), EnableCors: true };
    reqConfig.headers.push({Key: 'accept', Value: 'application/json'});
    reqConfig.headers.push({Key: 'content-type', Value: 'application/json'});
    if (appConfig.Token !== '') {
       reqConfig.headers.push({ Key: 'authorization', Value: `Bearer ${appConfig.Token}`});
    }
    this.http = new HttpRequest(reqConfig);
    this.SelectedProduct = this.createProductPlaceholder();
  }

  getProductById(id: number): AsyncTask<Product> {
    return this.http.get<Product>('products/' + id);
  }

  getProducts(queryParams: string = ''): AsyncTask<Product[]> {
    return this.http.get<Product[]>('products' + (queryParams !== '' ? `?${queryParams}` : ''));
  }

  getCommentsForProductId(productId: number): AsyncTask<IComment[]> {
     return this.http.get<IComment[]>('productComments?productId=' + productId);
  }

  createProductPlaceholder(): Product {
    const product: Product = {
      productId: 0,
      service: '',
      countries: [],
      platforms: new Array<ProductPlatform>(),
      requestDate: DateFormatProvider.toShortDateString(new Date()),
      productType: '',
      caseNumber: '',
      statusCode: 'OPN',
      createdBy: appConfig.CurrentUser?.UID,
      dateCreated: DateFormatProvider.toDateTimeString(new Date()),
      updatedBy: appConfig.CurrentUser?.UID,
      dateUpdated: DateFormatProvider.toDateTimeString(new Date()),
      emitters: new Array<ProductEmitter>()
    };
    return product;
  }

  createProduct(service: string, countries: string[], productType: string, caseNumber: string, comments: string): AsyncTask<Product> {
    const product: Product = {
      productId: 0,
      service: service,
      countries: countries,
      platforms: new Array<ProductPlatform>(),
      requestDate: DateFormatProvider.toShortDateString(new Date()),
      productType: productType,
      caseNumber: caseNumber,
      statusCode: 'OPN',
      createdBy: 'sys',
      dateCreated: DateFormatProvider.toDateTimeString(new Date()),
      updatedBy: 'sys',
      dateUpdated: DateFormatProvider.toDateTimeString(new Date()),
      emitters: new Array<ProductEmitter>()
    };
    
    return this.saveProduct(product);
  }

  importProduct(importedProduct: ProductImport): AsyncTask<Product> {
    const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: endpoints.get('ImportServiceBasePath'), EnableCors: true };
    reqConfig.headers.push({Key: 'accept', Value: 'application/json'});
    reqConfig.headers.push({Key: 'content-type', Value: 'application/json'});
    if (appConfig.Token !== '') {
      reqConfig.headers.push({ Key: 'authorization', Value: `Bearer ${appConfig.Token}`});
    } else {
        console.log('No token found...');
    }
    const httpImporter = new HttpRequest(reqConfig);
    return httpImporter.post<Product>('delivered', JSON.stringify(importedProduct));
  }

  saveProduct(product: Product): AsyncTask<Product> {
    this.prepareForSave(product);
    const productToWrite: WritableProduct = this.productToWritableProduct(product)

    if (product.productId > 0) {
      return this.http.put<Product>(`products/${product.productId}`, JSON.stringify(productToWrite));
    } else {
      return this.http.post<Product>('products', JSON.stringify(productToWrite));
    }
  }

  saveComment(productId: number, text: string): AsyncTask<IComment> {
    const newComment = {
      productId: productId,
      text: text
    };

    return this.http.post<IComment>(`productComments`, JSON.stringify(newComment));
  }

  createProductEmitter(elnot: string = ''): ProductEmitter {
    if (this.SelectedProduct === null || this.SelectedProduct === undefined) { return undefined; }

    const nsa: boolean = this.randomIntFromInterval(0, 1) === 1;
    const dia: boolean = this.randomIntFromInterval(0, 1) === 1;
    const include: boolean = this.randomIntFromInterval(0, 1) === 1;
    const productEmitter: ProductEmitter = {
      name: this.getEmitterName(),
      function: this.getEmitterFunction(),
      elnot: (elnot !== '' ? elnot : this.createElnot()),
      platforms: this.getPlatforms(this.randomIntFromInterval(1, 3)),
      userCountries: this.getCountries(this.randomIntFromInterval(1, 3)),
      includeInProduct: include,
      excludeReason: '',
      owner: (nsa === true && dia === true ? 'B' : (nsa === true ? 'N' : 'D')),
      systemId: '',
      cedId: ''
    };
    this.SelectedProduct.emitters.push(productEmitter);
    this.saveProduct(this.SelectedProduct);
    return productEmitter;
  }

  cloneProduct(p: Product): Product {

    if (p !== undefined && p !== null) {
      return this.clone(p);
    }

    return this.createProductPlaceholder();

  }

  private prepareForSave(product: Product): void {
    product.service = removeEscapeChars(product.service);
    product.productType = removeEscapeChars(product.productType);
    product.caseNumber = removeEscapeChars(product.caseNumber);
    product.statusCode = removeEscapeChars(product.statusCode);
  }
  
  private clone(p: Product): Product {
    const product: Product = {
      productId: p.productId,
      service: p.service,
      countries: [],
      platforms: new Array<ProductPlatform>(),
      requestDate: p.requestDate,
      productType: p.productType,
      caseNumber: p.caseNumber,
      statusCode: p.statusCode,
      createdBy: p.createdBy,
      dateCreated: p.dateCreated,
      updatedBy: p.updatedBy,
      dateUpdated: p.dateUpdated,
      emitters: new Array<ProductEmitter>()
    };

    for (const c of p.countries) {
      product.countries.push(c);
    }

    for (const pf of p.platforms) {
      product.platforms.push(pf);
    }

    for (const e of p.emitters) {
      product.emitters.push(e);
    }

    return product;
  }

  private productToWritableProduct(p: Product): WritableProduct {
    const product: WritableProduct = {
      service: p.service,
      countries: [],
      platforms: new Array<ProductPlatform>(),
      requestDate: p.requestDate,
      productType: p.productType,
      caseNumber: p.caseNumber,
      statusCode: p.statusCode,
      emitters: new Array<ProductEmitter>()
    };

    for (const c of p.countries) {
      product.countries.push(c);
    }

    for (const pf of p.platforms) {
      product.platforms.push(pf);
    }

    for (const e of p.emitters) {
      product.emitters.push(this.emitterToWritableEmitter(e));
    }

    return product;
  }

  private emitterToWritableEmitter(e: ProductEmitter): ProductEmitter {
    const emitter: ProductEmitter = {
      name: e.name,
      function: e.function,
      elnot: e.elnot,
      platforms: new Array<string>(),
      userCountries: new Array<string>(),
      includeInProduct: e.includeInProduct,
      excludeReason: e.excludeReason,
      owner: e.owner,
      systemId: e.systemId,
      cedId: e.cedId
    }

    for (const p of e.platforms) {
      emitter.platforms.push(p);
    }

    for (const c of e.userCountries) {
      emitter.userCountries.push(c);
    }

    return emitter;
  }

  private getEmitterName(): string {
    const emitterNames = ['Emitter1', 'Emitter2', 'Emitter3', 'Emitter4', 'Emitter5', 'Emitter6', 'Emitter7', 'Emitter8', 'Emitter9'];
    return emitterNames[this.randomIntFromInterval(0, emitterNames.length - 1)];
  }

  private getEmitterFunction(): string {
    const emitterFunctions = ['EA', 'EP', 'ES'];
    return emitterFunctions[this.randomIntFromInterval(0, emitterFunctions.length - 1)];
  }

  private getCountries(total: number): string[] {
    const availableCountries = ['BE', 'BR', 'CA', 'DK', 'FR', 'GB'];
    const countries = [];

    for (let r = 1; r <= total && r < availableCountries.length; r++) {
      countries.push(availableCountries[r]);
    }

    return countries;
  }

  private createElnot(): string {
    const chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                   'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    let elnot = '';
    for (let i = 0; i < 5; i++) {
      elnot += chars[this.randomIntFromInterval(0, chars.length - 1)];
    }
    return elnot;
  }

  private getPlatforms(total: number): string[] {
    const availablePlatforms = ['Truck', 'Ship', 'Plane'];
    const platforms = [];

    for (let r = 1; r <= total && r < availablePlatforms.length; r++) {
      platforms.push(availablePlatforms[r]);
    }

    return platforms;
  }

  private createSequentialElnot(idx: number, serialNo: number): string {
    const chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                   'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    let elnot = '';
    const elnotNumber = '01' + serialNo.toString();
    elnot = chars[idx] + elnotNumber;
    return elnot;
  }

  private createSourceID(elnot: string, nsa: boolean, dia: boolean): string {
    if (!nsa && !dia) { return ''; }
    if (!dia && nsa === true) { return elnot; }
    const chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    let sourceID = 'RTRDTSINASIC';
    for (let i = 0; i < 5; i++) {
      sourceID += chars[this.randomIntFromInterval(0, chars.length - 1)];
    }
    return sourceID;
  }

  private randomIntFromInterval(min, max): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

}

export { ProductEditorService };
