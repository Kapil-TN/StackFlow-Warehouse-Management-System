// Only override DNS servers in local development if needed, never in serverless environments
if (process.env.NODE_ENV !== "production") {
  try {
    const dns = require("dns");
    dns.setServers(["1.1.1.1"]);
  } catch (err) {
    // Ignore DNS override errors in local dev
  }
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const binRoutes = require("./routes/binRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const activityRoutes = require("./routes/activityRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Database Connection (Cached for Serverless) ──────────────────────────────
let cachedConnection = global.mongoose;

if (!cachedConnection) {
  cachedConnection = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cachedConnection.conn) {
    return cachedConnection.conn;
  }

  if (!cachedConnection.promise) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is missing.");
    }

    const opts = {
      bufferCommands: false, // Fail immediately if not connected instead of hanging for 10s
      serverSelectionTimeoutMS: 5000,
    };

    cachedConnection.promise = mongoose.connect(mongoUri, opts).then((m) => {
      console.log("✅ MongoDB connected successfully");
      return m;
    });
  }

  try {
    cachedConnection.conn = await cachedConnection.promise;
  } catch (e) {
    cachedConnection.promise = null;
    console.error("❌ MongoDB connection error:", e.message);
    throw e;
  }

  return cachedConnection.conn;
};

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, same-origin) or matching patterns
    if (
      !origin ||
      origin === process.env.CLIENT_URL ||
      origin === "http://localhost:5173" ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback allow in serverless
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Ensure DB Connected Before Any Route Runs ────────────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/bins", binRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity", activityRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// Start local dev server if running directly
if (process.env.NODE_ENV !== "production") {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Local dev DB connection failed:", err.message);
    });
}

module.exports = app;