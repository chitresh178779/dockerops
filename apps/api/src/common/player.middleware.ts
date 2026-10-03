import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { PrismaService } from "../prisma/prisma.service";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Each browser sends a random X-Player-Id (stored in localStorage).
 * We map it to a User row, creating one the first time we see it.
 */
@Injectable()
export class PlayerMiddleware implements NestMiddleware {
    constructor(private readonly prisma: PrismaService) { }

    async use(req: Request & { userId?: string }, _res: Response, next: NextFunction) {
        try {
            const raw = req.headers["x-player-id"];
            if (typeof raw === "string" && UUID_RE.test(raw)) {
                const email = `${raw.toLowerCase()}@players.dockerops.local`;
                let user = await this.prisma.user.findFirst({ where: { email } });
                if (!user) {
                    user = await this.prisma.user.create({ data: { displayName: "Player", email } });
                }
                req.userId = user.id;
            }
            next();
        } catch (err) {
            next(err);
        }
    }
}