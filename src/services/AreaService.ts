import { BaseService } from "./BaseService";
import type { Area } from "@/models/Area";

class AreaService extends BaseService<Area> {
  constructor() {
    super("areas");
  }
}

export const areaService = new AreaService();
