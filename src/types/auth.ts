import { UserRole } from "@/enums/role";
import { Request } from "express";

export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
