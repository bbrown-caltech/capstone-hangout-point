import { BoundFieldBase } from './BoundField';

class BoundSelectField extends BoundFieldBase {
    SelectField: HTMLSelectElement;
    Options: HTMLOptionElement[];

    constructor(scope: Object, field: HTMLElement) {
        super(scope, field);

        var that = this,
        currentValue: any, // = that.Model[that.PropertyName],
        settingValue: boolean = false;

        that.SelectField = <HTMLSelectElement>field;
        that.SelectField.selectedIndex = -1;
        that.Options = new Array<HTMLOptionElement>();

        //  Get the Current Options so We Can Determine When They Change
        for (var i: number = 0; i < that.SelectField.options.length; i++) {
			var opt: HTMLOptionElement = <HTMLOptionElement>that.SelectField.options[i];
			that.Options.push(opt);
        }

        //  Update the Value Property Value of Model
        that.SelectField.onchange = (ev: Event) => {
			settingValue = true;

			if (that.Get) {
				that.Model[that.PropertyName] = that.Get();
				currentValue = that.Model[that.PropertyName];
			} else {
				that.Model[that.PropertyName] = that.Cast(this.removeEscapeChars(that.SelectField.value), that.DataType);
				currentValue = that.Model[that.PropertyName];
			}

			settingValue = false;

        }

        //  Monitor Option Changes & Changes in the Property Value of the Model
        setInterval(() => {

			if (!settingValue) {

				that.Model = that.GetObject(that.FullModel);
				const setIndex = (sel: HTMLSelectElement, val: string) => {
					for (let i: number = 0; i < sel.options.length; i++) {
						if (sel.options[i].value === val) {
							sel.selectedIndex = i;
							break;
						}
					}
				};

				if (that.OptionsChanged(that.Options)) {
					that.SelectField.selectedIndex = -1;
					that.Options = new Array<HTMLOptionElement>();

					for (var i: number = 0; i < that.SelectField.options.length; i++) {
						var opt: HTMLOptionElement = <HTMLOptionElement>that.SelectField.options[i];
						that.Options.push(opt);
					}

					setIndex(that.SelectField, this.removeEscapeChars(that.Model[that.PropertyName]));

				}

				if (that.Model[that.PropertyName] !== currentValue) {
					setIndex(that.SelectField, this.removeEscapeChars(that.Model[that.PropertyName]));
					currentValue = that.Model[that.PropertyName];
				}

			}

        }, 1000);

    }

    //  Determines if the Options in the Select Element Have Changed
    OptionsChanged(opts: HTMLOptionElement[]): boolean {

        if ((this.SelectField.options && this.SelectField.options.length) && (opts && opts.length)) {

			if (this.SelectField.options.length === opts.length) {

				for (var i: number = 0; i < opts.length; i++) {
					var opt1: HTMLOptionElement = opts[i];
					var elementFound: boolean = false;

					for (var j: number = 0; j < this.SelectField.options.length; j++) {
						var opt2: HTMLOptionElement = <HTMLOptionElement>this.SelectField.options[j];

						if (opt1.isSameNode(opt2))
						{
						elementFound = true;
						break;
						}

					}

					if (!elementFound) {
						return true;
					}

				}

				return false;

			} else {
				return true;
			}

        }

        return true;

    }

}

export { BoundSelectField };
