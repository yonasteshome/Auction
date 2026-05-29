"use client";

import { useCallback, useState } from "react";

type GpsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; latitude: number; longitude: number }
  | { status: "denied" | "unavailable"; message: string };

export function useGpsLocation() {
  const [state, setState] = useState<GpsState>({ status: "idle" });

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        status: "unavailable",
        message: "Geolocation is not supported on this device.",
      });
      return;
    }
    setState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "success",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enter the market manually."
            : "Could not detect location. Enter the market manually.";
        setState({
          status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
          message,
        });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }, []);

  return { state, detect, reset: () => setState({ status: "idle" }) };
}
