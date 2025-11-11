import sequelize from "@/config/database.config";
import { UserRole } from "@/enums/role";
import { UserType } from "@/types/user";
import { DataTypes, Model, Optional } from "sequelize";

export class User
  extends Model<UserType, Optional<UserType, "id">>
  implements UserType
{
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      defaultValue: UserRole.User,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "user",
    timestamps: true,
    scopes: {
      excludePassword: { attributes: { exclude: ["password"] } },
    },
  }
);
