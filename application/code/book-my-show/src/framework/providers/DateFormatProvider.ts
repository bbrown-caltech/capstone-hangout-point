class DateFormatProvider {

    constructor() { }
  
    public static dateValid(dateToCheck: any): boolean {
      let result: boolean;
  
      try {
        const date: Date = new Date(dateToCheck);
  
        if (date.toDateString() !== 'Invalid Date') {
          result = true;
        } else {
          result = false;
        }
  
      } catch (err) {
        result = false;
      }
  
      return result;
  
    }
  
    public static currentYear(): string {
      const date: Date = new Date();
      const year: number = date.getFullYear();

      return String(year);

    }

    public static toString(date: Date, format: string): string {
      
      if (format === undefined || format === null || format === '') {
        format = 'YYYY-MM-DD';
      }
      
      if (!DateFormatProvider.dateValid(date)) {
        date = new Date();
      }

      const month: number = date.getMonth() + 1;
      const day: number = date.getDate();
      const year: number = date.getFullYear();
      
      format = format.replace('YYYY', year.toString());
      format = format.replace('MM', ('0' + month).slice(-2));
      format = format.replace('DD', ('0' + day).slice(-2));

      return format;

    }

    public static toSpecialDateString(date: Date): string {
  
        if (!DateFormatProvider.dateValid(date)) {
            date = new Date();
        }
  
        const month: number = date.getMonth() + 1;
        const day: number = date.getDate();
        const year: number = date.getFullYear();
  
        return `${String(year)}${('0' + month).slice(-2)}${('0' + day).slice(-2)}`;
  
    }
  
    public static toShortDateString(date: Date): string {
  
        if (!DateFormatProvider.dateValid(date)) {
            date = new Date();
        }
  
        const month: number = date.getMonth() + 1;
        const day: number = date.getDate();
        const year: number = date.getFullYear();
  
        return ('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year);
  
    }
  
    public static toDateTimeString(date: Date): string {
  
        if (!DateFormatProvider.dateValid(date)) {
            date = new Date();
        }
  
        const month: number = date.getMonth() + 1;
        const day: number = date.getDate();
        const year: number = date.getFullYear();
        const hour: number = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() === 0 ? 12 : date.getHours()));
        const minutes: number = date.getMinutes();
        const meridian: string = (date.getHours() >= 12 ? 'PM' : 'AM');
  
        return ('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) +
                ':' + ('0' + minutes).slice(-2) + ' ' + meridian;
  
    }
  
    public static toLongDateString(date: Date): string {
  
        if (!DateFormatProvider.dateValid(date)) {
            date = new Date();
        }
  
        const month: number = date.getMonth() + 1;
        const day: number = date.getDate();
        const year: number = date.getFullYear();
        const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
  
        return months[month] + ('0' + day).slice(-2) + ', ' + year.toString();
  
    }
  
    public static toLongDateTimeString(date: Date): string {
  
        if (!DateFormatProvider.dateValid(date)) {
            date = new Date();
        }
  
        const month: number = date.getMonth() + 1;
        const day: number = date.getDate();
        const year: number = date.getFullYear();
        const hour: number = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() === 0 ? 12 : date.getHours()));
        const minutes: number = date.getMinutes();
        const meridian: string = (date.getHours() >= 12 ? 'PM' : 'AM');
        const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
        return months[month] + ('0' + day).slice(-2) + ', ' + year.toString() + ' ' + ('0' + hour).slice(-2) +
                                ':' + ('0' + minutes).slice(-2) + ' ' + meridian;
  
    }
  
    public static toTimeString(date: Date): string {
  
        if (!DateFormatProvider.dateValid(date)) {
            date = new Date();
        }
  
        const hour: number = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() === 0 ? 12 : date.getHours()));
        const minutes: number = date.getMinutes();
        const meridian: string = (date.getHours() >= 12 ? 'PM' : 'AM');
  
        return ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian;
  
    }
  
  }
  
  export { DateFormatProvider };
  