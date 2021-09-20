import { Type } from '../decorators/Type';
/// <reference path="../../../node_modules/reflect-metadata/Reflect.d.ts" />

const Injector = new class {
    resolve<T>(target: Type<any>): T {
        // console.log('Inside injector...');
        let tokens = Reflect.getMetadata('design:paramtypes', target) || [],
            injections = tokens.map(token => Injector.resolve<any>(token));
        // console.log('Back Inside injector...');
        // console.log('Target', target);
        // console.log('Tokens', tokens);
        // console.log('Injections', injections);
        return new target(...injections);
    }  
};

export { Injector };