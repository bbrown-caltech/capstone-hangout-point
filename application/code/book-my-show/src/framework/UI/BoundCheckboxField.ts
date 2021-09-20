import { BoundFieldBase } from './BoundField';

class BoundCheckBoxField extends BoundFieldBase {
    CheckBox: HTMLInputElement;

    constructor(scope: Object, field: HTMLElement) {
        super(scope, field);

        var that = this,
            currentValue: any = that.Model[that.PropertyName],
            settingValue: boolean = false;

        that.CheckBox = <HTMLInputElement>field;

        if (that.Set !== undefined) {
            that.Set(that.CheckBox, that.Model);
        } else {
            that.CheckBox.checked = that.Cast(that.Model[that.PropertyName], that.DataType);
        }

        //  Update Model Property Value When Key Pressed
        that.CheckBox.onclick = (ev: MouseEvent) => {
            settingValue = true;

            if (that.Get !== undefined) {
                that.Model[that.PropertyName] = that.Get();
                currentValue = that.Cast(that.Model[that.PropertyName], that.DataType);
            } else {
                that.Model[that.PropertyName] = that.CheckBox.checked;
                currentValue = that.Cast(that.Model[that.PropertyName], that.DataType);
            }

            settingValue = false;

        }

        //  Monitor Option Changes & Changes in the Property Value of the Model
        setInterval(() => {

            if (!settingValue) {

                that.Model = that.GetObject(that.FullModel);

                if (that.Model[that.PropertyName] !== currentValue) {

                    if (that.Set !== undefined) {
                            that.Set(that.CheckBox, that.Model);
                    } else {
                            that.CheckBox.checked = that.Cast(that.Model[that.PropertyName], that.DataType);
                    }

                    currentValue = that.Cast(that.Model[that.PropertyName], that.DataType);
                }

            }

        }, 500);

     }

}

export { BoundCheckBoxField };
