const Product = require("../models/Product");
const { logActivity } = require("../utils/activityLogger");

// @desc   Get all products
// @route  GET /api/products
// @access Private
const getProducts = async (req, res) => {
  const { search, category, includeInactive } = req.query;

  let query = {};

  // By default only show active products (unless admin requests all)
  if (includeInactive !== "true" || req.user.role !== "admin") {
    query.isActive = true;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    query.category = { $regex: category, $options: "i" };
  }

  const products = await Product.find(query).sort({ createdAt: -1 });
  res.json(products);
};

// @desc   Get single product
// @route  GET /api/products/:id
// @access Private
const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
};

// @desc   Create product
// @route  POST /api/products
// @access Private/Admin/Manager
const createProduct = async (req, res) => {
  const { name, sku, category, description, unit, unitCost, reorderLevel } = req.body;

  if (!name || !sku || !category || unitCost === undefined) {
    res.status(400);
    throw new Error("Name, SKU, category and unit cost are required");
  }

  if (unitCost < 0) {
    res.status(400);
    throw new Error("Unit cost cannot be negative");
  }

  const product = await Product.create({
    name,
    sku: sku.toUpperCase(),
    category,
    description,
    unit: unit || "piece",
    unitCost,
    reorderLevel: reorderLevel || 10,
  });

  await logActivity({
    userId: req.user._id,
    action: "PRODUCT_CREATED",
    entityType: "Product",
    entityId: product._id,
    description: `Product "${product.name}" (SKU: ${product.sku}) created`,
  });

  res.status(201).json(product);
};

// @desc   Update product
// @route  PUT /api/products/:id
// @access Private/Admin/Manager
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const { name, sku, category, description, unit, unitCost, reorderLevel } = req.body;

  if (unitCost !== undefined && unitCost < 0) {
    res.status(400);
    throw new Error("Unit cost cannot be negative");
  }

  product.name = name || product.name;
  product.sku = sku ? sku.toUpperCase() : product.sku;
  product.category = category || product.category;
  product.description = description !== undefined ? description : product.description;
  product.unit = unit || product.unit;
  product.unitCost = unitCost !== undefined ? unitCost : product.unitCost;
  product.reorderLevel = reorderLevel !== undefined ? reorderLevel : product.reorderLevel;

  const updated = await product.save();

  await logActivity({
    userId: req.user._id,
    action: "PRODUCT_UPDATED",
    entityType: "Product",
    entityId: product._id,
    description: `Product "${updated.name}" updated`,
  });

  res.json(updated);
};

// @desc   Deactivate (soft delete) product
// @route  DELETE /api/products/:id
// @access Private/Admin
const deactivateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isActive = false;
  await product.save();

  await logActivity({
    userId: req.user._id,
    action: "PRODUCT_DEACTIVATED",
    entityType: "Product",
    entityId: product._id,
    description: `Product "${product.name}" deactivated`,
  });

  res.json({ message: "Product deactivated" });
};

// @desc   Get distinct product categories
// @route  GET /api/products/categories
// @access Private
const getCategories = async (req, res) => {
  const categories = await Product.distinct("category", { isActive: true });
  res.json(categories);
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deactivateProduct, getCategories };
