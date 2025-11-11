import { Router } from "express";
import { getOrders, placeOrder } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, placeOrder);
router.get("/", authenticate, getOrders);

export default router;
