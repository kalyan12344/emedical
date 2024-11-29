const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const stripe = require("stripe");
require("dotenv").config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(bodyParser.json());

// Use CORS middleware
const allowedOrigins = process.env.CORS_ORIGIN.split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((error) => console.error("Failed to connect to MongoDB:", error));

// Event listeners for MongoDB connection
mongoose.connection.on("connected", () =>
  console.log("Mongoose is connected.")
);
mongoose.connection.on("error", (err) => console.error("Mongoose error:", err));
mongoose.connection.on("disconnected", () =>
  console.log("Mongoose disconnected.")
);

// Import the user router
const userRouter = require("./routes/user");
const doctorRouter = require("./routes/doc");
const appointmentRouter = require("./routes/appointments");
const bloodDonorRouter = require("./routes/bloodDonor");
const adminRouter = require("./routes/admin.js");
const issueRouter = require("./routes/issue.js");
const reviewRouter = require("./routes/reviews.js");
require("../backend/scheduler.js");

app.use(doctorRouter);
app.use(userRouter);
app.use(appointmentRouter);
app.use(bloodDonorRouter);
app.use(adminRouter);
app.use(issueRouter);
app.use(reviewRouter);

// Stripe Payment Intent
app.post("/api/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    // Create a payment intent with the specified amount
    const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
    });
    console.log(paymentIntent.status);
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
