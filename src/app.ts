import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { config } from "dotenv";
import { connectDB } from "@/config/database";
import { errorHandler } from "./middleware/error-handler.middleware";
import { MulterError } from "multer";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config";

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors(),
  helmet(),
  morgan("dev"),
  express.json(),
  express.urlencoded({ extended: true })
);

interface ErrorWithStatus extends Error {
  status?: number;
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_, res) => res.status(200).json({ status: "OK" }));
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

// This middleware will handle Multer-specific errors.
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    }
    return next(err);
  }
);

app.use(errorHandler);

app.use(
  (
    err: ErrorWithStatus,
    _: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(err.status || 500).json({
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
