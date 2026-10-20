const mongoose = require("mongoose");

// items must be an array of subdocuments to support multiple products per receipt
const receiptItemSchema = new mongoose.Schema({
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
  bin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bin",
    required: true,
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0,
  },
});

const receiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
  },
  supplierName: {
    type: String,
    required: true,
  },
  deliveryReference: {
    type: String,
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
  },
  items: [receiptItemSchema],   // Array for multiple items
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Receipt", receiptSchema);