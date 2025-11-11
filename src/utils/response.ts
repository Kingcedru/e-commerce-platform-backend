import { Response } from "express";

interface BaseResponse {
  success: boolean;
  message: string;
  object?: object | object[] | null;
  errors?: string[] | null;
}

interface PaginatedResponse extends BaseResponse {
  pageNumber: number;
  pageSize: number;
  totalSize: number;
  totalPages: number;
}

export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: object | object[] | null
) => {
  const response: BaseResponse = {
    success: true,
    message,
    object: data,
    errors: null,
  };
  res.status(statusCode).json(response);
};

export const sendPaginatedSuccess = (
  res: Response,
  message: string,
  data: object[],
  pagination: Omit<
    PaginatedResponse,
    "success" | "message" | "object" | "errors"
  >
) => {
  const response: PaginatedResponse = {
    success: true,
    message,
    object: data,
    errors: null,
    ...pagination,
  };
  res.status(200).json(response);
};
