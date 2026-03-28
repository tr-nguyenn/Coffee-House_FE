// Định nghĩa cấu trúc cột cho BaseTable
export interface TableColumn {
  label: string;
  key: string;
  width?: string;
}

// Định nghĩa cấu trúc phân trang từ API .NET trả về
export interface PagingInfo {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

//Toast
export interface Toast {
  id: number;
  message: string;
  type: "success" | "danger" | "warning" | "info";
  duration?: number;
}
