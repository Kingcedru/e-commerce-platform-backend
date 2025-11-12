import request from "supertest";
import app from "../src/app";
import { Product } from "../src/models/product.model";
import { Order } from "../src/models/order.model";
import jwt from "jsonwebtoken";

const mockUserPayload = {
  userId: "user-id-456",
  username: "User",
  role: "User",
};
const userToken = jwt.sign(mockUserPayload, "TEST_SECRET");
const userHeader = `Bearer ${userToken}`;

jest.spyOn(jwt, "verify").mockImplementation((token) => {
  if (token === userToken) return mockUserPayload;
  throw new Error("Invalid token");
});

const uuidA = "4b1a4e1d-3b5f-4a0b-8d9c-1d0b5f4a1e3b";
const uuidB = "3c0b5f4a-8d9c-1d0b-4e1d-3b5f4a0b8d9c";

const mockProductA = { id: uuidA, price: 10.0, stock: 5 };
const mockProductB = { id: uuidB, price: 50.0, stock: 1 };

const mockOrderItems = [
  { productId: uuidA, quantity: 2 },
  { productId: uuidB, quantity: 1 },
];

describe("POST /orders", () => {
  it("should return 201 and commit transaction on success", async () => {
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

    (Product.findAll as jest.Mock).mockResolvedValue([
      mockProductInstanceA,
      mockProductInstanceB,
    ]);

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

    expect(response.statusCode).toBe(201);
    expect(response.body.object.totalPrice).toBe(70.0);
    expect(Product.findAll).toHaveBeenCalled();
    expect(Order.create).toHaveBeenCalled();
    expect(mockProductInstanceA.decrement).toHaveBeenCalledWith("stock", {
      by: 2,
      transaction: expect.anything(),
    });
  });

  it("should return 400 and ROLLBACK if stock is insufficient", async () => {
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

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Insufficient stock");

    expect(Order.create).not.toHaveBeenCalled();
  });
});

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
    expect(Order.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: mockUserPayload.userId } })
    );
  });

  it("should return 401 if unauthenticated", async () => {
    const response = await request(app).get("/orders");

    expect(response.statusCode).toBe(401);
  });
});
