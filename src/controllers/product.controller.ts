import { Response, NextFunction } from "express";
import { Product } from "../models/product.model";
import {
  createProductSchema,
  updateProductSchema,
} from "../utils/validation/product.schema";
import { sendSuccess } from "../utils/response";
import { BadRequestError } from "../utils/errors/bad-request-error";
import { AuthenticatedRequest } from "../types/auth";
import { NotFoundError } from "@/utils/errors/not-found-error";

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

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = updateProductSchema.validate(req.body);
  if (error) {
    return next(new BadRequestError(error.details[0].message));
  }

  const productId = req.params.id;

  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      return next(new NotFoundError(`Product with ID ${productId} not found.`));
    }

    const [, [updatedProduct]] = await Product.update(value, {
      where: { id: productId },
      returning: true,
    });

    sendSuccess(res, 200, "Product updated successfully.", updatedProduct);
  } catch (err) {
    next(err);
  }
};
