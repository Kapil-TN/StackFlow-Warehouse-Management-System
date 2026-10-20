const express = require("express");
const router = express.Router();
const { getReceipts, getReceipt, createReceipt } = require("../controllers/receiptController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getReceipts);
router.get("/:id", getReceipt);
// Admin, manager, and operator can create receipts
router.post("/", authorize("admin", "warehouse_manager", "operator"), createReceipt);

module.exports = router;
