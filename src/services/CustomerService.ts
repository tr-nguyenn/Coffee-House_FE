import {BaseService} from "./BaseService";
import type {Customer} from "@/models/Customer";

class UserService extends BaseService<Customer> {
  constructor() {
    super("customers");
  }
}

export const userService = new UserService();
