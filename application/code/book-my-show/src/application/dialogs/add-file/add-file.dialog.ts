import { Dialog } from '../../../framework/decorators/Dialog';
import { DialogBase } from '../../../framework/core/DialogBase';

import { IFile } from '../../models/product/ProductFiles.Interface';

@Dialog({
    selector: 'add-file',
    BasePath: 'js/application/dialogs/add-file',
    template: '',
    styles: 'add-file.dialog.css',
    headerTemplate: 'add-file.dialog-header.html',
    templates: [
        'add-file.dialog-view.html'
    ],
    footerTemplate: 'add-file.dialog-footer.html'
})
class AddFileDialog extends DialogBase {
    
    selectedFile = '';
    selectedFileData = '';
    
    constructor() { super(); }
    
    preOpen() {
        const self = this;
        console.log(self);
    }
    
    postOpen() {
        const self = this;
        console.log(self);
    }
    
    /*****************************************************************************************
     *  SELECT IMPORT FILE METHOD
     *****************************************************************************************/
    selectFile() {
        const self = this;
        const fileInput: HTMLInputElement = document.getElementById("fileInput") as HTMLInputElement;
        
        fileInput.onchange = (evt: Event) => {
            const input: HTMLInputElement = evt.target as HTMLInputElement;
            
            if (typeof FileReader !== undefined && input.files !== null && input.files !== undefined && input.files.length > 0) {
                self.selectedFile = input.files[0].name;
          
                const reader: FileReader = new FileReader();
                const blob: Blob = input.files[0];
          
                reader.onloadend = () => {
                  const base64data = reader.result.toString().split(',')[1];
                  const file: IFile = {
                    name: self.selectedFile,
                    fileType: 'File Type 1',
                    fileData: base64data
                  }
                  self.complete(file);
                };
          
                reader.readAsDataURL(blob);
          
              } else {
                console.log('No file selected...');
              }
        };
        
        fileInput.click();
        
    }
    
}

export { AddFileDialog };