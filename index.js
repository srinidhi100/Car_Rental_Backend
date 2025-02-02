const express = require("express");
const mongoose = require("mongoose");
const BookingInfo = require("./bookingInfo"); // Ensure the path is correct
const CarsInfo = require("./carsInfo");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());


 
const cors = require('cors');

app.use(cors({ origin: '*' }));

const uri = "mongodb+srv://FChutxPqbrbDoasD:FChutxPqbrbDoasD@cluster0.tse0x.mongodb.net/cars?retryWrites=true&w=majority&appName=Cluster0";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(uri, clientOptions);
        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit process if connection fails
    }
}

// Call connectDB and keep the connection open
connectDB();



app.get("/", (req, res) => {
    res.send("Hello Sriiiii");
});


// Create Booking
app.post("/api/bookings", async (req, res) => {
    try {
        console.log("BOOKINGSSS");
        console.log(req.body);
        const booking = new BookingInfo(req.body);
        await booking.save();
        // req.body.carId
        // req.body.journeyDate
        await CarsInfo.findOneAndUpdate({ _id: req.body.carId }, { $push: { bookedDates: req.body.journeyDate } }).exec();
        res.status(201).json({ message: "Booking created successfully", booking });
    } catch (error) {
        console.log("EEEEEEEEEEEEEEEEEEEEE",error);
        res.status(400).json({ error: error.message });
    }
});

// Get All Bookings
app.get("/api/bookings", async (req, res) => {
    try {
        const bookings = await BookingInfo.find();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Single Booking by ID
app.get("/api/bookings/:id", async (req, res) => {
    try {
        const booking = await BookingInfo.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Booking by ID
app.put("/api/bookings/:id", async (req, res) => {
    try {
        const updatedBooking = await BookingInfo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedBooking) return res.status(404).json({ message: "Booking not found" });
        res.status(200).json({ message: "Booking updated successfully", updatedBooking });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete Booking by ID
app.delete("/api/bookings/:id", async (req, res) => {
    try {
        const deletedBooking = await BookingInfo.findByIdAndDelete(req.params.id);
        if (!deletedBooking) return res.status(404).json({ message: "Booking not found" });
        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/cars", async (req, res) => {
    try {
        const cars = await CarsInfo.find();
        res.status(200).json(cars);
        console.log("Fetching cars from the database...",cars);
    } catch (error) {
        console.error("Error fetching cars:", error);
        res.status(500).json({ error: error.message });
    }
})


app.post("/api/find-car", async (req, res) => {
    try {
        const { date } = req.body;

        // Find cars that do NOT have the requested date in their bookedDates array
        const cars = await CarsInfo.find({ bookedDates: { $nin: [date] } });

        res.status(200).json(cars);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE API for canceling a car booking
// app.delete('/api/cancelcars/:carId', async (req, res) => {
//     const { carId } = req.params;
  
//     try {
//       // Find the car by its ID and delete it
//       const car = await Car.findById(carId);
  
//       if (!car) {
//         return res.status(404).json({ message: 'Car not found' });
//       }
  
//       // If the car exists, remove it
//       await Car.findByIdAndDelete(carId);
//       res.status(200).json({ message: 'Booking canceled successfully' });
//     } catch (error) {
//       console.error('Error canceling booking:', error);
//       res.status(500).json({ message: 'Failed to cancel booking' });
//     }
//   });



// Start server only after MongoDB connects
mongoose.connection.once("open", () => {
    console.log("MongoDB connection established. Starting server...");
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
