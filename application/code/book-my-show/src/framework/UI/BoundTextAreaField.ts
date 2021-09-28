import { BoundFieldBase } from './BoundField';

class BoundTextAreaField extends BoundFieldBase {
    InputField: HTMLTextAreaElement;

    constructor(scope: Object, field: HTMLElement) {
        super(scope, field);

        var that = this,
            currentValue: any = that.Model[that.PropertyName],
            settingValue: boolean = false;

        that.InputField = <HTMLTextAreaElement>field;
        that.InputField.value = this.removeEscapeChars(that.Model[that.PropertyName]);

        //  Update Model Property Value When Key Pressed
        that.InputField.onkeyup = (ev: KeyboardEvent) => {
            settingValue = true;

            if (that.Get !== undefined) {
                that.Model[that.PropertyName] = that.Get();
                currentValue = that.Model[that.PropertyName];
            } else {
                that.Model[that.PropertyName] = that.Cast(that.InputField.value, that.DataType);
                currentValue = that.Model[that.PropertyName];
            }

            settingValue = false;

        }

        //  Update Model Property Value When Value Changed
        that.InputField.onchange = (ev: Event) => {
            settingValue = true;

            if (that.Get !== undefined) {
                that.Model[that.PropertyName] = that.Get();
                currentValue = that.Model[that.PropertyName];
            } else {
                that.Model[that.PropertyName] = that.Cast(that.InputField.value, that.DataType);
                currentValue = that.Model[that.PropertyName];
            }

            settingValue = false;

        }

        //  Monitor Option Changes & Changes in the Property Value of the Model
        setInterval(() => {

            if (!settingValue) {

                that.Model = that.GetObject(that.FullModel);

                if (that.Model[that.PropertyName] !== currentValue) {

                    if (that.Set !== undefined) {
                        that.Set(that.InputField, that.Model);
                    } else {
                        that.InputField.value = this.removeEscapeChars(that.Model[that.PropertyName]);
                    }

                    currentValue = that.Model[that.PropertyName];
                }

            }

        }, 500);

    }

}

export { BoundTextAreaField };
