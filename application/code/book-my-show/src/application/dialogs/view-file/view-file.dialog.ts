import { Dialog } from '../../../framework/decorators/Dialog';
import { DialogBase } from '../../../framework/core/DialogBase';

import { IFile } from '../../models/product/ProductFiles.Interface';

@Dialog({
    selector: 'view-file',
    BasePath: 'js/application/dialogs/view-file',
    template: '',
    styles: 'view-file.dialog.css',
    headerTemplate: 'view-file.dialog-header.html',
    templates: [
        'view-file.dialog-view.html'
    ],
    footerTemplate: 'view-file.dialog-footer.html'
})
class ViewFileDialog extends DialogBase {
    
    constructor(private selectedFile: IFile) { super(); }
    
    preOpen() {
        const self = this;
        console.log(self);
    }
    
    postOpen() {
        const self = this;
        const fileViewHeader: HTMLSpanElement = document.getElementById('fileViewHeader') as HTMLSpanElement;
        const downloadPanel: HTMLSpanElement = document.getElementById('downloadPanel') as HTMLSpanElement;
        const viewPanel: HTMLDivElement = document.getElementById('viewPanel') as HTMLDivElement;
        const doc = document.createElement('object');
        const link: HTMLAnchorElement = document.createElement('a');
        
        fileViewHeader.innerHTML = 'Viewing File: ' + this.selectedFile.name;
        
        doc.style.width = '100%';
        doc.style.height = '642pt';
        doc.type = 'application/pdf';
        doc.data = 'data:application/pdf;base64,' + this.selectedFile.fileData;
        
        link.innerHTML = 'Download';
        link.download = this.selectedFile.name;
        link.href = 'data:application/octet-stream;base64,' + this.selectedFile.fileData;
        
        downloadPanel.appendChild(link);
        viewPanel.appendChild(doc);
        
    }
    
    cancel() {
      const fileViewHeader: HTMLSpanElement = document.getElementById('fileViewHeader') as HTMLSpanElement;
      const downloadPanel: HTMLSpanElement = document.getElementById('downloadPanel') as HTMLSpanElement;
      const viewPanel: HTMLDivElement = document.getElementById('viewPanel') as HTMLDivElement;
      
      fileViewHeader.innerHTML = 'Viewing File:';
        
      while (downloadPanel.children.length > 0) {
        downloadPanel.removeChild(downloadPanel.children.item(0));
      }
      
      while (viewPanel.children.length > 0) {
        viewPanel.removeChild(viewPanel.children.item(0));
      }
      
      super.cancel();
      
  }
  
}

export { ViewFileDialog };