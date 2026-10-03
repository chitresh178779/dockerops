import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { AppModule } from "./app.module";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableShutdownHooks();

  const port = Number(process.env.API_PORT ?? 4000);

  // Nest CLI's --watch mode restarts this process on every file change by
  // killing it and spawning a new one. On Windows that kill is an abrupt
  // TerminateProcess (there's no real SIGTERM), so enableShutdownHooks()
  // above never gets a chance to run and release the port cleanly — the
  // new instance can hit EADDRINUSE for the brief window before the OS
  // finishes tearing down the old socket. Retry through that window
  // instead of crashing, so a hot-reload never silently leaves the old
  // code as the one actually serving requests.
  const maxAttempts = 40;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await app.listen(port);
      break;
    } catch (err: any) {
      if (err?.code !== "EADDRINUSE" || attempt === maxAttempts) throw err;
      await sleep(300);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`[api] DockerOps control plane listening on :${port}`);
}

bootstrap();
