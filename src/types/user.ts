import { UserRole } from "@/enums/role";

export interface UserType {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserRegistrationDto {
  username: string;
  email: string;
  password: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  userId: string;
  username: string;
  role: UserRole;
}
