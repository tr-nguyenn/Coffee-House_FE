import {BaseService} from "./BaseService";
import type {Category} from "@/models/Category";

class CategoryService extends BaseService<Category> {
  constructor() {
    super("categories");
  }
}

export const categoryService = new CategoryService();
