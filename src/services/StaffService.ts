import { BaseService } from "./BaseService";
import type { Staff } from "@/models/Staff";

class StaffService extends BaseService<Staff> {
  constructor() {
    super("staffs");
  }
}

export const staffService = new StaffService();
