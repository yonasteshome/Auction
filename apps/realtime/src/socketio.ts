import type { Server as HttpServer } from "node:http";
import type { Express } from "express";
import { log } from "@repo/logger";
import jwt from "jsonwebtoken";
import { Server, type Socket } from "socket.io";

/** Same algorithm/secret as Django Simple JWT (HS256, SECRET_KEY / JWT_SIGNING_KEY). */
function getSigningSecret(): string {
  return process.env.JWT_SIGNING_KEY || process.env.SECRET_KEY || "change-me";
}

function getInternalToken(): string {
  return process.env.REALTIME_INTERNAL_TOKEN || "dev-only-change-me";
}

export function attachSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    const authed: { sub?: string } = {};

    socket.on("authenticate", (msg: { token?: string }, ack?: (e: Error | null) => void) => {
      const token = msg?.token;
      if (!token) {
        ack?.(new Error("missing token"));
        return;
      }
      try {
        const secret = getSigningSecret();
        const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as Record<string, unknown> &
          jwt.JwtPayload;
        const uid = String(
          (payload as { user_id?: string | number }).user_id ?? payload.sub ?? ""
        );
        if (!uid) {
          throw new Error("no user id in token");
        }
        authed.sub = uid;
        const room = `user:${uid}`;
        void socket.join(room);
        log(`socket ${socket.id} joined ${room}`);
        socket.emit("authenticated", { userId: uid });
        ack?.(null);
      } catch (e) {
        log(`socket auth failed: ${(e as Error).message}`);
        socket.emit("auth_error", { detail: "Invalid or expired token" });
        ack?.(e as Error);
      }
    });

    socket.on("subscribe:notifications", (_msg: unknown, ack?: (e: Error | null) => void) => {
      if (authed.sub) {
        const room = `user:${authed.sub}`;
        void socket.join(room);
        log(`socket ${socket.id} subscribe:notifications → ${room}`);
        ack?.(null);
      } else {
        ack?.(new Error("not authenticated"));
      }
    });

    socket.on("subscribe:market_prices", (_msg: unknown, ack?: (e: Error | null) => void) => {
      void socket.join("market_prices");
      log(`socket ${socket.id} subscribe:market_prices → market_prices`);
      ack?.(null);
    });

    socket.on("subscribe_budget", (msg: { budget_id?: number }) => {
      if (msg?.budget_id != null && authed.sub) {
        void socket.join(`budget:${authed.sub}:${msg.budget_id}`);
      }
    });

    socket.on("subscribe_delivery", (msg: { purchase_id?: string }) => {
      if (msg?.purchase_id && authed.sub) {
        void socket.join(`delivery:${msg.purchase_id}`);
      }
    });
  });

  return io;
}

/**
 * Call after `attachSocketIO` — wires internal HTTP broadcast used by Django signals.
 * POST /internal/emit  X-Internal-Token  { userId, event, payload }
 */
export function registerInternalEmit(app: Express, io: Server): void {
  app.post("/internal/emit", (req, res) => {
    const token = req.get("X-Internal-Token") || "";
    if (token !== getInternalToken()) {
      res.status(401).json({ detail: "Unauthorized" });
      return;
    }
    const { userId, room, event, payload } = req.body as {
      userId?: string;
      room?: string;
      event?: string;
      payload?: unknown;
    };
    if (!event) {
      res.status(400).json({ detail: "event required" });
      return;
    }
    if (room) {
      io.to(room).emit(event, payload);
    } else if (userId) {
      io.to(`user:${userId}`).emit(event, payload);
    } else {
      res.status(400).json({ detail: "userId or room required" });
      return;
    }
    res.json({ ok: true, delivered: true });
  });
}
