import { BindingElement } from './BindingElement.Interface';

interface DialogView {
    View: Node;
    ClickNodes: Element[];
    Bindings: BindingElement[];
}

interface DialogViewParameters {
    Selector: string;
    Views: DialogView[];
    Header: DialogView;
    Footer: DialogView;
}

export { DialogViewParameters, DialogView };
