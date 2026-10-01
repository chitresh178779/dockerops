import { Controller, Get, Param } from "@nestjs/common";
import { ScenariosService } from "./scenarios.service";

@Controller("levels")
export class ScenariosController {
  constructor(private readonly scenarios: ScenariosService) {}

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.scenarios.toPublic(this.scenarios.getById(id));
  }
}
