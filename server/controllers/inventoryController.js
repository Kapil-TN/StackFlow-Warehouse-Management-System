const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const Bin = require("../models/Bin");

// @desc   Get all inventory (with filtering)
// @route  GET /api/inventory
// @access Private
const getInventory = async (req, res) => {
  const { search, warehouse, bin, lowStock } = req.query;

  // Build inventory query
  let invQuery = { quantity: { $gt: 0 } }; // Only records with stock > 0 by default

  if (bin) {
    invQuery.bin = bin;
  }

  // Get inventory with populated references
  let inventory = await Inventory.find(invQuery)
    .populate({
      path: "product",
      match: search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { sku: { $regex: search, $options: "i" } },
            ],
            isActive: true,
          }
        : { isActive: true },
    })
    .populate({
      path: "bin",
      populate: { path: "warehouse", select: "name code" },
    })
    .sort({ updatedAt: -1 });

  // Filter out null product (when product search doesn't match)
  inventory = inventory.filter((item) => item.product !== null);

  // Filter by warehouse if specified
  if (warehouse) {
    inventory = inventory.filter(
      (item) => item.bin && item.bin.warehouse && item.bin.warehouse._id.toString() === warehouse
    );
  }

  // Low stock filter
  if (lowStock === "true") {
    inventory = inventory.filter(
      (item) => item.product && item.quantity <= item.product.reorderLevel
    );
  }

  // Attach stock value and format response
  const result = inventory.map((item) => ({
    _id: item._id,
    product: item.product,
    bin: item.bin,
    quantity: item.quantity,
    stockValue: item.product ? item.quantity * item.product.unitCost : 0,
    updatedAt: item.updatedAt,
  }));

  res.json(result);
};

// @desc   Get single inventory record
// @route  GET /api/inventory/:id
// @access Private
const getInventoryItem = async (req, res) => {
  const item = await Inventory.findById(req.params.id)
    .populate("product")
    .populate({ path: "bin", populate: { path: "warehouse", select: "name code" } });

  if (!item) {
    res.status(404);
    throw new Error("Inventory record not found");
  }

  res.json({
    ...item.toObject(),
    stockValue: item.product ? item.quantity * item.product.unitCost : 0,
  });
};

// @desc   Get inventory summary stats
// @route  GET /api/inventory/stats
// @access Private
const getInventoryStats = async (req, res) => {
  const [totalItems, products, lowStockProducts] = await Promise.all([
    Inventory.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]),
    Product.countDocuments({ isActive: true }),
    // Products whose total inventory is below reorder level
    Inventory.aggregate([
      {
        $group: {
          _id: "$product",
          totalQty: { $sum: "$quantity" },
        },
      },
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
    totalInventoryUnits: totalItems.length ? totalItems[0].total : 0,
    totalProducts: products,
    lowStockCount: lowStockProducts.length,
  });
};

module.exports = { getInventory, getInventoryItem, getInventoryStats };
