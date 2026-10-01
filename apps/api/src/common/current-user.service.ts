import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * MVP has no auth flow (out of scope for this pass). Every request acts as
 * a single local player profile that's created on first boot, matching
 * "Later: multiplayer / accounts" in the spec's post-MVP list.
 */
@Injectable()
export class CurrentUserService implements OnModuleInit {
  private userId!: string;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const existing = await this.prisma.user.findFirst({ where: { email: "player@dockerops.local" } });
    if (existing) {
      this.userId = existing.id;
      return;
    }
    const created = await this.prisma.user.create({
      data: { displayName: "Player One", email: "player@dockerops.local" },
    });
    this.userId = created.id;
  }

  getUserId(): string {
    return this.userId;
  }
}
