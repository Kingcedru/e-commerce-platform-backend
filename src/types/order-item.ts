export interface OrderItemType {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtOrder: number;
}

export interface OrderItemRequestDto {
  productId: string;
  quantity: number;
}
