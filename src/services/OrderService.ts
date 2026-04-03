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

  async updatePaymentMethod(orderId: string, paymentMethod: string): Promise<any> {
    const response = await axiosInstance.put(`/orders/${orderId}/payment-method`, `"${paymentMethod}"`, {
      headers: { "Content-Type": "application/json" }
    });
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
    // Serialize mảng statuses thành query string chuẩn ASP.NET: statuses=A&statuses=B
    const response = await axiosInstance.get("orders/management", {
      params,
      paramsSerializer: (p) => {
        const parts: string[] = [];
        for (const key of Object.keys(p)) {
          const val = p[key];
          if (val === undefined || val === null || val === "") continue;
          if (Array.isArray(val)) {
            val.forEach((v: any) => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
          } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
          }
        }
        return parts.join("&");
      },
    });
    return response.data;
  }

  // 👉 Lấy danh sách nhân viên cho dropdown lọc
  async getStaffList(): Promise<{id: string; name: string}[]> {
    const response = await axiosInstance.get("/staffs/simple-list");
    return response.data;
  }

  // 👉 Xuất Excel (download file .xlsx)
  async exportManagementOrdersExcel(params: any): Promise<Blob> {
    const response = await axiosInstance.get("orders/management/export-excel", {
      params,
      responseType: "blob",
      paramsSerializer: (p) => {
        const parts: string[] = [];
        for (const key of Object.keys(p)) {
          const val = p[key];
          if (val === undefined || val === null || val === "") continue;
          if (Array.isArray(val)) {
            val.forEach((v: any) => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
          } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
          }
        }
        return parts.join("&");
      },
    });
    return response.data;
  }
}

export const orderService = new OrderService();
