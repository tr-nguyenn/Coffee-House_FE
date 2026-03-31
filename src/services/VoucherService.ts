import {BaseService} from "./BaseService";
import axiosInstance from "@/api/axiosInstance";

export interface VoucherDto {
  id: string;
  code: string;
  description: string;
  discountType: string; // "FixedAmount" | "Percentage"
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUpdateVoucherDto {
  code: string;
  description: string;
  discountType: number; // 1 = FixedAmount, 2 = Percentage
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
}

class VoucherService extends BaseService<VoucherDto> {
  constructor() {
    super("vouchers");
  }

  async toggleActive(id: string): Promise<any> {
    const response = await axiosInstance.put(`/${this.endpoint}/${id}/toggle`);
    return response.data;
  }

  async validate(code: string, orderTotal: number): Promise<any> {
    const response = await axiosInstance.get(`/${this.endpoint}/validate`, {
      params: {code, orderTotal},
    });
    return response.data;
  }
}

export const voucherService = new VoucherService();
