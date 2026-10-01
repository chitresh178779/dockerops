import { Module } from "@nestjs/common";
import { SessionsService } from "./sessions.service";
import { SessionsController } from "./sessions.controller";
import { SandboxModule } from "../sandbox/sandbox.module";
import { ScenariosModule } from "../scenarios/scenarios.module";
import { ProgressModule } from "../progress/progress.module";
import { CommonModule } from "../common/common.module";

@Module({
  imports: [SandboxModule, ScenariosModule, ProgressModule, CommonModule],
  providers: [SessionsService],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}
