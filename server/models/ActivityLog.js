const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
    // e.g., USER_LOGIN, PRODUCT_CREATED, RECEIPT_CREATED, ORDER_DISPATCHED
  },
  entityType: {
    type: String,
    // e.g., "Product", "Receipt", "Order", "Bin"
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);