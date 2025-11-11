import { Router } from "express";
import { getOrders, placeOrder } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Customer order placement and history
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new order (AUTHENTICATED USER REQUIRED)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required: [productId, quantity]
 *               properties:
 *                 productId: { type: string, format: uuid, example: "uuid-for-product-a" }
 *                 quantity: { type: integer, example: 2 }
 *     responses:
 *       '201':
 *         description: Order placed successfully (transaction committed).
 *       '400':
 *         description: Insufficient stock for one or more products (transaction rolled back).
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: One or more product IDs provided do not exist.
 *   get:
 *     summary: View the authenticated user's order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of user's orders (may be empty).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 object:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       status: { type: string }
 *                       totalPrice: { type: number }
 *                       createdAt: { type: string }
 *       '401':
 *         description: Unauthorized.
 */

router.post("/", authenticate, placeOrder);
router.get("/", authenticate, getOrders);

export default router;
