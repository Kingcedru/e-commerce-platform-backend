import { Response, NextFunction } from "express";
import { Product } from "../models/product.model";
import { createProductSchema } from "../utils/validation/product.schema";
import { sendSuccess } from "../utils/response";
import { BadRequestError } from "../utils/errors/bad-request-error";
import { AuthenticatedRequest } from "../types/auth";

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = createProductSchema.validate(req.body);
  if (error) {
    return next(new BadRequestError(error.details[0].message));
  }

  try {
    const { userId } = req.user!;

    const newProduct = await Product.create({
      ...value,
      userId: userId,
    });

    sendSuccess(res, 201, "Product created successfully.", newProduct);
  } catch (err) {
    next(err);
  }
};
