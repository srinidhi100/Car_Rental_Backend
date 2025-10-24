const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Models
const BookingInfo = require("./bookingInfo");
const CarsInfo = require("./carsInfo");
const UserInfo = require("./userInfo");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

// MongoDB connection
const uri = "mongodb+srv://FChutxPqbrbDoasD:FChutxPqbrbDoasD@cluster0.tse0x.mongodb.net/cars?retryWrites=true&w=majority&appName=Cluster0";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function connectDB() {
  try {
    await mongoose.connect(uri, clientOptions);
    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

connectDB();

// --- AUTHENTICATION MIDDLEWARE ---
function authenticate(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, "secret_key"); // Use env var in production
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
}

// --- SIGNUP API ---
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await UserInfo.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists. Please login." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserInfo({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- LOGIN API ---
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserInfo.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found. Please sign up." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id, email: user.email }, "secret_key", { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Default Route ---
app.get("/", (req, res) => {
  res.send("🚗 Car Rental Backend is running...");
});

// --- Create Booking (protected) ---
app.post("/api/bookings", authenticate, async (req, res) => {
  try {
    const booking = new BookingInfo(req.body);
    await booking.save();

    await CarsInfo.findOneAndUpdate(
      { _id: req.body.carId },
      { $push: { bookedDates: req.body.journeyDate } }
    ).exec();

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- Get All Bookings ---
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await BookingInfo.find();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Get Single Booking by ID ---
app.get("/api/bookings/:id", async (req, res) => {
  try {
    const booking = await BookingInfo.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Update Booking ---
app.put("/api/bookings/:id", async (req, res) => {
  try {
    const updatedBooking = await BookingInfo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedBooking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking updated successfully", updatedBooking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- Delete Booking ---
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const deletedBooking = await BookingInfo.findByIdAndDelete(req.params.id);
    if (!deletedBooking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Get All Cars ---
app.get("/api/cars", async (req, res) => {
  try {
    const cars = await CarsInfo.find();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Find Available Cars ---
app.post("/api/find-car", async (req, res) => {
  try {
    const { date } = req.body;
    const cars = await CarsInfo.find({ bookedDates: { $nin: [date] } });
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Start Server ---
mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connection established. Starting server...");
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
