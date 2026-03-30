import type {BaseModel} from "./BaseModel";

export interface Customer extends BaseModel {
  fullName: string;
  phoneNumber: string;
  rewardPoints: number;
}
