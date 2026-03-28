import { BaseService } from "./BaseService";
import type { User } from "@/models/User";

class UserService extends BaseService<User> {
  constructor() {
    super("users");
  }
}

export const userService = new UserService();
