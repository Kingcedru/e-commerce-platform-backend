import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/errors/custom-error";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      object: null,
      errors: err.serializeErrors().map((e) => e.message),
    });
  }

  console.error("Unhandled Error:", err);
  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
    object: null,
    errors: ["Server Internal Error"],
  });
};
