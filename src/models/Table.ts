import type {BaseModel} from "./BaseModel";
import type {Area} from "./Area";

export interface Table extends BaseModel {
  activeOrderTime?: string;
  name: string;
  areaId: string;
  areaName?: string;
  status?: number;
  displayOrder?: number;
  area?: Area;
}

export interface TableStatusDto {
  tableId: string;
  tableName: string;
  areaName: string;
  isInUse: boolean;
  activeOrderId: string | null;
  activeOrderTime: Date;
  displayOrder: number;
  areaDisplayOrder: number;
  paymentMethod?: string;
}
