const mongoose = require("mongoose");

// pickedFrom tracks which bins the stock was picked from (per order item)
const pickedFromSchema = new mongoose.Schema({
  bin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bin",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

// Each order can have multiple items (products)
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  pickedFrom: [pickedFromSchema],
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  items: [orderItemSchema],   // Array for multiple products in one order
  status: {
    type: String,
    enum: ["pending", "picking", "picked", "dispatched"],
    default: "pending",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  pickedAt: {
    type: Date,
  },
  dispatchedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Order", orderSchema);