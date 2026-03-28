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
    revenueTrends: RevenueByDateDto[];
    topSellingProducts: TopProductDto[];
    paymentMethodStats: PaymentMethodStatDto[];
}

class ReportService {
    /**
     * Get dashboard summary data based on optional date filters.
     * @param filter Date filters
     * @returns Dashboard summary data
     */
    async getDashboardSummary(filter: DashboardFilterDto = {}): Promise<DashboardSummaryDto> {
        const response = await axiosInstance.get('/Reports/dashboard', { params: filter });
        return response.data;
    }
}

export const reportService = new ReportService();
