const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",   
    required: true,
  },
  bin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bin",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


inventorySchema.index({ product: 1, bin: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);