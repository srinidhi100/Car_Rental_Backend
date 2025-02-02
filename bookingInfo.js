const mongoose = require("mongoose");

const bookingInfoSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    fromAddress: { type: String, required: true },
    toAddress: { type: String, required: true },
    passengers: { type: String, required: true },
    luggage: { type: String, required: true },
    journeyDate: { type: Date, required: true },
    journeyTime: { type: String, required: true },
    notes: { type: String, default: "" },
    carId: { type: String, required: true },
    paymentMethod: { type: String, enum: ["Cheque Payment", "Credit Card", "Cash", "Online","Direct Bank Transfer","Master Card","Paypal"], required: true }
}, { timestamps: true });

const BookingInfo = mongoose.model("bookinginfo", bookingInfoSchema);

module.exports = BookingInfo;
