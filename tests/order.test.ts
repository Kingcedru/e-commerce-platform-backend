import request from "supertest";
import app from "../src/app";
import { Product } from "../src/models/product.model";
import { Order } from "../src/models/order.model";
import sequelize from "../src/config/database";
import jwt from "jsonwebtoken";

// Setup mock user token for authenticated access
const mockUserPayload = {
  userId: "user-id-456",
  username: "User",
  role: "User",
};
const userToken = jwt.sign(mockUserPayload, "TEST_SECRET");
const userHeader = `Bearer ${userToken}`;

// Mock the JWT verification in middleware to always pass for the user token
jest.spyOn(jwt, "verify").mockImplementation((token) => {
  if (token === userToken) return mockUserPayload;
  throw new Error("Invalid token");
});

// Use UUID-compliant IDs for Joi validation in the order schema
const uuidA = "4b1a4e1d-3b5f-4a0b-8d9c-1d0b5f4a1e3b";
const uuidB = "3c0b5f4a-8d9c-1d0b-4e1d-3b5f4a0b8d9c";

const mockProductA = { id: uuidA, price: 10.0, stock: 5 };
const mockProductB = { id: uuidB, price: 50.0, stock: 1 };

const mockOrderItems = [
  { productId: uuidA, quantity: 2 }, // Total: 20.00
  { productId: uuidB, quantity: 1 }, // Total: 50.00
];

// --- Test Suite for POST /orders (Transactional - User Story 9) ---
describe("POST /orders", () => {
  it("should return 201 and commit transaction on success", async () => {
    // Mock product instances must include internal Sequelize methods like 'decrement' and 'get'
    const mockProductInstanceA = {
      ...mockProductA,
      decrement: jest.fn(),
      get: (key: string) => (mockProductA as any)[key],
    } as unknown as Product;
    const mockProductInstanceB = {
      ...mockProductB,
      decrement: jest.fn(),
      get: (key: string) => (mockProductB as any)[key],
    } as unknown as Product;

    // Mock Product.findAll to return the necessary products for stock check
    (Product.findAll as jest.Mock).mockResolvedValue([
      mockProductInstanceA,
      mockProductInstanceB,
    ]);

    // Mock Order.create
    (Order.create as jest.Mock).mockResolvedValue({
      id: "order-uuid-1",
      totalPrice: 70.0,
      userId: mockUserPayload.userId,
      toJSON: () => ({
        id: "order-uuid-1",
        totalPrice: 70.0,
        userId: mockUserPayload.userId,
      }),
    });

    const response = await request(app)
      .post("/orders")
      .set("Authorization", userHeader)
      .send(mockOrderItems);

    expect(response.statusCode).toBe(201); // Expect 201 (Should now pass)
    expect(response.body.object.totalPrice).toBe(70.0);
    expect(Product.findAll).toHaveBeenCalled();
    expect(Order.create).toHaveBeenCalled();
    // Verify stock was decremented correctly
    expect(mockProductInstanceA.decrement).toHaveBeenCalledWith("stock", {
      by: 2,
      transaction: expect.anything(),
    });
  });

  it("should return 400 and ROLLBACK if stock is insufficient", async () => {
    // Mock product A with insufficient stock
    const mockFailingProductInstance = {
      ...mockProductA,
      id: uuidA,
      price: 10.0,
      stock: 1,
      decrement: jest.fn(),
    } as unknown as Product;

    (Product.findAll as jest.Mock).mockResolvedValue([
      mockFailingProductInstance,
    ]);

    const failingItems = [{ productId: uuidA, quantity: 5 }];

    const response = await request(app)
      .post("/orders")
      .set("Authorization", userHeader)
      .send(failingItems);

    expect(response.statusCode).toBe(400); // 400 Bad Request
    expect(response.body.message).toContain("Insufficient stock");

    // Assert that no order was created, ensuring rollback integrity
    expect(Order.create).not.toHaveBeenCalled();
  });
});

// --- Test Suite for GET /orders (Order History - User Story 10) ---
describe("GET /orders", () => {
  it("should return 200 with orders filtered by authenticated user ID", async () => {
    const mockOrders = [
      {
        id: "order-1",
        totalPrice: 100,
        status: "pending",
        createdAt: new Date(),
      },
    ];
    (Order.findAll as jest.Mock).mockResolvedValue(mockOrders);

    const response = await request(app)
      .get("/orders")
      .set("Authorization", userHeader);

    expect(response.statusCode).toBe(200);
    expect(response.body.object.length).toBe(1);
    // Verify that the query filters by the logged-in user's ID
    expect(Order.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: mockUserPayload.userId } })
    );
  });

  it("should return 401 if unauthenticated", async () => {
    // Test relies on the auth.middleware to catch the missing header and return 401
    const response = await request(app).get("/orders");

    expect(response.statusCode).toBe(401);
  });
});
