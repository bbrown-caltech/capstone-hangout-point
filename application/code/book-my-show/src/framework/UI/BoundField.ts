
import { DataTypeArgs, DataTypeCollection } from '../core/Application';

interface IBoundField {
    //  Data Type of the Bound Field
    DataType: DataTypeArgs;
    //  The HTML Field the Model is Bound to
    Field: HTMLElement;
    //  The Name of the Property Holding the Value of the HTML Field
    PropertyName: string;
    //  The Object Containing the Property Holding the Value of the HTML Field
    Model: Object;
    //  The Scope Containing the Model
    Scope: Object;
    //  Method Called in Order to Set the Value of the Model Field
    Get: () => any;
    //  Method Called in Order to Set the Value of the HTML Field
    Set: (fld: HTMLElement, value: Object) => void;
}

class BoundFieldBase implements IBoundField {
    //  Data Type of the Bound Field
    DataType: DataTypeArgs;
    //  The HTML Field the Model is Bound to
    Field: HTMLElement;
    //  The Name of the Property Holding the Value of the HTML Field
    PropertyName: string;
    //  The Object Containing the Property Holding the Value of the HTML Field
    Model: Object;
    FullModel: string;
    //  The Scope Containing the Model
    Scope: Object;
    //  Method Called in Order to Set the Value of the Model Field
    Get: () => any;
    //  Method Called in Order to Set the Value of the HTML Field
    Set: (fld: HTMLElement, value: Object) => void;

    constructor(scope: Object, field: HTMLElement) {
        var that = this;

        that.Scope = scope;
        that.Field = field;

        var bindingParams: string[] = that.Field.getAttribute('binding').split(';');

        if (bindingParams && bindingParams.length > 0) {
            var dataTypeValue: string = <string>that.GetParameterValue("DATATYPE", bindingParams);
            var modelValue: string = <string>that.GetParameterValue("MODEL", bindingParams);
            var defaultValue: string = <string>that.GetParameterValue("DEFAULTVALUE", bindingParams);
            var getValue: string = <string>that.GetParameterValue("GET", bindingParams);
            var setValue: string = <string>that.GetParameterValue("SET", bindingParams);

            //  Ensures the Data Type is properly defined and sets the DataType value
            that.DataType = (DataTypeCollection.Instance()[dataTypeValue.toUpperCase()] !== undefined ? DataTypeCollection.Instance()[dataTypeValue.toUpperCase()] : DataTypeArgs.String);

            that.FullModel = modelValue;

            that.SetDefaultValue(modelValue, defaultValue, that.DataType);

            if (that.Scope[getValue] !== undefined) {
                that.Get = that.Scope[getValue];
            }

            if (that.Scope[setValue] !== undefined) {
                that.Set = that.Scope[setValue];
            }

        }

    }

    //  Ensures the Model Exists and Sets the Default Value if Needed
    SetDefaultValue(model: string, defaultValue: string, dataType: DataTypeArgs): void {

        if (model.indexOf(".") > -1) {
            var parts = model.split(".");

            switch (parts.length) {
                case 2:
                    if (!this.Scope[parts[0]]) {
                        this.Scope[parts[0]] = new Object();
                    }

                    this.Model = this.Scope[parts[0]];
                    this.PropertyName = parts[1];

                    if (!this.Model[this.PropertyName]) {
                        this.Model[this.PropertyName] = this.removeEscapeChars(this.Cast(defaultValue, dataType, this.Model[this.PropertyName]));
                    }

                    break;
                case 3:
                    if (!this.Scope[parts[0]]) {
                        this.Scope[parts[0]] = new Object();
                    }

                    if (!this.Scope[parts[0]][parts[1]]) {
                        this.Scope[parts[0]][parts[1]] = new Object();
                    }

                    this.Model = this.Scope[parts[0]][parts[1]];
                    this.PropertyName = parts[2];

                    if (!this.Model[this.PropertyName]) {
                        this.Model[this.PropertyName] = this.removeEscapeChars(this.Cast(defaultValue, dataType, this.Model[this.PropertyName]));
                    }

                    break;
                case 4:
                    if (!this.Scope[parts[0]]) {
                        this.Scope[parts[0]] = new Object();
                    }

                    if (!this.Scope[parts[0]][parts[1]]) {
                        this.Scope[parts[0]][parts[1]] = new Object();
                    }

                    if (!this.Scope[parts[0]][parts[1]][parts[2]]) {
                        this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                    }

                    this.Model = this.Scope[parts[0]][parts[1]][parts[2]];
                    this.PropertyName = parts[3];

                    if (!this.Model[this.PropertyName]) {
                        this.Model[this.PropertyName] = this.removeEscapeChars(this.Cast(defaultValue, dataType, this.Model[this.PropertyName]));
                    }

                    break;
                case 5:
                    if (!this.Scope[parts[0]]) {
                        this.Scope[parts[0]] = new Object();
                    }

                    if (!this.Scope[parts[0]][parts[1]]) {
                        this.Scope[parts[0]][parts[1]] = new Object();
                    }

                    if (!this.Scope[parts[0]][parts[1]][parts[2]]) {
                        this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                    }

                    if (!this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]) {
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = new Object();
                    }

                    this.Model = this.Scope[parts[0]][parts[1]][parts[2]][parts[3]];
                    this.PropertyName = parts[4];

                    if (!this.Model[this.PropertyName]) {
                        this.Model[this.PropertyName] = this.removeEscapeChars(this.Cast(defaultValue, dataType, this.Model[this.PropertyName]));
                    }

            }

        } else {

            this.Model = this.Scope;
            this.PropertyName = model;

            if (!this.Model[this.PropertyName]) {
                this.Model[this.PropertyName] = this.Cast(defaultValue, dataType, this.removeEscapeChars(this.Model[this.PropertyName]));
            }

        }

    }

    GetObject(model: string): Object {
        var obj: Object;

        if (model.indexOf(".") > -1) {
            var parts = model.split(".");

            switch (parts.length) {
                case 2:
                    if (!this.Scope[parts[0]]) {
                        this.Scope[parts[0]] = new Object();
                    }

                    obj = this.Scope[parts[0]];

                    break;
                case 3:
                    if (!this.Scope[parts[0]]) {
                        this.Scope[parts[0]] = new Object();
                    }

                    if (!this.Scope[parts[0]][parts[1]]) {
                        this.Scope[parts[0]][parts[1]] = new Object();
                    }

                    obj = this.Scope[parts[0]][parts[1]];

                    break;
                case 4:
                    if (!this.Scope[parts[0]]) {
                        this.Scope[parts[0]] = new Object();
                    }

                    if (!this.Scope[parts[0]][parts[1]]) {
                        this.Scope[parts[0]][parts[1]] = new Object();
                    }

                    if (!this.Scope[parts[0]][parts[1]][parts[2]]) {
                        this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                    }

                    obj = this.Scope[parts[0]][parts[1]][parts[2]];

                    break;
                case 5:
                    if (!this.Scope[parts[0]]) {
                        this.Scope[parts[0]] = new Object();
                    }

                    if (!this.Scope[parts[0]][parts[1]]) {
                        this.Scope[parts[0]][parts[1]] = new Object();
                    }

                    if (!this.Scope[parts[0]][parts[1]][parts[2]]) {
                        this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                    }

                    if (!this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]) {
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = new Object();
                    }

                    obj = this.Scope[parts[0]][parts[1]][parts[2]][parts[3]];

                    break;
            }

        } else {

            obj = this.Scope;

        }

        return obj;

    }

    //  Converts the Value of value Consistent with dataType
    Cast(value: string, dataType: DataTypeArgs, currentValue: any = undefined): any {

        //  Numeric Field
        if (dataType === DataTypeArgs.Int || dataType === DataTypeArgs.Float) {

            if (!isNaN(dataType === DataTypeArgs.Int ? parseInt(value) : parseFloat(value))) {
                return (dataType === DataTypeArgs.Int ? parseInt(value) : parseFloat(value));
            } else if (currentValue !== undefined && !isNaN(dataType === DataTypeArgs.Int ? parseInt(currentValue) : parseFloat(currentValue))) {
                return (dataType === DataTypeArgs.Int ? parseInt(currentValue) : parseFloat(currentValue));
            } else {
                return 0;
            }

        }

        //  Date/Time Field
        if ((value !== undefined && value !== null && ((new Date(value)).toDateString() !== "Invalid Date" || (new Date("1/1/1900 " + value)).toDateString() !== "Invalid Date")) && (dataType === DataTypeArgs.Date || dataType === DataTypeArgs.Time || dataType === DataTypeArgs.DateTime)) {
            var sDate: string = (dataType === DataTypeArgs.Time ? "1/1/1900 " + value : value);
            var date: Date = (value.toUpperCase() === "TODAY" ? new Date() : new Date(sDate));

            if (date.toDateString() !== "Invalid Date") {
                var month: number = date.getMonth() + 1,
                day = date.getDate(),
                year = date.getFullYear(),
                hour: number = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())),
                minutes: number = date.getMinutes(),
                seconds: number = date.getSeconds(),
                meridian: string = (date.getHours() >= 12 ? "PM" : "AM");

                if (dataType === DataTypeArgs.Date) {
                    return new String(("0" + month).slice(-2) + "/" + ("0" + day).slice(-2) + "/" + String(year));
                }

                if (dataType === DataTypeArgs.Time) {
                    hour = date.getHours();

                    return new String(("0" + hour).slice(-2) + ":" + ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2));
                }

                if (dataType === DataTypeArgs.DateTime) {
                    return new String(("0" + month).slice(-2) + "/" + ("0" + day).slice(-2) + "/" + String(year) + " " + ("0" + hour).slice(-2) + ":" + ("0" + minutes).slice(-2) + " " + meridian);
                }

            }

        }

        //  Boolean Field
        if (dataType === DataTypeArgs.Boolean) {

            if (value !== undefined && value !== null) {

                if (typeof value === "boolean") {
                    return value;
                }

                if (typeof value === "object" && Object.prototype.toString.call(value) === "[object Boolean]") {
                    return value;
                }

                if ((value === "true") === true || (value === "false") === true) {
                    return new Boolean(value);
                }

            } else if (currentValue !== undefined && currentValue !== null) {

                if (typeof currentValue === "boolean") {
                    return currentValue;
                }

                if (typeof currentValue === "object" && Object.prototype.toString.call(currentValue) === "[object Boolean]") {
                    return currentValue;
                }

                if ((currentValue === "true") === true || (currentValue === "false") === true) {
                    return new Boolean(currentValue);
                }

            } else {
                return false;
            }

        }

        //  String Field
        if (dataType === DataTypeArgs.String) {
            return new String((value !== undefined ? encodeURIComponent(value) : ""));
        }

    }

    //  Gets the Value of the Named Parameter
    GetParameterValue(name: string, params: string[]): any {

        for (var i: number = 0; i < params.length; i++) {
            var param: string[] = params[i].split(":");

            if (param && param.length === 2) {

                if (param[0].trim().toUpperCase() === name.toUpperCase()) {
                    return param[1].trim();
                }

            }

        }

        return undefined;

    }

    protected removeEscapeChars(text: string): string {
        try
        {
            return decodeURIComponent(text);
        }
        catch (e)
        {
            return text;
        }
    };
    
}

export { IBoundField, BoundFieldBase };
