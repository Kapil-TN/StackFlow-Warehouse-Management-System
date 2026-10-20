const express = require("express");
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  startPicking,
  confirmPick,
  dispatchOrder,
  getOrderInventoryAvailability,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getOrders);
router.get("/:id", getOrder);
router.get("/:id/inventory-availability", getOrderInventoryAvailability);

// Only admin/manager can create orders
router.post("/", authorize("admin", "warehouse_manager"), createOrder);

// Picking actions - admin, manager, operator
router.put("/:id/start-picking", authorize("admin", "warehouse_manager", "operator"), startPicking);
router.put("/:id/confirm-pick", authorize("admin", "warehouse_manager", "operator"), confirmPick);
router.put("/:id/dispatch", authorize("admin", "warehouse_manager", "operator"), dispatchOrder);

module.exports = router;
