import { BoundCheckBoxField } from './BoundCheckboxField';
import { IBoundField } from './BoundField';
import { BoundInputField } from './BoundInputField';
import { BoundSelectField } from './BoundSelectField';
import { BoundTextAreaField } from './BoundTextAreaField';

class BoundFieldFactory {
    
    //  Creates an Inherited Instance of BoundFieldBase Based on the Element Tag,
    //  and in the Case of INPUT Fields, the Field Type
    static CreateBoundField = (scope: Object, field: HTMLElement): IBoundField => {

        if (scope === undefined || field === undefined) {
            return undefined;
        }

        switch (field.tagName.toUpperCase()) {
            case "SELECT":
                return new BoundSelectField(scope, field);
            case "INPUT":
                var tagType: string = (<any>field).type;

                if (tagType.toUpperCase() === "CHECKBOX") {
                    return new BoundCheckBoxField(scope, field);
                } else {
                    return new BoundInputField(scope, field);
                }

            case "TEXTAREA":
                return new BoundTextAreaField(scope, field);
        }

    }

}

export { BoundFieldFactory };
