const mongoose = require("mongoose");

const carsInfoSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    brand: { type: String, required: true },
    rating: { type: Number, required: true },
    carName: { type: String, required: true },
    imgUrl: { type: String, required: true },
    model: { type: String, required: true },
    price: { type: Number, required: true },
    speed: { type: String, required: true },
    gps: { type: String, required: true },
    seatType: { type: String, required: true },
    bookedDates: { type: [String], required: true },
    automatic: { type: String, required: true },
    description: { type: String, required: true }
});

// const CarsInfo = mongoose.model("carscollection", carsInfoSchema);
const CarsInfo = mongoose.model("CarsInfo", carsInfoSchema, "carscollection");


module.exports = CarsInfo;

