import type { BaseModel } from "./BaseModel";

export interface Area extends BaseModel {
  name: string;
  displayOrder?: number;
}
