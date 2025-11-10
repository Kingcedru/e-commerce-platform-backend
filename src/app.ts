import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { config } from "dotenv";
import { connectDB } from "@/config/database";
import { errorHandler } from "./middleware/error-handler.middleware";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";

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

app.get("/health", (_, res) => res.status(200).json({ status: "OK" }));
app.use("/auth", authRoutes);
app.use("/products", productRoutes);

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
