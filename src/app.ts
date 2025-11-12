import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./middleware/error-handler.middleware";
import { MulterError } from "multer";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config";
import * as dotenv from "dotenv";
import { NotFoundError } from "./utils/errors/not-found-error";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_, res) => res.status(200).json({ status: "OK" }));
app.use("/auth", authRoutes);
// Routes
app.use("/products", productRoutes);
app.use("/auth", authRoutes);
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
app.use((req, res, next) => {
  next(new NotFoundError("Route not found"));
});

app.use(errorHandler);

export default app;
