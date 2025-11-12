jest.mock("../src/models/user.model", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../src/models/product.model", () => ({
  Product: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    decrement: jest.fn(),
  },
}));

jest.mock("../src/models/order.model", () => ({
  Order: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.mock("../src/models/order-item.model", () => ({
  OrderItem: {
    bulkCreate: jest.fn(),
  },
}));

jest.mock("../src/config/database", () => ({
  __esModule: true, // This is important for ES module default exports
  default: {
    // This is the mock for the default export
    transaction: jest.fn(async (callback) => {
      return callback({
        commit: jest.fn(),
        rollback: jest.fn(),
        LOCK: { UPDATE: "UPDATE" },
      });
    }),
    authenticate: jest.fn(),
    sync: jest.fn(),
  },
  connectDB: jest.fn(() => Promise.resolve()), // Mock the named export as well
}));

beforeEach(() => {
  jest.clearAllMocks();
});
