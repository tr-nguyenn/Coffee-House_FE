import { BaseService } from "./BaseService";
import type { Table } from "@/models/Table";
import axiosInstance from "@/api/axiosInstance";

class TableService extends BaseService<Table> {
  constructor() {
    super("tables");
  }

  async getTablesWithStatus(): Promise<any[]> {
    const response = await axiosInstance.get("/tables/status");
    return response.data;
  }
}

export const tableService = new TableService();
