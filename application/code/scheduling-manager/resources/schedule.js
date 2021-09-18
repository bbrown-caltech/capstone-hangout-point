const mongoose = require('mongoose');

var express = require('express');
var router = express.Router();

module.exports = router;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var MONGO_URI = process.env.MONGO_URI;
MONGO_URI = (!MONGO_URI ? 'mongodb://localhost:27017/bookmytrip' : MONGO_URI);

main().catch(err => console.log(err));

/***
 * Connect to Mongo Instance
 */
async function main() {
  await mongoose.connect(MONGO_URI);
}

/***
 * Connect to Mongo Instance
 */
const BookingSchema = new mongoose.Schema({
    customerName: String,
    showName: String,
    showDate: Date,
    totalTickets: Number
});

/***
 * Connect to Mongo Instance
 */
const BookingModel = new mongoose.model('booking', BookingSchema, 'booking');


/***
 * Get All Bookings
 */
router.get('/', async function(req, res) {
    var bookings = await BookingModel.find();
    
    res.status(200).json(bookings);
});

/***
 * Create New Booking Instance
 */
router.post('/', async function(req, res) {
    var booking = new BookingModel({
        customerName: req.body.customerName,
        showName: req.body.showName,
        showDate: req.body.showDate,
        totalTickets: req.body.totalTickets
    });
    await booking.save();
    
    console.log('Returning response...');
    res.status(201).json({
        message: 'Booking Created',
        obj: booking
    });
});

/***
 * Get Booking Instance by ObjectID
 */
router.get('/:bookingId', async function(req, res) {
    var _id = new mongoose.Types.ObjectId(req.params.bookingId);
    var bookings = await BookingModel.find({ _id: _id });
    
    res.status(200).json(bookings);
});


/***
 * Update Booking Instance by ObjectID
 */
router.put('/:bookingId', async function(req, res) {
    var transactionCompleted = false;
    var statusCode = 201;
    var message = 'Booking Updated';
    var obj = undefined;
    
    BookingModel.findById(req.params.bookingId, async function(err, booking) {
        if (!booking) {
            statusCode = 400;
            message = 'Update Failed.';
            obj = err;
            transactionCompleted = true;
        } else {
            booking.customerName = req.body.customerName;
            booking.showName = req.body.showName;
            booking.showDate = req.body.showDate;
            booking.totalTickets = req.body.totalTickets;
            
            await booking.save(function(saveErr) {
                if (err) {
                    statusCode = 400;
                    message = 'Update Failed.';
                    obj = err;
                } else {
                    obj = booking;
                }
                transactionCompleted = true;
            });
        }
    });
        
    while (transactionCompleted===false) {
        await sleep(1000);
    }
    
    res.status(statusCode).json({
        message: message,
        obj: obj
    });
});


/***
 * Delete Booking Instance by ObjectID
 */
router.delete('/:bookingId', async function(req, res) {
    var _id = req.params.bookingId;
    var result = await BookingModel.deleteOne({ _id: _id });
    res.status(201).json({
        message: `(${result.deletedCount}) Records(s) Deleted`
    });
});
