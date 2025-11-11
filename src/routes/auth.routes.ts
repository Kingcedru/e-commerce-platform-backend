import { Router } from "express";
import { register, login } from "../controllers/auth.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication and account management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string, example: "NewCustomer", description: "Must be unique and alphanumeric." }
 *               email: { type: string, format: email, example: "customer@example.com", description: "Must be a valid, unique email address." }
 *               password: { type: string, example: "StrongPwd!123", description: "Must meet complexity requirements (min 8 chars, one uppercase, lowercase, number, special char)." }
 *     responses:
 *       '201':
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       '400':
 *         description: Validation failed or user/email already exists.
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in to the system
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "customer@example.com" }
 *               password: { type: string, example: "StrongPwd!123" }
 *     responses:
 *       '200':
 *         description: Login successful, returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     object:
 *                       type: object
 *                       properties:
 *                         token: { type: string, description: "JSON Web Token for authentication." }
 *                         userId: { type: string }
 *                         role: { type: string }
 *       '401':
 *         description: Invalid credentials or password mismatch.
 */

router.post("/login", login);

export default router;
