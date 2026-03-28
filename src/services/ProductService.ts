import {BaseService} from "./BaseService";
import type {Product} from "@/models/Product";
import axiosInstance from "@/api/axiosInstance";

class ProductService extends BaseService<Product> {
  constructor() {
    super("products");
  }

  async uploadImage(id: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(`/${this.endpoint}/${id}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  private createFormData(data: Product): FormData {
    const formData = new FormData();
    formData.append("Name", data.name || "");
    formData.append("Price", (data.price || 0).toString());
    formData.append("CategoryId", data.categoryId.toString());
    formData.append("IsAvailable", data.isAvailable ? "true" : "false");
    formData.append("Description", data.description || "");
    if (data.imageFile) {
      formData.append("ImageFile", data.imageFile);
    }

    return formData;
  }

  async create(data: Product): Promise<Product> {
    const formData = this.createFormData(data);
    const response = await axiosInstance.post(`/${this.endpoint}`, formData, {
      headers: {"Content-Type": "multipart/form-data"},
    });
    return response.data;
  }

  async update(id: string, data: Product): Promise<Product> {
    const formData = this.createFormData(data);
    const response = await axiosInstance.put(`/${this.endpoint}/${id}`, formData, {
      headers: {"Content-Type": "multipart/form-data"},
    });
    return response.data;
  }
}

export const productService = new ProductService();
