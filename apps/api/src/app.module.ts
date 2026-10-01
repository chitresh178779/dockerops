import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { CommonModule } from "./common/common.module";
import { ScenariosModule } from "./scenarios/scenarios.module";
import { ProgressModule } from "./progress/progress.module";
import { SandboxModule } from "./sandbox/sandbox.module";
import { SessionsModule } from "./sessions/sessions.module";
import { TerminalModule } from "./terminal/terminal.module";
import { DocsModule } from "./docs/docs.module";

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    ScenariosModule,
    ProgressModule,
    SandboxModule,
    SessionsModule,
    TerminalModule,
    DocsModule,
  ],
})
export class AppModule {}
