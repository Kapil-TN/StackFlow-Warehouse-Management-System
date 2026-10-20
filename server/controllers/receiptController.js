const mongoose = require("mongoose");
const Receipt = require("../models/Receipt");
const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const Bin = require("../models/Bin");
const { logActivity } = require("../utils/activityLogger");

// Generate receipt number: RCT-YYYYMMDD-XXXXX
const generateReceiptNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `RCT-${date}-${rand}`;
};

// @desc   Get all receipts
// @route  GET /api/receipts
// @access Private
const getReceipts = async (req, res) => {
  const receipts = await Receipt.find({})
    .populate("receivedBy", "name")
    .populate("items.product", "name sku")
    .populate("items.bin", "code")
    .sort({ createdAt: -1 });
  res.json(receipts);
};

// @desc   Get single receipt
// @route  GET /api/receipts/:id
// @access Private
const getReceipt = async (req, res) => {
  const receipt = await Receipt.findById(req.params.id)
    .populate("receivedBy", "name email")
    .populate("items.product", "name sku category unit unitCost")
    .populate({
      path: "items.bin",
      populate: { path: "warehouse", select: "name code" },
    });

  if (!receipt) {
    res.status(404);
    throw new Error("Receipt not found");
  }
  res.json(receipt);
};

// @desc   Create receipt and update inventory
// @route  POST /api/receipts
// @access Private/Admin/Manager/Operator
const createReceipt = async (req, res) => {
  const { supplierName, deliveryReference, deliveryDate, notes, items } = req.body;

  // --- Validation ---
  if (!supplierName || !deliveryReference || !deliveryDate) {
    res.status(400);
    throw new Error("Supplier name, delivery reference, and delivery date are required");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("At least one item is required");
  }

  // Validate each item
  for (const item of items) {
    if (!item.product || !item.bin || !item.quantity || item.unitCost === undefined) {
      res.status(400);
      throw new Error("Each item requires product, bin, quantity, and unit cost");
    }
    if (item.quantity < 1) {
      res.status(400);
      throw new Error("Quantity must be at least 1");
    }
    if (item.unitCost < 0) {
      res.status(400);
      throw new Error("Unit cost cannot be negative");
    }
  }

  // Validate all products and bins exist
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      res.status(400);
      throw new Error(`Product not found or inactive: ${item.product}`);
    }

    const bin = await Bin.findById(item.bin).populate("warehouse");
    if (!bin) {
      res.status(400);
      throw new Error(`Bin not found: ${item.bin}`);
    }
    if (!bin.warehouse) {
      res.status(400);
      throw new Error(`Bin ${bin.code} does not belong to a valid warehouse`);
    }
  }

  // --- Use MongoDB session/transaction ---
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const receiptNumber = generateReceiptNumber();

    const receipt = await Receipt.create(
      [
        {
          receiptNumber,
          supplierName,
          deliveryReference,
          deliveryDate: new Date(deliveryDate),
          notes,
          items: items.map((i) => ({
            product: i.product,
            quantity: i.quantity,
            bin: i.bin,
            unitCost: i.unitCost,
          })),
          receivedBy: req.user._id,
          receivedAt: new Date(),
        },
      ],
      { session }
    );

    // Update inventory: upsert each product+bin combination
    for (const item of items) {
      await Inventory.findOneAndUpdate(
        { product: item.product, bin: item.bin },
        {
          $inc: { quantity: item.quantity },
          $set: { updatedAt: new Date() },
        },
        { upsert: true, new: true, session }
      );
    }

    await session.commitTransaction();

    await logActivity({
      userId: req.user._id,
      action: "RECEIPT_CREATED",
      entityType: "Receipt",
      entityId: receipt[0]._id,
      description: `Receipt ${receiptNumber} created for supplier "${supplierName}" — ${items.length} item(s) received`,
    });

    // Return populated receipt
    const populated = await Receipt.findById(receipt[0]._id)
      .populate("receivedBy", "name")
      .populate("items.product", "name sku unit")
      .populate("items.bin", "code");

    res.status(201).json(populated);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

module.exports = { getReceipts, getReceipt, createReceipt };
