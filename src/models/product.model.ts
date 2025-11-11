import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database.config";
import { User } from "./user.model";
import { ProductType } from "@/types/product";

export class Product
  extends Model<ProductType, Optional<ProductType, "id">>
  implements ProductType
{
  public id!: string;
  public name!: string;
  public description!: string;
  public price!: number;
  public stock!: number;
  public category!: string;
  public userId!: string;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { isFloat: true, min: 0.01 },
    },
    stock: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    category: { type: DataTypes.STRING, allowNull: false },
    userId: {
      type: DataTypes.UUID,
      references: { model: "user", key: "id" },
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "product",
    timestamps: true,
  }
);

Product.belongsTo(User, { foreignKey: "userId", as: "creator" });
User.hasMany(Product, { foreignKey: "userId", as: "products" });
