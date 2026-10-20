const express = require("express");
const router = express.Router();
const { getActivityLogs, getDashboardStats } = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getDashboardStats);

module.exports = router;
