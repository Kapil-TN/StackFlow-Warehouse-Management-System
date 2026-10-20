const express = require("express");
const router = express.Router();
const {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getBins,
  getBin,
  createBin,
  updateBin,
  deleteBin,
} = require("../controllers/warehouseController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// Warehouse routes
router.get("/", getWarehouses);
router.get("/:id", getWarehouse);
router.post("/", authorize("admin", "warehouse_manager"), createWarehouse);
router.put("/:id", authorize("admin", "warehouse_manager"), updateWarehouse);
router.delete("/:id", authorize("admin"), deleteWarehouse);

module.exports = router;
