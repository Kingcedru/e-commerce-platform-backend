import sequelize from "../config/database";
import { Product } from "../models/product.model";
import { Order } from "../models/order.model";
import { NotFoundError } from "../utils/errors/not-found-error";
import { BadRequestError } from "../utils/errors/bad-request-error";
import { OrderStatus } from "@/enums/order";
import { OrderItemRequestDto } from "@/types/order-item";
import { OrderItem } from "@/models/order-item.model";

export const createOrderTransaction = async (
  userId: string,
  orderItemsDto: OrderItemRequestDto[]
) => {
  const newOrder = await sequelize.transaction(async (t) => {
    let totalPrice = 0;
    const productIds = orderItemsDto.map((item) => item.productId);

    const products = await Product.findAll({
      where: { id: productIds },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingId = productIds.find((id) => !foundIds.includes(id));
      throw new NotFoundError(`Product with ID ${missingId} not found.`);
    }

    const orderItemRecords = [];
    for (const itemDto of orderItemsDto) {
      const product = products.find((p) => p.id === itemDto.productId)!;
      const requestedQuantity = itemDto.quantity;

      if (product.stock < requestedQuantity) {
        throw new BadRequestError(
          `Insufficient stock for Product ${product.name}. Available: ${product.stock}, Requested: ${requestedQuantity}`
        );
      }

      const itemPrice = product.price * requestedQuantity;
      totalPrice += itemPrice;

      await product.decrement("stock", {
        by: requestedQuantity,
        transaction: t,
      });

      orderItemRecords.push({
        productId: product.id,
        quantity: requestedQuantity,
        priceAtOrder: product.price,
      });
    }

    const order = await Order.create(
      {
        userId,
        totalPrice,
        status: OrderStatus.PENDING,
        description: `Order of ${orderItemsDto.length} item(s)`,
      },
      { transaction: t }
    );

    const itemsWithOrderId = orderItemRecords.map((item) => ({
      ...item,
      orderId: order.id,
    }));
    await OrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

    const orderWithItems = {
      ...order.toJSON(),
      products: itemsWithOrderId,
    };

    return orderWithItems;
  });

  return newOrder;
};
