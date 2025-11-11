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
 *   - name: Products
 *     description: Product management (Admin) and public catalog browsing
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
 *       '201': { description: "Product created successfully." }
 *       '400': { description: "Invalid input data." }
 *       '401': { description: "Unauthorized (No token provided)." }
 *       '403': { description: "Forbidden (User is not Admin)." }
 *   get:
 *     summary: Get a paginated list of products with optional search (PUBLIC)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: The number of products per page.
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
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 object: { type: array, description: "Array of product objects for the current page." }
 *                 pageNumber: { type: integer, description: "The current page number." }
 *                 totalSize: { type: integer, description: "Total count of products matching the search/filter." }
 *                 totalPages: { type: integer }
 */
router.post("/", authenticate, isAdmin, createProduct);
router.get("/", authenticate, getProducts);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Updates an existing product (ADMIN REQUIRED)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID of the product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Updated Gaming Mouse" }
 *               price: { type: number, format: float, example: 55.00 }
 *     responses:
 *       '200': { description: "Product updated successfully." }
 *       '400': { description: "Invalid field data or empty body." }
 *       '403': { description: "Forbidden." }
 *       '404': { description: "Product not found." }
 *
 *   get:
 *     summary: Get detailed information for a specific product (PUBLIC)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID of the product to retrieve.
 *     responses:
 *       '200': { description: "Product details retrieved successfully." }
 *       '404': { description: "Product not found." }
 *
 *   delete:
 *     summary: Deletes a product permanently (ADMIN REQUIRED)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID of the product to delete.
 *     responses:
 *       '200': { description: "Product deleted successfully." }
 *       '401': { description: "Unauthorized." }
 *       '403': { description: "Forbidden." }
 *       '404': { description: "Product not found." }
 */
router.get("/:id", getProductDetails);
router.put("/:id", authenticate, isAdmin, updateProduct);
router.delete("/:id", authenticate, isAdmin, deleteProduct);

export default router;
