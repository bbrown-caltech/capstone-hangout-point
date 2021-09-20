import { Dialog } from '../../../framework/decorators/Dialog';
import { DialogBase } from '../../../framework/core/DialogBase';

@Dialog({
    selector: 'user-prompt',
    BasePath: 'js/application/dialogs/user-prompt',
    template: '',
    styles: 'user-prompt.dialog.css',
    headerTemplate: 'user-prompt.dialog-header.html',
    templates: [
        'user-prompt.dialog-view.html'
    ],
    footerTemplate: 'user-prompt.dialog-footer.html'
})
class UserPromptDialog extends DialogBase {
    
    constructor(private message: string) { super(); }
    
    preOpen() {
        const self = this;
        // console.log(self);
    }
    
    postOpen() {
        const self = this;
        
        setTimeout(() => {
          const messageContainer: HTMLDivElement = document.getElementById('messageContainer') as HTMLDivElement;
          messageContainer.innerHTML = self.message;
        }, 500);
        
    }
    
    /*****************************************************************************************
     *  SELECT IMPORT FILE METHOD
     *****************************************************************************************/
     selectYes() {
      this.complete(undefined);
    }
    
}

export { UserPromptDialog };