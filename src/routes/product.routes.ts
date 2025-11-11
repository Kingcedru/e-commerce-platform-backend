import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductDetails,
  getProducts,
  updateProduct,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/role.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 * name: Products
 * description: Product management and public catalog browsing
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Creates a new product (ADMIN REQUIRED)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, stock, description, category]
 *             properties:
 *               name: { type: string, example: "Gaming Mouse" }
 *               description: { type: string, example: "High-DPI mouse for professional gaming." }
 *               price: { type: number, format: float, example: 49.99 }
 *               stock: { type: integer, example: 150 }
 *               category: { type: string, example: "Peripherals" }
 *     responses:
 *       '201':
 *         description: Product created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     object:
 *                       type: object
 *       '400':
 *         description: Invalid input data.
 *       '401':
 *         description: Unauthorized (No token provided).
 *       '403':
 *         description: Forbidden (User is not Admin).
 *   get:
 *     summary: Get a paginated list of products with optional search
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Products per page.
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search term for product name (case-insensitive, partial match).
 *     responses:
 *       '200':
 *         description: Paginated list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               # Note: You would create a specific PaginatedResponse schema here
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 object: { type: array, items: { type: object } }
 *                 pageNumber: { type: integer }
 *                 totalSize: { type: integer }
 *                 # ... other pagination fields
 */

router.get("/", authenticate, getProducts);
router.get("/:id", getProductDetails);
router.post("/", authenticate, isAdmin, createProduct);
router.put("/:id", authenticate, isAdmin, updateProduct);
router.delete("/:id", authenticate, isAdmin, deleteProduct);

export default router;
