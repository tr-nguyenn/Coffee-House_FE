import axiosInstance from "@/api/axiosInstance";

export class BaseService<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(params?: any): Promise<any> {
    const response = await axiosInstance.get(`/${this.endpoint}`, {params});
    return response.data;
  }

  async getById(id: string): Promise<T> {
    const response = await axiosInstance.get(`/${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: T): Promise<T> {
    const response = await axiosInstance.post(`/${this.endpoint}`, data);
    return response.data;
  }

  async update(id: string, data: T): Promise<T> {
    const response = await axiosInstance.put(`/${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/${this.endpoint}/${id}`);
  }
}
