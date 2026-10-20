const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  unit: {
    type: String,
    default: "piece",
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0,
  },
  reorderLevel: {
    type: Number,
    default: 10,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);