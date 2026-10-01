import { Controller, Get } from "@nestjs/common";
import { ProgressService } from "./progress.service";
import { CurrentUserService } from "../common/current-user.service";

@Controller()
export class ProgressController {
  constructor(
    private readonly progress: ProgressService,
    private readonly currentUser: CurrentUserService,
  ) {}

  @Get("levels")
  async getLevels() {
    return this.progress.getLevelSummaries(this.currentUser.getUserId());
  }

  @Get("profile")
  async getProfile() {
    return this.progress.getProfile(this.currentUser.getUserId());
  }

  @Get("achievements")
  async getAchievements() {
    return this.progress.getAllAchievements(this.currentUser.getUserId());
  }
}
