import { Router } from "express";
import {
  createProduct,
  getProductDetails,
  getProducts,
  updateProduct,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, getProducts);
router.get("/:id", getProductDetails);
router.post("/", authenticate, isAdmin, createProduct);
router.put("/:id", authenticate, isAdmin, updateProduct);

export default router;
