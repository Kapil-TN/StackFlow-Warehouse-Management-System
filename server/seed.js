/**
 * StackFlow - Demo Data Seed Script
 *
 * DEMO CREDENTIALS (not for production):
 *   Admin:            admin@stackflow.com       / Admin@123
 *   Warehouse Manager: manager@stackflow.com    / Manager@123
 *   Operator:         operator@stackflow.com    / Operator@123
 *
 * Run with: npm run seed
 */

const dns = require("dns");
dns.setServers(["1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Product = require("./models/Product");
const Warehouse = require("./models/Warehouse");
const Bin = require("./models/Bin");
const Inventory = require("./models/Inventory");
const Receipt = require("./models/Receipt");
const Order = require("./models/Order");
const ActivityLog = require("./models/ActivityLog");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Warehouse.deleteMany({}),
      Bin.deleteMany({}),
      Inventory.deleteMany({}),
      Receipt.deleteMany({}),
      Order.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data");

    // ─── Users ────────────────────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const [admin, manager, operator] = await User.create([
      {
        name: "Admin User",
        email: "admin@stackflow.com",
        password: await bcrypt.hash("Admin@123", salt),
        role: "admin",
      },
      {
        name: "Warehouse Manager",
        email: "manager@stackflow.com",
        password: await bcrypt.hash("Manager@123", salt),
        role: "warehouse_manager",
      },
      {
        name: "Operator One",
        email: "operator@stackflow.com",
        password: await bcrypt.hash("Operator@123", salt),
        role: "operator",
      },
    ]);
    console.log("👤 Users created");

    // ─── Products ─────────────────────────────────────────────────────────────
    const products = await Product.create([
      { name: "Wireless Mouse", sku: "WL-MOUSE-001", category: "Electronics", unit: "piece", unitCost: 599, reorderLevel: 10 },
      { name: "Mechanical Keyboard", sku: "MK-BOARD-001", category: "Electronics", unit: "piece", unitCost: 1499, reorderLevel: 5 },
      { name: "USB-C Cable 1m", sku: "USB-C-1M-001", category: "Accessories", unit: "piece", unitCost: 149, reorderLevel: 20 },
      { name: "Laptop Stand", sku: "LPT-STAND-001", category: "Furniture", unit: "piece", unitCost: 899, reorderLevel: 8 },
      { name: "HDMI Cable 2m", sku: "HDMI-2M-001", category: "Accessories", unit: "piece", unitCost: 249, reorderLevel: 15 },
      { name: "LED Monitor 24\"", sku: "MON-24-LED-001", category: "Electronics", unit: "piece", unitCost: 8999, reorderLevel: 3 },
      { name: "Ergonomic Chair", sku: "ERG-CHAIR-001", category: "Furniture", unit: "piece", unitCost: 4999, reorderLevel: 2 },
    ]);
    console.log("📦 Products created");

    // ─── Warehouses ───────────────────────────────────────────────────────────
    const [wh1, wh2] = await Warehouse.create([
      { name: "Main Warehouse", code: "WH-MAIN", location: "Building A, Industrial Estate" },
      { name: "Secondary Warehouse", code: "WH-SEC", location: "Building B, Industrial Estate" },
    ]);
    console.log("🏭 Warehouses created");

    // ─── Bins ─────────────────────────────────────────────────────────────────
    const bins = await Bin.create([
      // Main warehouse bins
      { warehouse: wh1._id, code: "A-01-01", capacity: 200 },
      { warehouse: wh1._id, code: "A-01-02", capacity: 150 },
      { warehouse: wh1._id, code: "A-01-03", capacity: 100 },
      { warehouse: wh1._id, code: "B-02-01", capacity: 300 },
      { warehouse: wh1._id, code: "B-02-02", capacity: 50 },
      // Secondary warehouse bins
      { warehouse: wh2._id, code: "C-01-01", capacity: 200 },
      { warehouse: wh2._id, code: "C-01-02", capacity: 100 },
    ]);
    const [binA1, binA2, binA3, binB1, binB2, binC1, binC2] = bins;
    console.log("🗄️  Bins created");

    // ─── Inventory ────────────────────────────────────────────────────────────
    await Inventory.create([
      { product: products[0]._id, bin: binA1._id, quantity: 75 },  // Wireless Mouse
      { product: products[1]._id, bin: binA1._id, quantity: 30 },  // Keyboard
      { product: products[2]._id, bin: binA2._id, quantity: 120 }, // USB-C Cable
      { product: products[3]._id, bin: binA3._id, quantity: 15 },  // Laptop Stand
      { product: products[4]._id, bin: binB1._id, quantity: 80 },  // HDMI Cable
      { product: products[5]._id, bin: binB2._id, quantity: 10 },  // Monitor
      { product: products[6]._id, bin: binC1._id, quantity: 5 },   // Chair
      { product: products[0]._id, bin: binC2._id, quantity: 25 },  // Wireless Mouse (in 2nd wh)
    ]);
    console.log("📊 Inventory created");

    // ─── Receipts ─────────────────────────────────────────────────────────────
    const receipt1 = await Receipt.create({
      receiptNumber: "RCT-20240901-10001",
      supplierName: "TechSupply Co.",
      deliveryReference: "DEL-2024-001",
      deliveryDate: new Date("2024-09-01"),
      notes: "Initial stock delivery",
      items: [
        { product: products[0]._id, bin: binA1._id, quantity: 75, unitCost: 580 },
        { product: products[1]._id, bin: binA1._id, quantity: 30, unitCost: 1450 },
      ],
      receivedBy: operator._id,
      receivedAt: new Date("2024-09-01"),
    });

    const receipt2 = await Receipt.create({
      receiptNumber: "RCT-20240910-10002",
      supplierName: "OfficeGear Ltd.",
      deliveryReference: "DEL-2024-002",
      deliveryDate: new Date("2024-09-10"),
      items: [
        { product: products[2]._id, bin: binA2._id, quantity: 120, unitCost: 140 },
        { product: products[4]._id, bin: binB1._id, quantity: 80, unitCost: 230 },
      ],
      receivedBy: operator._id,
      receivedAt: new Date("2024-09-10"),
    });
    console.log("🧾 Receipts created");

    // ─── Orders ───────────────────────────────────────────────────────────────
    await Order.create([
      {
        orderNumber: "ORD-20240915-20001",
        customerName: "Acme Corporation",
        items: [
          { product: products[0]._id, quantity: 10, pickedFrom: [] },
          { product: products[2]._id, quantity: 20, pickedFrom: [] },
        ],
        status: "pending",
        createdBy: manager._id,
      },
      {
        orderNumber: "ORD-20240916-20002",
        customerName: "Beta Solutions",
        items: [
          { product: products[1]._id, quantity: 5, pickedFrom: [] },
          { product: products[3]._id, quantity: 3, pickedFrom: [] },
        ],
        status: "pending",
        createdBy: manager._id,
      },
      {
        orderNumber: "ORD-20240917-20003",
        customerName: "Gamma Technologies",
        items: [
          { product: products[4]._id, quantity: 15, pickedFrom: [] },
        ],
        status: "picked",
        pickedAt: new Date("2024-09-17"),
        createdBy: manager._id,
      },
      {
        orderNumber: "ORD-20240918-20004",
        customerName: "Delta Enterprises",
        items: [
          { product: products[5]._id, quantity: 2, pickedFrom: [] },
        ],
        status: "dispatched",
        pickedAt: new Date("2024-09-18"),
        dispatchedAt: new Date("2024-09-18"),
        createdBy: manager._id,
      },
    ]);
    console.log("📋 Orders created");

    // ─── Activity Logs ────────────────────────────────────────────────────────
    await ActivityLog.create([
      {
        user: admin._id,
        action: "USER_LOGIN",
        entityType: "User",
        entityId: admin._id,
        description: "Admin User logged in",
        createdAt: new Date("2024-09-01T08:00:00"),
      },
      {
        user: operator._id,
        action: "RECEIPT_CREATED",
        entityType: "Receipt",
        entityId: receipt1._id,
        description: `Receipt RCT-20240901-10001 created for supplier "TechSupply Co." — 2 item(s) received`,
        createdAt: new Date("2024-09-01T09:00:00"),
      },
      {
        user: manager._id,
        action: "ORDER_CREATED",
        entityType: "Order",
        entityId: null,
        description: `Order ORD-20240915-20001 created for customer "Acme Corporation"`,
        createdAt: new Date("2024-09-15T10:00:00"),
      },
    ]);
    console.log("📝 Activity logs created");

    console.log("\n✨ Seed complete!");
    console.log("\n─── DEMO CREDENTIALS ───────────────────────────────────");
    console.log("Admin:     admin@stackflow.com    / Admin@123");
    console.log("Manager:   manager@stackflow.com  / Manager@123");
    console.log("Operator:  operator@stackflow.com / Operator@123");
    console.log("──────────────────────────────────────────────────────");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
