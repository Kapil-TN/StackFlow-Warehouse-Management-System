const ActivityLog = require("../models/ActivityLog");
const Order = require("../models/Order");
const Receipt = require("../models/Receipt");
const Warehouse = require("../models/Warehouse");
const Bin = require("../models/Bin");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");

// @desc   Get activity logs
// @route  GET /api/activity
// @access Private/Admin/Manager
const getActivityLogs = async (req, res) => {
  const { limit = 50, page = 1, action } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let query = {};
  if (action) query.action = action;

  const [logs, total] = await Promise.all([
    ActivityLog.find(query)
      .populate("user", "name role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ActivityLog.countDocuments(query),
  ]);

  res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
};

// @desc   Get dashboard stats
// @route  GET /api/dashboard
// @access Private
const getDashboardStats = async (req, res) => {
  const [
    totalProducts,
    totalWarehouses,
    totalBins,
    pendingOrders,
    pickedOrders,
    recentReceipts,
    recentActivity,
    inventoryStats,
    lowStockItems,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Warehouse.countDocuments({}),
    Bin.countDocuments({}),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ status: "picked" }),
    Receipt.find({})
      .populate("receivedBy", "name")
      .sort({ createdAt: -1 })
      .limit(5),
    ActivityLog.find({})
      .populate("user", "name role")
      .sort({ createdAt: -1 })
      .limit(10),
    Inventory.aggregate([
      { $group: { _id: null, totalUnits: { $sum: "$quantity" } } },
    ]),
    // Low stock: inventory total per product below reorder level
    Inventory.aggregate([
      { $group: { _id: "$product", totalQty: { $sum: "$quantity" } } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $match: {
          "product.isActive": true,
          $expr: { $lte: ["$totalQty", "$product.reorderLevel"] },
        },
      },
    ]),
  ]);

  res.json({
    totalProducts,
    totalWarehouses,
    totalBins,
    pendingOrders,
    ordersReadyForDispatch: pickedOrders,
    totalInventoryUnits: inventoryStats.length ? inventoryStats[0].totalUnits : 0,
    lowStockCount: lowStockItems.length,
    recentReceipts,
    recentActivity,
  });
};

module.exports = { getActivityLogs, getDashboardStats };
