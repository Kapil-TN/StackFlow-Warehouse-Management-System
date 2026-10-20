const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deactivateProduct,
  getCategories,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

router.get("/categories", getCategories);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", authorize("admin", "warehouse_manager"), createProduct);
router.put("/:id", authorize("admin", "warehouse_manager"), updateProduct);
router.delete("/:id", authorize("admin"), deactivateProduct);

module.exports = router;
