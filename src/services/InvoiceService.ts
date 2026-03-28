import { BaseService } from './BaseService';
import axiosInstance from '@/api/axiosInstance';

export interface InvoiceFilterDto {
  searchTerm?: string;
  sortBy?: string;
  isDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
}

export interface InvoiceItemDto {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceDto {
  id: string;
  invoiceCode: string;
  tableName: string;
  checkInTime: string;
  checkOutTime?: string;
  finalAmount: number;
  status: string;
}

export interface InvoiceDetailDto extends InvoiceDto {
  subTotal: number;
  discount: number;
  items: InvoiceItemDto[];
}

export interface InvoicePagedResult {
  items: InvoiceDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalRevenue: number;
}

class InvoiceService extends BaseService<InvoiceDto> {
  constructor() {
    super('Invoices');
  }

  async getInvoicesPaged(filter: InvoiceFilterDto): Promise<any> {
    const params = new URLSearchParams();
    if (filter.searchTerm) params.append('Search', filter.searchTerm);
    if (filter.pageNumber) params.append('PageNumber', filter.pageNumber.toString());
    if (filter.pageSize) params.append('PageSize', filter.pageSize.toString());
    if (filter.fromDate) params.append('FromDate', filter.fromDate);
    if (filter.toDate) params.append('ToDate', filter.toDate);

    return await axiosInstance.get(`/${this.endpoint}?${params.toString()}`);
  }

  async getInvoiceDetail(id: string): Promise<any> {
    return await axiosInstance.get(`/${this.endpoint}/${id}`);
  }
}

export default new InvoiceService();
