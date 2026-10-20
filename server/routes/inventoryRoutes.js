const express = require("express");
const router = express.Router();
const { getInventory, getInventoryItem, getInventoryStats } = require("../controllers/inventoryController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/stats", getInventoryStats);
router.get("/", getInventory);
router.get("/:id", getInventoryItem);

module.exports = router;
