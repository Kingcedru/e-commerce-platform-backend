import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { Order } from "./order.model";
import { Product } from "./product.model";
import { OrderItemType } from "@/types/order-item";

export class OrderItem
  extends Model<OrderItemType, Optional<OrderItemType, "id">>
  implements OrderItemType
{
  public id!: string;
  public orderId!: string;
  public productId!: string;
  public quantity!: number;
  public priceAtOrder!: number;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      references: { model: "order", key: "id" },
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      references: { model: "product", key: "id" },
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    priceAtOrder: { type: DataTypes.FLOAT, allowNull: false },
  },
  { sequelize, tableName: "order_item", timestamps: false }
);

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });
