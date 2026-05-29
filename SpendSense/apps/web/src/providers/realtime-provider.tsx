"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

const REALTIME_URL =
  process.env.NEXT_PUBLIC_REALTIME_URL || "http://127.0.0.1:3001";

/* ------------------------------------------------------------------ */
/*  Event types                                                        */
/* ------------------------------------------------------------------ */

type RealtimeEventName =
  | "notification:budget_alert"
  | "notification:price_spike"
  | "notification:price_alert"
  | "notification:vendor_deal"
  | "notification:delivery_update"
  | "notification:payment_confirmation"
  | "notification:submission_status"
  | "notification:vendor_verification"
  | "notification:generic";

type NotificationPayload = {
  id?: number;
  type?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

type RealtimeContextValue = {
  /** Increments every time any real-time event arrives — use as a `useEffect` dep to refetch. */
  eventVersion: number;
  /** Last event payload received (for ad-hoc handlers). */
  lastEvent: { name: string; payload: unknown } | null;
  /** Whether the socket is connected. */
  connected: boolean;
  /** The socket client instance. */
  socket: Socket | null;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  eventVersion: 0,
  lastEvent: null,
  connected: false,
  socket: null,
});

export function useRealtime(): RealtimeContextValue {
  return useContext(RealtimeContext);
}

const EVENTS: RealtimeEventName[] = [
  "notification:budget_alert",
  "notification:price_spike",
  "notification:price_alert",
  "notification:vendor_deal",
  "notification:delivery_update",
  "notification:payment_confirmation",
  "notification:submission_status",
  "notification:vendor_verification",
  "notification:generic",
];

/* ------------------------------------------------------------------ */
/*  Toast helpers per notification type                                 */
/* ------------------------------------------------------------------ */

function showNotificationToast(name: RealtimeEventName, raw: unknown) {
  const data = raw as NotificationPayload | undefined;
  const message = data?.message ?? labelFor(name);
  const metadata = data?.metadata as Record<string, string> | undefined;

  switch (name) {
    case "notification:budget_alert": {
      const severity = metadata?.severity;
      if (severity === "critical") {
        toast.error(message, {
          description: "You have exceeded your budget limit.",
          duration: Infinity, // persistent until dismissed
          action: {
            label: "View Budget",
            onClick: () => {
              window.location.href = "/budget";
            },
          },
        });
      } else {
        toast.warning(message, {
          description: `${metadata?.percent_used ?? ""}% of your monthly budget used.`,
          duration: 10_000,
          action: {
            label: "View Budget",
            onClick: () => {
              window.location.href = "/budget";
            },
          },
        });
      }
      break;
    }

    case "notification:price_alert": {
      toast.success(message, {
        description: metadata?.item_name
          ? `${metadata.item_name} is now ETB ${metadata.current_price}`
          : undefined,
        duration: 12_000,
        action: metadata?.item_id
          ? {
              label: "View Product",
              onClick: () => {
                window.location.href = `/products/${metadata.item_id}`;
              },
            }
          : undefined,
      });
      break;
    }

    case "notification:price_spike": {
      toast.warning(message, {
        description: "A tracked item has experienced a significant price change.",
        duration: 10_000,
      });
      break;
    }

    case "notification:submission_status": {
      const status = metadata?.status;
      if (status === "approved") {
        toast.success(message, {
          description: "Thank you for contributing to the community!",
          duration: 8_000,
          action: metadata?.item_id
            ? {
                label: "View Item",
                onClick: () => {
                  window.location.href = `/products/${metadata.item_id}`;
                },
              }
            : undefined,
        });
      } else if (status === "rejected") {
        toast.error(message, {
          description: metadata?.reason
            ? `Reason: ${metadata.reason}`
            : "Your submission was not accepted.",
          duration: 10_000,
          action: {
            label: "My submissions",
            onClick: () => {
              window.location.href = "/market/submit";
            },
          },
        });
      } else {
        toast.info(message, { duration: 6_000 });
      }
      break;
    }

    case "notification:vendor_verification": {
      const vStatus = metadata?.status;
      if (vStatus === "verified") {
        toast.success(message, {
          description: "Your business is now verified! 🎉",
          duration: 12_000,
          action: {
            label: "View Profile",
            onClick: () => {
              window.location.href = "/vendor/dashboard";
            },
          },
        });
      } else if (vStatus === "rejected") {
        toast.error(message, {
          description: "Please update your documents and try again.",
          duration: 12_000,
          action: {
            label: "Reapply",
            onClick: () => {
              window.location.href = "/settings/vendor";
            },
          },
        });
      } else {
        toast.info(message, {
          description: "Your verification request is being reviewed.",
          duration: 8_000,
        });
      }
      break;
    }

    case "notification:vendor_deal": {
      toast.info(message, {
        description: "A vendor near you has a better price.",
        duration: 8_000,
      });
      break;
    }

    default: {
      toast.info(message, { duration: 6_000 });
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Provider                                                            */
/* ------------------------------------------------------------------ */

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { accessToken, status } = useAuth();
  const [eventVersion, setEventVersion] = useState(0);
  const [lastEvent, setLastEvent] =
    useState<RealtimeContextValue["lastEvent"]>(null);
  const [connected, setConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket: Socket = io(REALTIME_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;
    setSocketInstance(socket);
    setConnected(socket.connected);

    if (status === "authenticated" && accessToken) {
      socket.emit("authenticate", { token: accessToken });
    }

    const onEvent = (name: RealtimeEventName) => (data: unknown) => {
      setLastEvent({ name, payload: data });
      setEventVersion((v) => v + 1);
      showNotificationToast(name, data);
    };

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("authenticated", () => {
      socket.emit("subscribe:notifications");
    });
    socket.on("auth_error", (e: { detail?: string }) => {
      // Silently handle temporary auth errors (such as during token refresh or initial load)
      console.warn("Realtime auth error:", e?.detail);
    });

    for (const name of EVENTS) {
      socket.on(name, onEvent(name));
    }

    return () => {
      setConnected(false);
      socket.removeAllListeners();
      socket.close();
      socketRef.current = null;
      setSocketInstance(null);
    };
  }, [accessToken, status]);

  const value = useMemo<RealtimeContextValue>(
    () => ({ eventVersion, lastEvent, connected, socket: socketInstance }),
    [eventVersion, lastEvent, connected, socketInstance]
  );

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Fallback labels                                                     */
/* ------------------------------------------------------------------ */

function labelFor(name: RealtimeEventName): string {
  switch (name) {
    case "notification:budget_alert":
      return "Budget alert: you are approaching or exceeding your monthly limit.";
    case "notification:price_spike":
      return "Price spike detected on a tracked item.";
    case "notification:price_alert":
      return "A product you're tracking has reached your target price!";
    case "notification:vendor_deal":
      return "A nearby vendor offers a better price than the city average.";
    case "notification:delivery_update":
      return "Delivery status updated for one of your orders.";
    case "notification:payment_confirmation":
      return "Payment confirmed.";
    case "notification:submission_status":
      return "Your price submission status has been updated.";
    case "notification:vendor_verification":
      return "Your vendor verification status has been updated.";
    case "notification:generic":
    default:
      return "You have a new notification.";
  }
}
