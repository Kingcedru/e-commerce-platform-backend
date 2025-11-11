import { Response, NextFunction } from "express";
import { createOrderSchema } from "../utils/validation/order.schema";
import { BadRequestError } from "../utils/errors/bad-request-error";
import { sendSuccess } from "../utils/response";
import { createOrderTransaction } from "../services/order.service";
import { AuthenticatedRequest } from "@/types/auth";
import { OrderItemRequestDto } from "@/types/order-item";

export const placeOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = createOrderSchema.validate(req.body);
  if (error) {
    return next(new BadRequestError(error.details[0].message));
  }

  try {
    const userId = req.user!.userId;
    const orderItems: OrderItemRequestDto[] = value;

    const newOrder = await createOrderTransaction(userId, orderItems);

    sendSuccess(res, 201, "Order placed successfully.", newOrder);
  } catch (err) {
    next(err);
  }
};
