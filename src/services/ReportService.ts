import axiosInstance from "@/api/axiosInstance";

// Interfaces for API Request/Response
export interface DashboardFilterDto {
  startDate?: string | null;
  endDate?: string | null;
}

export interface RevenueByDateDto {
  date: string;
  revenue: number;
}

export interface TopProductDto {
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface PaymentMethodStatDto {
  paymentMethod: string;
  count: number;
  totalAmount: number;
}

export interface DashboardSummaryDto {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  revenueTrends: RevenueByDateDto[];
  topSellingProducts: TopProductDto[];
  paymentMethodStats: PaymentMethodStatDto[];
}

// DTO mới cho 3 báo cáo chuyên sâu
export interface RevenueReportItemDto {
  date: string;
  totalRevenue: number;
  orderCount: number;
}

export interface PeakHourDto {
  hour: number;
  orderCount: number;
}

class ReportService {
  async getDashboardSummary(filter: DashboardFilterDto = {}): Promise<DashboardSummaryDto> {
    const response = await axiosInstance.get("/Reports/dashboard", {params: filter});
    return response.data;
  }

  // Báo cáo Doanh thu theo ngày
  async getRevenueReport(startDate: string, endDate: string): Promise<RevenueReportItemDto[]> {
    const response = await axiosInstance.get("/Reports/revenue", {
      params: { startDate, endDate }
    });
    return response.data;
  }

  // Báo cáo Top sản phẩm bán chạy
  async getTopProductsReport(startDate: string, endDate: string): Promise<TopProductDto[]> {
    const response = await axiosInstance.get("/Reports/top-products", {
      params: { startDate, endDate }
    });
    return response.data;
  }

  // Báo cáo Giờ cao điểm
  async getPeakHoursReport(startDate: string, endDate: string): Promise<PeakHourDto[]> {
    const response = await axiosInstance.get("/Reports/peak-hours", {
      params: { startDate, endDate }
    });
    return response.data;
  }
}

export const reportService = new ReportService();

