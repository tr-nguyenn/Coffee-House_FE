import apiClient from "@/api/axiosInstance";

export const inventoryService = {
  // 1. Lấy danh sách vật tư và tồn kho
  getMaterials: async () => {
    const response = await apiClient.get("/inventory/materials");
    return response.data;
  },

  // 2. Thêm một vật tư mới (vd: Bột cafe, Trà đen...)
  createMaterial: async (data: { name: string; unit: string; minStockLevel: number }) => {
    const response = await apiClient.post("/inventory/materials", data);
    return response.data;
  },

  // 3. Nhập kho (Cộng số lượng, tính giá vốn)
  importStock: async (data: { materialId: string; quantity: number; costPerUnit: number; note: string }) => {
    const response = await apiClient.post("/inventory/import", data);
    return response.data;
  },

  // 4. Lấy công thức định lượng của 1 món ăn
  getRecipes: async (productId: string) => {
    const response = await apiClient.get(`/inventory/recipes/${productId}`);
    return response.data;
  },

  // 5. Cài đặt lại định lượng cho 1 món ăn
  setRecipes: async (data: { productId: string; items: { materialId: string; quantity: number }[] }) => {
    const response = await apiClient.post("/inventory/recipes", data);
    return response.data;
  },

  updateMaterial: async (id: string, data: { name: string; unit: string; minStockLevel: number }) => {
    const response = await apiClient.put(`/inventory/materials/${id}`, data);
    return response.data;
  },
};