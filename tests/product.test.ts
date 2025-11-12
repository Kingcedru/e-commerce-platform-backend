import request from "supertest";
import app from "../src/app";
import { Product } from "../src/models/product.model";
import jwt from "jsonwebtoken";

const mockAdminPayload = {
  userId: "admin-id-123",
  username: "Admin",
  role: "Admin",
};
const mockUserPayload = {
  userId: "user-id-456",
  username: "User",
  role: "User",
};
const adminToken = jwt.sign(mockAdminPayload, "TEST_SECRET");
const userToken = jwt.sign(mockUserPayload, "TEST_SECRET");
const adminHeader = `Bearer ${adminToken}`;
const userHeader = `Bearer ${userToken}`;

const mockProduct = {
  id: "prod-uuid-1",
  name: "Test Product",
  description: "Long description.",
  price: 10.99,
  stock: 50,
  category: "Electronics",
};

jest.spyOn(jwt, "verify").mockImplementation((token) => {
  if (token === adminToken) return mockAdminPayload;
  if (token === userToken) return mockUserPayload;
  throw new Error("Invalid token");
});

describe("POST /products", () => {
  it("should return 201 when created by Admin", async () => {
    (Product.create as jest.Mock).mockResolvedValue(mockProduct);

    const response = await request(app)
      .post("/products")
      .set("Authorization", adminHeader)
      .send({
        name: "Test Product",
        description: "A great product",
        price: 10.99,
        stock: 50,
        category: "Electronics",
      });

    expect(response.statusCode).toBe(201);
    expect(Product.create).toHaveBeenCalled();
  });

  it("should return 403 when accessed by standard User", async () => {
    const response = await request(app)
      .post("/products")
      .set("Authorization", userHeader)
      .send(mockProduct);

    expect(response.statusCode).toBe(403);
  });
});

describe("PUT /products/:id", () => {
  it("should return 200 when updated by Admin", async () => {
    (Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);
    (Product.update as jest.Mock).mockResolvedValue([1, [mockProduct]]);

    const response = await request(app)
      .put("/products/prod-uuid-1")
      .set("Authorization", adminHeader)
      .send({ price: 15.0 });

    expect(response.statusCode).toBe(200);
    expect(Product.update).toHaveBeenCalledWith(
      { price: 15.0 },
      expect.anything()
    );
  });

  it("should return 404 if product not found", async () => {
    (Product.findByPk as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .put("/products/non-existent-id")
      .set("Authorization", adminHeader)
      .send({ price: 15.0 });

    expect(response.statusCode).toBe(404);
  });
});

describe("GET /products/:id", () => {
  it("should return 200 and product details", async () => {
    (Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);

    const response = await request(app).get("/products/prod-uuid-1");

    expect(response.statusCode).toBe(200);
    expect(response.body.object.name).toBe("Test Product");
  });

  it("should return 404 if product not found", async () => {
    (Product.findByPk as jest.Mock).mockResolvedValue(null);

    const response = await request(app).get("/products/non-existent-id");

    expect(response.statusCode).toBe(404);
  });
});

describe("GET /products (List & Search)", () => {
  it("should return 200 with paginated list and defaults", async () => {
    (Product.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [mockProduct],
      count: 15,
    });

    const response = await request(app)
      .get("/products?page=1")
      .set("Authorization", userHeader);

    expect(response.statusCode).toBe(200);
    expect(response.body.pageNumber).toBe(1);
    expect(response.body.pageSize).toBe(10);
    expect(response.body.totalSize).toBe(15);
  });

  it("should apply search filter", async () => {
    (Product.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [],
      count: 0,
    });

    await request(app)
      .get("/products?search=shirt")
      .set("Authorization", userHeader);

    expect(Product.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: { [require("sequelize").Op.iLike]: "%shirt%" } },
      })
    );
  });
});
