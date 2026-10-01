import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { SessionsService } from "./sessions.service";
import { CurrentUserService } from "../common/current-user.service";

@Controller("sessions")
export class SessionsController {
  constructor(
    private readonly sessions: SessionsService,
    private readonly currentUser: CurrentUserService,
  ) {}

  @Post()
  async create(@Body() body: { levelId: string }) {
    return this.sessions.createSession(this.currentUser.getUserId(), body.levelId);
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    return this.sessions.getSession(id);
  }

  @Post(":id/hints/:hintId")
  async requestHint(@Param("id") id: string, @Param("hintId") hintId: string, @Body() body: { partId: string }) {
    return this.sessions.requestHint(id, body.partId, hintId);
  }

  @Get(":id/logs/:container")
  async getLogs(@Param("id") id: string, @Param("container") container: string) {
    return this.sessions.getContainerLogs(id, container);
  }

  @Post(":id/reset")
  async reset(@Param("id") id: string) {
    return this.sessions.resetSession(id);
  }

  @Delete(":id")
  async destroy(@Param("id") id: string) {
    await this.sessions.destroySession(id);
    return { ok: true };
  }
}
