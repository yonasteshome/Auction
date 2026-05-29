import type { Server } from "socket.io";
import { log } from "@repo/logger";

/**
 * Optional Redis PUB/SUB bridge: Django publishes JSON to `marketsight:notifications`
 * when REDIS_URL is set; otherwise Django uses HTTP POST /internal/emit only.
 */
export function attachRedisNotificationBridge(io: Server): void {
  const url = process.env.REDIS_URL;
  if (!url) {
    return;
  }

  void import("ioredis")
    .then(({ default: Redis }) => {
      const sub = new Redis(url, { maxRetriesPerRequest: null });

      sub.on("error", (err: Error) => {
        log(`Redis subscriber error: ${err.message}`);
      });

      void sub
        .subscribe("marketsight:notifications")
        .then(() => {
          log("Redis subscribed to marketsight:notifications");
        })
        .catch((err: Error) => {
          log(`Redis subscribe failed: ${err.message}`);
        });

      sub.on("message", (_channel: string, message: string) => {
        try {
          const parsed = JSON.parse(message) as {
            userId?: string;
            room?: string;
            event?: string;
            payload?: unknown;
          };
          if (!parsed.event) {
            return;
          }
          if (parsed.room) {
            io.to(parsed.room).emit(parsed.event, parsed.payload);
          } else if (parsed.userId) {
            io.to(`user:${parsed.userId}`).emit(parsed.event, parsed.payload);
          }
        } catch (e) {
          log(`Invalid Redis notification payload: ${(e as Error).message}`);
        }
      });
    })
    .catch((e: Error) => {
      log(`ioredis not available or failed to load: ${e.message}`);
    });
}
