import { View } from '../../../framework/decorators/View';
import { DateFormatProvider } from '../../../framework/providers/DateFormatProvider';
import { Paginator } from '../../../framework/core/Paginator';
import { ViewModel } from '../../../framework/core/ViewModel';
import { RepeatingDataView } from '../../../framework/core/RepeatingDataView';
import { ResourceDictionary } from '../../../framework/core/ResourceDictionary';

import { Pikaday } from '../../../libs/pikaday/pikaday';
import { PikadayOptions } from '../../../libs/pikaday/options';

import { appConfig } from '../../config';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/Booking.Interface';

@View({
    selector: 'booking-editor',
    BasePath: 'js/application/views/booking-editor',
    template: 'booking-editor.view.html',
    styles: 'booking-editor.view.css'
})
class BookingEditor extends ViewModel {
    private bookings: Booking[];
    
    private customerName: HTMLInputElement;
    private showName: HTMLInputElement;
    private showDate: HTMLInputElement;
    private totalTickets: HTMLInputElement;
    
    recentBookings: RepeatingDataView;
    private bookingPaginator: Paginator;
    
    constructor(private bookingEditor: BookingService) { super(); }
    
    preInit(): void {
        const self = this;
        this.bookingEditor.getBookings()
        .completed((result: Booking[]) => {
            console.info('Get Bookings: ', result);
            self.bookings = result;
        }).exception((error: any) => {
           console.log('Booking Editor Pre-Init: Get Bookings', error); 
        });
    }
    
    postInit(): void {
        const self = this;
        
        setTimeout(() => {
            
            self.bookingPaginator = new Paginator('paginator');
            self.bookingPaginator.setPageSize(5);
            
            const transforms: ResourceDictionary = new ResourceDictionary();
            transforms.add('showDate', self.normalizedDate);
            self.recentBookings = new RepeatingDataView('recentBookings', {
                scope: self,
                dataSet: self.bookings,
                transformFunctions: transforms,
                paginator: self.bookingPaginator,
                filter: undefined,
                sorter: undefined
            });
            
            
            self.customerName = document.getElementById('customerName') as HTMLInputElement;
            self.showName = document.getElementById('showName') as HTMLInputElement;
            self.showDate = document.getElementById('showDate') as HTMLInputElement;
            self.totalTickets = document.getElementById('totalTickets') as HTMLInputElement;
            const pikadayOptions: PikadayOptions = {
                field: self.showDate,
                format: 'MM-DD-YYYY',
                formatStrict: true,
                onSelect: (date: Date) => {
                    self.showDate.value = DateFormatProvider.toString(date, 'MM-DD-YYYY');
                }
            };
            const pikaday: Pikaday = new Pikaday(pikadayOptions);
            
        }, 400);
        
        
    }
    
    
    addBooking() {
        const self = this;
        const booking: Booking = {
            _id: '',
            customerName: this.customerName.value,
            showName: this.showName.value,
            showDate: new Date(this.showDate.value),
            totalTickets: parseInt(this.totalTickets.value)
        };
        
        this.bookingEditor.saveBooking(booking)
        .completed((result: Booking) => {
            console.info('Booking Saved: ', result);
            self.bookings.push(result);
            self.bookingPaginator.setData(self.bookings);
            self.resetBooking();
            console.info('Bookings Refreshed: ', self.bookings);
        }).exception((error: any) => {
            console.error('Save Booking Exception: ', error);
        });
        
    }
    
    resetBooking() {
        this.customerName.value = '';
        this.showName.value = '';
        this.showDate.value = DateFormatProvider.toString(new Date(), 'MM-DD-YYYY');
        this.totalTickets.value = '0';
        this.customerName.focus();
    }
    
    
    /**************************************************************************************************************
     *  DATA TRANSFORMATION METHODS
     **************************************************************************************************************/
    normalizedDate(date: string): string {
        return DateFormatProvider.toShortDateString(new Date(date));
    }

}

export { BookingEditor };
