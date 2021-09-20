import { BindingElement } from './BindingElement.Interface';

interface ViewParameters {
    Selector: string;
    View: Node;
    ClickNodes: Element[];
    Bindings: BindingElement[];
}

export { ViewParameters };
