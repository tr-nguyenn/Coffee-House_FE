import type { BaseModel } from "./BaseModel";

export interface Staff extends BaseModel {
  email: string;
  fullName: string;
  phoneNumber: string;
  roles: string[];
  password?: string;
  role?: string;
}
