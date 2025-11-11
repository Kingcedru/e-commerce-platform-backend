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
import { Op } from "sequelize";
import cloudinary, { dataUri } from "../config/cloudinary.config";

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const body = {
    ...req.body,
    price: req.body.price ? parseFloat(req.body.price) : undefined,
    stock: req.body.stock ? parseInt(req.body.stock, 10) : undefined,
  };

  const { error, value } = createProductSchema.validate(body);
  const file = req.file;
  if (error) {
    return next(new BadRequestError(error.details[0].message));
  }

  try {
    const { userId } = req.user!;
    let imageUrl: string | null = null;

    if (file) {
      imageUrl = await uploadAndReplaceImage(file);
    }

    const newProduct = await Product.create({
      ...value,
      userId: userId,
      imageUrl: imageUrl,
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
  const body = {
    ...req.body,
    price: req.body.price ? parseFloat(req.body.price) : undefined,
    stock: req.body.stock ? parseInt(req.body.stock, 10) : undefined,
  };

  const { error, value } = updateProductSchema.validate(body);
  const file = req.file;

  if (error) {
    return next(new BadRequestError(error.details[0].message));
  }

  const productId = req.params.id;

  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      return next(new NotFoundError(`Product with ID ${productId} not found.`));
    }

    if (file) {
      const publicId = extractPublicIdFromUrl(product.imageUrl);
      product.imageUrl = await uploadAndReplaceImage(file, publicId);
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
    const searchTerm = req.query.search as string;

    if (page < 1 || limit < 1) {
      return next(
        new BadRequestError("Page and limit/pageSize must be positive numbers.")
      );
    }

    const offset = (page - 1) * limit;
    let whereClause = {};

    if (searchTerm && searchTerm.trim() !== "") {
      whereClause = {
        name: {
          [Op.iLike]: `%${searchTerm.trim()}%`,
        },
      };
    }

    const result = await Product.findAndCountAll({
      where: whereClause,
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

export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const productId = req.params.id;

  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      return next(new NotFoundError("Product not found."));
    }

    sendSuccess(res, 200, "Product details retrieved successfully.", product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const productId = req.params.id;

  try {
    const deletedRowCount = await Product.destroy({
      where: { id: productId },
    });

    if (deletedRowCount === 0) {
      return next(new NotFoundError("Product not found."));
    }

    sendSuccess(res, 200, "Product deleted successfully.");
  } catch (err) {
    next(err);
  }
};

/**
 * Handles the upload of a file buffer to Cloudinary.
 * @param file The Express.Multer.File object from req.file
 * @param existingPublicId Optional public ID to replace/delete an old image
 * @returns The new image URL
 */
const uploadAndReplaceImage = async (
  file: Express.Multer.File | undefined,
  existingPublicId: string | null = null
): Promise<string | null> => {
  if (!file) return null;

  if (existingPublicId) {
    // Option 1: Delete the old image (highly recommended)
    await cloudinary.uploader.destroy(existingPublicId);
  }

  // Option 2: Upload the new image
  const fileUri = dataUri(file);
  const result = await cloudinary.uploader.upload(fileUri as string, {
    folder: "ecommerce/products",
  });
  return result.secure_url;
};

const extractPublicIdFromUrl = (url: string | null): string | null => {
  if (!url) return null;
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  const publicId = filename.substring(0, filename.lastIndexOf("."));
  return `ecommerce/products/${publicId}`;
};
