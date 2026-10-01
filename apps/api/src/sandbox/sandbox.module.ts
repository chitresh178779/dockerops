import { Module } from "@nestjs/common";
import { SandboxManagerService } from "./sandbox-manager.service";
import { EnvironmentRealizerService } from "./environment-realizer.service";
import { DockerStateReaderService } from "./docker-state-reader.service";
import { ObjectiveValidatorService } from "./objective-validator.service";
import { SessionDiscoveryService } from "./session-discovery.service";

@Module({
  providers: [
    SandboxManagerService,
    EnvironmentRealizerService,
    DockerStateReaderService,
    ObjectiveValidatorService,
    SessionDiscoveryService,
  ],
  exports: [
    SandboxManagerService,
    EnvironmentRealizerService,
    DockerStateReaderService,
    ObjectiveValidatorService,
    SessionDiscoveryService,
  ],
})
export class SandboxModule {}
