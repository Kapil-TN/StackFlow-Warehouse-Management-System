const mongoose = require("mongoose");

const binSchema = new mongoose.Schema({
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true,
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


binSchema.index({ warehouse: 1, code: 1 }, { unique: true });

module.exports = mongoose.model("Bin", binSchema);