import { Router } from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, isAdmin, getProducts);
router.post("/", authenticate, isAdmin, createProduct);
router.put("/:id", authenticate, isAdmin, updateProduct);

export default router;
