import { Dialog } from '../../../framework/decorators/Dialog';
import { DialogBase } from '../../../framework/core/DialogBase';
import { DialogViewParameters } from '../../../framework/models/DialogViewParameters.Interface';


@Dialog({
    selector: 'dashboard',
    BasePath: 'js/application/dialogs/dashboard',
    template: '',
    styles: 'dashboard.dialog.css',
    headerTemplate: 'dashboard.dialog-header.html',
    templates: [
        'dashboard.dialog-view1.html',
        'dashboard.dialog-view2.html'
    ],
    footerTemplate: 'dashboard.dialog-footer.html'
})
class DashboardDialog extends DialogBase {
    
    BindingOne: string = 'This is BindingOne';
    BindingTwo: string = 'This is BindingTwo';
    
    constructor() { super(); }
    
    preOpen() {
        console.log('About to open Dashboard Dialog...');
    }
    
    postOpen() {
        console.log('Dashboard Dialog open and ready for commands...');
    }
    
    /*****************************************************************************************
     *  VIEW 1 CODE
     *****************************************************************************************/
    showDialogOneMessage() {
        alert('Button clicked on dialog view one...');
    }
    
     
    /*****************************************************************************************
     *  VIEW 2 CODE
     *****************************************************************************************/
    showDialogTwoMessage() {
        alert('Button clicked on dialog view two...');
    }
    
}

export { DashboardDialog };