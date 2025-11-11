import { OrderStatus } from "@/enums/order";

export interface OrderType {
  id: string;
  userId: string;
  description: string;
  totalPrice: number;
  status: OrderStatus;
}
