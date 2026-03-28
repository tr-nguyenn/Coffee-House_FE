import type { BaseModel } from "./BaseModel";

export interface User extends BaseModel {
  fullName: string;
  phoneNumber: string;
  rewardPoints: number;
}
