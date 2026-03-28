import axiosInstance from "@/api/axiosInstance";

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
  userId?: string | null;
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
}

class OrderService {
  async createOrder(dto: CreateOrderDto): Promise<OrderResult> {
    const response = await axiosInstance.post("/orders", dto);
    return response.data;
  }

  async addItemsToOrder(orderId: string, dto: AddOrderItemsDto): Promise<OrderResult> {
    const response = await axiosInstance.put(`/orders/${orderId}/add-items`, dto);
    return response.data;
  }

  // 👉 THÊM HÀM NÀY: Lấy chi tiết hóa đơn cũ của bàn Đỏ
  async getOrderById(orderId: string): Promise<any> {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  }

  // 👉 THÊM HÀM NÀY: Mở bàn trống
  async openTable(tableId: string): Promise<any> {
    const response = await axiosInstance.post(`/orders/open-table/${tableId}`);
    return response.data;
  }

  // 👉 THÊM HÀM NÀY: Thanh toán và dọn bàn
  async checkoutOrder(orderId: string, dto: CheckoutOrderDto): Promise<any> {
    const response = await axiosInstance.put(`/orders/${orderId}/checkout`, dto);
    return response.data;
  }

  // 👉 HÀM DÀNH CHO BẾP
  async getPendingKitchenItems(): Promise<KitchenTicketDto[]> {
    const response = await axiosInstance.get(`/orders/kitchen-tickets`);
    return response.data;
  }

  async markItemReady(itemId: string): Promise<{ message: string }> {
    const response = await axiosInstance.put(`/orders/items/${itemId}/ready`);
    return response.data;
  }
}




export const orderService = new OrderService();
