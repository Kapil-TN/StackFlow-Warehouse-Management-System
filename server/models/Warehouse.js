const mongoose = require("mongoose");
const WarehouseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("Warehouse", WarehouseSchema);