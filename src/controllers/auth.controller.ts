import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { UserRole } from "@/enums/role";
import { UserLoginDto, UserRegistrationDto } from "@/types/user";
import { loginSchema, registerSchema } from "@/utils/validation/auth.schema";
import { BadRequestError } from "@/utils/errors/bad-request-error";
import { sendSuccess } from "@/utils/response";
import { UnauthorizedError } from "@/utils/errors/unauthorized-error";

export const register = async (
  req: Request<{}, {}, UserRegistrationDto>,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return next(new BadRequestError(error.details[0].message));
  }

  try {
    const { username, email, password } = value;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new BadRequestError("Email address is already registered."));
    }
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return next(new BadRequestError("Username is already taken."));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
      role: UserRole.User,
    });

    sendSuccess(res, 201, "User registered successfully. You can now log in."); // 201 Created
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request<{}, {}, UserLoginDto>,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return next(new BadRequestError(error.details[0].message));
  }

  try {
    const { email, password } = value;

    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new UnauthorizedError("Invalid credentials."));
    }

    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    const responseData = {
      token,
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    sendSuccess(res, 200, "Login successful.", responseData); // 200 OK
  } catch (err) {
    next(err);
  }
};
