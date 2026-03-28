import type { BaseModel } from "./BaseModel";
import type { Category } from "./Category";

export interface Product extends BaseModel {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  imageFile?: File | null;
  categoryId: number;
  category?: Category;
  categoryName?: string;
  isAvailable: boolean;
}
