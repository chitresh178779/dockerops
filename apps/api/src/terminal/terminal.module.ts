import { Module } from "@nestjs/common";
import { TerminalGateway } from "./terminal.gateway";
import { SandboxModule } from "../sandbox/sandbox.module";
import { SessionsModule } from "../sessions/sessions.module";

@Module({
  imports: [SandboxModule, SessionsModule],
  providers: [TerminalGateway],
})
export class TerminalModule {}
