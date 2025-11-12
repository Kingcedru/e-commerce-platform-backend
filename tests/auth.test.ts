import request from "supertest";
import app from "../src/app";
import { User } from "../src/models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("bcrypt", () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn(),
}));

describe("POST /auth/register", () => {
  it("should return 201 and create a user with valid data", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockResolvedValue({});

    const response = await request(app).post("/auth/register").send({
      username: "NewUser1",
      email: "test1@example.com",
      password: "Password!123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: "hashed_Password!123", role: "User" })
    );
  });

  it("should return 400 if email is already registered", async () => {
    (User.findOne as jest.Mock).mockResolvedValueOnce({
      id: "uuid-1",
      email: "exists@example.com",
    });

    const response = await request(app).post("/auth/register").send({
      username: "TestUser2",
      email: "exists@example.com",
      password: "Password!123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain(
      "Email address is already registered."
    );
  });

  it("should return 400 for a password that fails complexity requirements", async () => {
    const response = await request(app).post("/auth/register").send({
      username: "WeakUser",
      email: "weak@example.com",
      password: "a1234567",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain(
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  });
});

describe("POST /auth/login", () => {
  const mockUser = {
    id: "uuid-123",
    username: "TestUser",
    email: "login@test.com",
    password: "hashed_password_123",
    role: "User",
  };

  it("should return 200 and a JWT token upon successful login", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    jest.spyOn(jwt, "sign").mockImplementation(() => "mocked-jwt-token" as any);

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "login@test.com", password: "correctpassword" });

    expect(response.statusCode).toBe(200);
    expect(response.body.object.token).toBe("mocked-jwt-token");
    expect(response.body.object).toEqual(
      expect.objectContaining({
        userId: "uuid-123",
        username: "TestUser",
        role: "User",
      })
    );
  });

  it("should return 401 for invalid password", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "login@test.com", password: "wrongpassword" });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid credentials.");
  });

  it("should return 401 if user does not exist", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "nonexistent@test.com", password: "anypassword" });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid credentials.");
  });
});
