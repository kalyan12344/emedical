const express = require("express");
const Order = require("../models/orders");
const router = express.Router();

// Create a new order
router.post("/api/orders", async (req, res) => {
  const { userId, items, totalPrice, paymentStatus, deliveryAddress } =
    req.body;

  try {
    const newOrder = new Order({
      userId,
      items,
      totalPrice,
      paymentStatus,
      deliveryAddress,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
});
// Get orders by user ID
router.get("/api/orders/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

module.exports = router;
