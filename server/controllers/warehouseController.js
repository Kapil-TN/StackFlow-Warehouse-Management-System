const Warehouse = require("../models/Warehouse");
const Bin = require("../models/Bin");
const Inventory = require("../models/Inventory");
const { logActivity } = require("../utils/activityLogger");

// ==================== WAREHOUSES ====================

// @desc   Get all warehouses
// @route  GET /api/warehouses
// @access Private
const getWarehouses = async (req, res) => {
  const warehouses = await Warehouse.find({}).sort({ createdAt: -1 });
  res.json(warehouses);
};

// @desc   Get single warehouse
// @route  GET /api/warehouses/:id
// @access Private
const getWarehouse = async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) {
    res.status(404);
    throw new Error("Warehouse not found");
  }
  res.json(warehouse);
};

// @desc   Create warehouse
// @route  POST /api/warehouses
// @access Private/Admin/Manager
const createWarehouse = async (req, res) => {
  const { name, code, location } = req.body;
  if (!name || !code || !location) {
    res.status(400);
    throw new Error("Name, code, and location are required");
  }

  const warehouse = await Warehouse.create({ name, code: code.toUpperCase(), location });

  await logActivity({
    userId: req.user._id,
    action: "WAREHOUSE_CREATED",
    entityType: "Warehouse",
    entityId: warehouse._id,
    description: `Warehouse "${warehouse.name}" (Code: ${warehouse.code}) created`,
  });

  res.status(201).json(warehouse);
};

// @desc   Update warehouse
// @route  PUT /api/warehouses/:id
// @access Private/Admin/Manager
const updateWarehouse = async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) {
    res.status(404);
    throw new Error("Warehouse not found");
  }

  const { name, code, location } = req.body;
  warehouse.name = name || warehouse.name;
  warehouse.code = code ? code.toUpperCase() : warehouse.code;
  warehouse.location = location || warehouse.location;

  const updated = await warehouse.save();

  await logActivity({
    userId: req.user._id,
    action: "WAREHOUSE_UPDATED",
    entityType: "Warehouse",
    entityId: warehouse._id,
    description: `Warehouse "${updated.name}" updated`,
  });

  res.json(updated);
};

// @desc   Delete warehouse (only if no bins exist)
// @route  DELETE /api/warehouses/:id
// @access Private/Admin
const deleteWarehouse = async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) {
    res.status(404);
    throw new Error("Warehouse not found");
  }

  const binCount = await Bin.countDocuments({ warehouse: req.params.id });
  if (binCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete warehouse with ${binCount} bins. Remove bins first.`);
  }

  await Warehouse.findByIdAndDelete(req.params.id);
  res.json({ message: "Warehouse deleted" });
};

// ==================== BINS ====================

// @desc   Get bins (optionally filter by warehouse)
// @route  GET /api/bins
// @access Private
const getBins = async (req, res) => {
  const { warehouse } = req.query;
  let query = warehouse ? { warehouse } : {};

  const bins = await Bin.find(query).populate("warehouse", "name code").sort({ code: 1 });

  // Attach inventory utilization data to each bin
  const binsWithUtilization = await Promise.all(
    bins.map(async (bin) => {
      const inventoryItems = await Inventory.find({ bin: bin._id });
      const currentStock = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
      const utilization = bin.capacity > 0 ? Math.round((currentStock / bin.capacity) * 100) : 0;

      let status = "available";
      if (currentStock >= bin.capacity) status = "full";
      else if (currentStock > 0) status = "occupied";

      return {
        ...bin.toObject(),
        currentStock,
        utilization,
        status,
      };
    })
  );

  res.json(binsWithUtilization);
};

// @desc   Get single bin
// @route  GET /api/bins/:id
// @access Private
const getBin = async (req, res) => {
  const bin = await Bin.findById(req.params.id).populate("warehouse", "name code");
  if (!bin) {
    res.status(404);
    throw new Error("Bin not found");
  }

  const inventoryItems = await Inventory.find({ bin: bin._id });
  const currentStock = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  const utilization = bin.capacity > 0 ? Math.round((currentStock / bin.capacity) * 100) : 0;

  let status = "available";
  if (currentStock >= bin.capacity) status = "full";
  else if (currentStock > 0) status = "occupied";

  res.json({ ...bin.toObject(), currentStock, utilization, status });
};

// @desc   Create bin
// @route  POST /api/bins
// @access Private/Admin/Manager
const createBin = async (req, res) => {
  const { warehouse, code, capacity } = req.body;
  if (!warehouse || !code || !capacity) {
    res.status(400);
    throw new Error("Warehouse, code, and capacity are required");
  }

  const warehouseDoc = await Warehouse.findById(warehouse);
  if (!warehouseDoc) {
    res.status(404);
    throw new Error("Warehouse not found");
  }

  const bin = await Bin.create({ warehouse, code: code.toUpperCase(), capacity });

  await logActivity({
    userId: req.user._id,
    action: "BIN_CREATED",
    entityType: "Bin",
    entityId: bin._id,
    description: `Bin "${bin.code}" created in warehouse "${warehouseDoc.name}"`,
  });

  res.status(201).json(bin);
};

// @desc   Update bin
// @route  PUT /api/bins/:id
// @access Private/Admin/Manager
const updateBin = async (req, res) => {
  const bin = await Bin.findById(req.params.id);
  if (!bin) {
    res.status(404);
    throw new Error("Bin not found");
  }

  const { code, capacity } = req.body;
  bin.code = code ? code.toUpperCase() : bin.code;
  bin.capacity = capacity !== undefined ? capacity : bin.capacity;

  const updated = await bin.save();
  res.json(updated);
};

// @desc   Delete bin (only if no inventory)
// @route  DELETE /api/bins/:id
// @access Private/Admin
const deleteBin = async (req, res) => {
  const bin = await Bin.findById(req.params.id);
  if (!bin) {
    res.status(404);
    throw new Error("Bin not found");
  }

  const inventoryCount = await Inventory.countDocuments({ bin: req.params.id });
  if (inventoryCount > 0) {
    res.status(400);
    throw new Error("Cannot delete bin with existing inventory");
  }

  await Bin.findByIdAndDelete(req.params.id);
  res.json({ message: "Bin deleted" });
};

module.exports = {
  getWarehouses, getWarehouse, createWarehouse, updateWarehouse, deleteWarehouse,
  getBins, getBin, createBin, updateBin, deleteBin,
};
