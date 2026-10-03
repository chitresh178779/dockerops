import { Inject, Injectable, Scope, UnauthorizedException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";

/**
 * Resolves the player for the current HTTP request.
 * The id is attached by PlayerMiddleware from the X-Player-Id header.
 */
@Injectable({ scope: Scope.REQUEST })
export class CurrentUserService {
  constructor(@Inject(REQUEST) private readonly req: Request & { userId?: string }) { }

  getUserId(): string {
    if (!this.req.userId) {
      throw new UnauthorizedException("Missing or invalid player id");
    }
    return this.req.userId;
  }
}