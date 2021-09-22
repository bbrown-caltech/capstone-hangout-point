const mongoose = require('mongoose');

var MONGO_URI = process.env.MONGO_URI;
MONGO_URI = (!MONGO_URI ? 'mongodb://localhost:27017/bookmytrip' : MONGO_URI);

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URI);
}

const BookingSchema = new mongoose.Schema({
    customerName: String,
    showName: String,
    showDate: Date,
    totalTickets: Number
});

const Booking = new mongoose.model('Booking', BookingSchema);
module.exports = Booking;


/*
docker run -d --rm --name mongodb \
-v /root/projects/caltech/data:/data/db \
-v /root/projects/caltech/data/database_init.js:/docker-entrypoint-initdb.d/database_init.js \
-p "27017:27017" \
bitnami/mongodb:4.4.8
*/