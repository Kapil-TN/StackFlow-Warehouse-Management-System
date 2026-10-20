const express = require("express");
const router = express.Router();
const { getActivityLogs } = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// Admin and managers can view activity logs
router.get("/", authorize("admin", "warehouse_manager"), getActivityLogs);

module.exports = router;
