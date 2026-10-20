const express = require("express");
const router = express.Router();
const {
  getBins,
  getBin,
  createBin,
  updateBin,
  deleteBin,
} = require("../controllers/warehouseController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getBins);
router.get("/:id", getBin);
router.post("/", authorize("admin", "warehouse_manager"), createBin);
router.put("/:id", authorize("admin", "warehouse_manager"), updateBin);
router.delete("/:id", authorize("admin"), deleteBin);

module.exports = router;
