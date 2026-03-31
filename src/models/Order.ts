export interface OrderItemDto {
  productId: string;
  quantity: number;
  note?: string | null;
}

export interface KitchenTicketDto {
  orderDetailId: string;
  productName: string;
  quantity: number;
  note?: string | null;
  tableName: string;
  prepStartTime?: string | null;
}

export interface CreateOrderDto {
  tableId?: string | null;
  customerId?: string | null;
  note?: string | null;
  paymentMethod: string;
  items: OrderItemDto[];
  voucherId?: string | null;
  pointsUsed?: number;
  customerName?: string | null;
  customerPhone?: string | null;
}

export interface OrderResult {
  message: string;
  orderId: string;
  finalAmount: number;
  pointsEarned: number;
}

export interface AddOrderItemsDto {
  newItems: OrderItemDto[];
}

export interface CheckoutOrderDto {
  paymentMethod: string;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  pointsUsed?: number;
  voucherId?: string | null;
}
