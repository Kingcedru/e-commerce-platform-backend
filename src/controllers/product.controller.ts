import { Request, Response, NextFunction } from "express";
import { Product } from "../models/product.model";
import {
  createProductSchema,
  updateProductSchema,
} from "../utils/validation/product.schema";
import { sendPaginatedSuccess, sendSuccess } from "../utils/response";
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

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit =
      parseInt((req.query.limit as string) || (req.query.pageSize as string)) ||
      10;

    if (page < 1 || limit < 1) {
      return next(
        new BadRequestError("Page and limit/pageSize must be positive numbers.")
      );
    }

    const offset = (page - 1) * limit;

    const result = await Product.findAndCountAll({
      limit: limit,
      offset: offset,
      attributes: ["id", "name", "price", "stock", "category", "description"],
    });

    const totalProducts = result.count;
    const products = result.rows;
    const totalPages = Math.ceil(totalProducts / limit);

    sendPaginatedSuccess(res, "Products retrieved successfully.", products, {
      pageNumber: page,
      pageSize: limit,
      totalSize: totalProducts,
      totalPages: totalPages,
    });
  } catch (err) {
    next(err);
  }
};
