import { UserRole } from "@/enums/role";

export type UserType = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
};
