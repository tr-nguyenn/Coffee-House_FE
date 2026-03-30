import axiosInstance from "@/api/axiosInstance";
import type {AddOrderItemsDto, CheckoutOrderDto, CreateOrderDto, KitchenTicketDto} from "@/models/Order";
import type {OrderResult} from "@/stores/posStore";

class OrderService {
  async createOrder(dto: CreateOrderDto): Promise<OrderResult> {
    const response = await axiosInstance.post("/orders", dto);
    return response.data;
  }

  async addItemsToOrder(orderId: string, dto: AddOrderItemsDto): Promise<OrderResult> {
    const response = await axiosInstance.put(`/orders/${orderId}/add-items`, dto);
    return response.data;
  }

  async getOrderById(orderId: string): Promise<any> {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  }

  async openTable(tableId: string): Promise<any> {
    const response = await axiosInstance.post(`/orders/open-table/${tableId}`);
    return response.data;
  }

  async checkoutOrder(orderId: string, dto: CheckoutOrderDto): Promise<any> {
    const response = await axiosInstance.put(`/orders/${orderId}/checkout`, dto);
    return response.data;
  }

  async getPendingKitchenItems(): Promise<KitchenTicketDto[]> {
    const response = await axiosInstance.get(`/orders/kitchen-tickets`);
    return response.data;
  }

  async markItemReady(itemId: string): Promise<{message: string}> {
    const response = await axiosInstance.put(`/orders/items/${itemId}/ready`);
    return response.data;
  }

  async getManagementOrders(params: any) {
    const response = await axiosInstance.get("Orders/management", {params});
    return response.data;
  }
}

export const orderService = new OrderService();
