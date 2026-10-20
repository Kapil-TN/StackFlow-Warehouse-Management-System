const mongoose = require("mongoose");
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const Bin = require("../models/Bin");
const { logActivity } = require("../utils/activityLogger");

// Generate order number: ORD-YYYYMMDD-XXXXX
const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${date}-${rand}`;
};

// @desc   Get all orders
// @route  GET /api/orders
// @access Private
const getOrders = async (req, res) => {
  const { status } = req.query;
  let query = status ? { status } : {};

  const orders = await Order.find(query)
    .populate("items.product", "name sku unit")
    .populate("items.pickedFrom.bin", "code")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// @desc   Get single order
// @route  GET /api/orders/:id
// @access Private
const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product", "name sku unit category")
    .populate({ path: "items.pickedFrom.bin", populate: { path: "warehouse", select: "name code" } })
    .populate("createdBy", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json(order);
};

// @desc   Create order
// @route  POST /api/orders
// @access Private/Admin/Manager
const createOrder = async (req, res) => {
  const { customerName, items } = req.body;

  if (!customerName) {
    res.status(400);
    throw new Error("Customer name is required");
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("At least one item is required");
  }

  for (const item of items) {
    if (!item.product || !item.quantity) {
      res.status(400);
      throw new Error("Each item requires product and quantity");
    }
    if (item.quantity < 1) {
      res.status(400);
      throw new Error("Quantity must be at least 1");
    }
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      res.status(400);
      throw new Error(`Product not found or inactive: ${item.product}`);
    }
  }

  const orderNumber = generateOrderNumber();
  const order = await Order.create({
    orderNumber,
    customerName,
    items: items.map((i) => ({ product: i.product, quantity: i.quantity, pickedFrom: [] })),
    status: "pending",
    createdBy: req.user._id,
  });

  await logActivity({
    userId: req.user._id,
    action: "ORDER_CREATED",
    entityType: "Order",
    entityId: order._id,
    description: `Order ${orderNumber} created for customer "${customerName}"`,
  });

  const populated = await Order.findById(order._id)
    .populate("items.product", "name sku unit")
    .populate("createdBy", "name");

  res.status(201).json(populated);
};

// @desc   Start picking (pending → picking)
// @route  PUT /api/orders/:id/start-picking
// @access Private/Admin/Manager/Operator
const startPicking = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.status !== "pending") {
    res.status(400);
    throw new Error(`Order is already in status: ${order.status}`);
  }

  order.status = "picking";
  await order.save();

  await logActivity({
    userId: req.user._id,
    action: "ORDER_PICKING_STARTED",
    entityType: "Order",
    entityId: order._id,
    description: `Picking started for order ${order.orderNumber}`,
  });

  res.json(order);
};

// @desc   Confirm pick — deduct inventory and mark order as picked
// @route  PUT /api/orders/:id/confirm-pick
// @access Private/Admin/Manager/Operator
const confirmPick = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.status !== "picking") {
    res.status(400);
    throw new Error(`Order must be in 'picking' status to confirm pick. Current: ${order.status}`);
  }

  // req.body.pickedItems = [{ orderItemIndex, pickedFrom: [{ bin, quantity }] }]
  const { pickedItems } = req.body;
  if (!pickedItems || !Array.isArray(pickedItems) || pickedItems.length === 0) {
    res.status(400);
    throw new Error("Pick details (pickedItems) are required");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate and deduct inventory
    for (const pickData of pickedItems) {
      const { orderItemIndex, pickedFrom } = pickData;
      const orderItem = order.items[orderItemIndex];
      if (!orderItem) {
        throw new Error(`Invalid order item index: ${orderItemIndex}`);
      }

      let totalPicked = 0;
      for (const pickLocation of pickedFrom) {
        const { bin, quantity } = pickLocation;
        if (!bin || !quantity || quantity < 1) {
          throw new Error("Each pick location requires bin and quantity");
        }

        // Find inventory record
        const invRecord = await Inventory.findOne({ product: orderItem.product, bin }).session(session);
        if (!invRecord) {
          throw new Error(`No inventory found for this product in bin: ${bin}`);
        }
        if (invRecord.quantity < quantity) {
          throw new Error(`Insufficient inventory in bin. Available: ${invRecord.quantity}, Requested: ${quantity}`);
        }

        // Deduct inventory
        invRecord.quantity -= quantity;
        invRecord.updatedAt = new Date();
        await invRecord.save({ session });

        totalPicked += quantity;
      }

      // Validate total picked matches order quantity
      if (totalPicked !== orderItem.quantity) {
        throw new Error(
          `Picked quantity (${totalPicked}) does not match order quantity (${orderItem.quantity}) for item index ${orderItemIndex}`
        );
      }

      // Save pickedFrom to order item
      order.items[orderItemIndex].pickedFrom = pickedFrom;
    }

    order.status = "picked";
    order.pickedAt = new Date();
    await order.save({ session });

    await session.commitTransaction();

    await logActivity({
      userId: req.user._id,
      action: "STOCK_PICKED",
      entityType: "Order",
      entityId: order._id,
      description: `Order ${order.orderNumber} picking confirmed — stock deducted`,
    });

    const populated = await Order.findById(order._id)
      .populate("items.product", "name sku")
      .populate("items.pickedFrom.bin", "code");

    res.json(populated);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// @desc   Dispatch order (picked → dispatched)
// @route  PUT /api/orders/:id/dispatch
// @access Private/Admin/Manager/Operator
const dispatchOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.status !== "picked") {
    res.status(400);
    throw new Error(`Order must be in 'picked' status to dispatch. Current: ${order.status}`);
  }

  order.status = "dispatched";
  order.dispatchedAt = new Date();
  await order.save();

  await logActivity({
    userId: req.user._id,
    action: "ORDER_DISPATCHED",
    entityType: "Order",
    entityId: order._id,
    description: `Order ${order.orderNumber} dispatched to "${order.customerName}"`,
  });

  res.json(order);
};

// @desc   Get inventory availability for order picking
// @route  GET /api/orders/:id/inventory-availability
// @access Private
const getOrderInventoryAvailability = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product", "name sku unit");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const availability = await Promise.all(
    order.items.map(async (item) => {
      const inventoryRecords = await Inventory.find({ product: item.product._id, quantity: { $gt: 0 } })
        .populate({ path: "bin", populate: { path: "warehouse", select: "name code" } });

      const totalAvailable = inventoryRecords.reduce((sum, r) => sum + r.quantity, 0);

      return {
        product: item.product,
        requiredQuantity: item.quantity,
        totalAvailable,
        sufficient: totalAvailable >= item.quantity,
        bins: inventoryRecords.map((r) => ({
          _id: r._id,
          bin: r.bin,
          quantity: r.quantity,
        })),
      };
    })
  );

  res.json(availability);
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  startPicking,
  confirmPick,
  dispatchOrder,
  getOrderInventoryAvailability,
};
