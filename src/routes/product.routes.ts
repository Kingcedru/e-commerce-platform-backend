import { Router } from "express";
import { createProduct } from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, isAdmin, createProduct);

export default router;
