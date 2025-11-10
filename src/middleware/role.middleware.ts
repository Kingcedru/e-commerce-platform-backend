import { Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors/forbidden-error";
import { AuthenticatedRequest } from "../types/auth";

export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(
      new ForbiddenError("Authentication error: User information missing.")
    );
  }

  if (req.user.role !== "Admin") {
    return next(
      new ForbiddenError(
        "Forbidden: Only administrators can perform this action."
      )
    );
  }
  next();
};
