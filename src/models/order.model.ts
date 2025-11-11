import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database.config";
import { User } from "./user.model";
import { OrderType } from "@/types/order";
import { OrderStatus } from "@/enums/order";

export class Order
  extends Model<OrderType, Optional<OrderType, "id">>
  implements OrderType
{
  public id!: string;
  public userId!: string;
  public description!: string;
  public totalPrice!: number;
  public status!: OrderStatus;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: { model: "user", key: "id" },
      allowNull: false,
    },
    description: { type: DataTypes.STRING, allowNull: true },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("pending", "shipped", "delivered", "cancelled"),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  { sequelize, tableName: "order", timestamps: true }
);

Order.belongsTo(User, { foreignKey: "userId", as: "customer" });
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
