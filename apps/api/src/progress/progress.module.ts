import { Module } from "@nestjs/common";
import { ProgressService } from "./progress.service";
import { ProgressController } from "./progress.controller";
import { ScenariosModule } from "../scenarios/scenarios.module";
import { CommonModule } from "../common/common.module";

@Module({
  imports: [ScenariosModule, CommonModule],
  providers: [ProgressService],
  controllers: [ProgressController],
  exports: [ProgressService],
})
export class ProgressModule {}
