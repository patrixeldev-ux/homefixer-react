"use client";

/**
 * useServicemanTracking
 * ---------------------
 * Central state + logic hook for the serviceman live-tracking feature.
 *
 * Responsibilities:
 *  - Fetch booking details (customer + vendor locations)
 *  - Watch serviceman's GPS position every 4 seconds
 *  - POST location updates to backend
 *  - Manage journey stage (TO_CUSTOMER → TO_VENDOR → COMPLETE)
 *  - Expose distance + ETA helpers
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { getDistance } from "geolib";
import api from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type JourneyStage = "TO_CUSTOMER" | "TO_VENDOR" | "COMPLETE";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BookingTrackingData {
  booking_id: number;
  status: string;
  customer_name: string;
  customer_address: string;
  customer_lat: number;
  customer_lng: number;
  vendor_lat?: number;
  vendor_lng?: number;
  vendor_name?: string;
  vendor_address?: string;
  serviceman_name: string;
}

export interface TrackingState {
  stage: JourneyStage;
  servicemanPos: LatLng | null;
  booking: BookingTrackingData | null;
  loading: boolean;
  error: string | null;
  locationPermission: "granted" | "denied" | "prompt" | "unknown";
  isOnline: boolean;
  distanceMeters: number | null;
  etaMinutes: number | null;
  // Actions
  startJourney: () => void;
  goToVendor: () => void;
  completeService: () => Promise<void>;
  recenter: () => void;
  recenterTrigger: number;
  completing: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Average serviceman travel speed in km/h (urban motorbike) */
const AVG_SPEED_KMH = 25;

/** How often to poll GPS and push location update (ms) */
const POLL_INTERVAL_MS = 4000;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useServicemanTracking(bookingId: string): TrackingState {
  const [stage, setStage] = useState<JourneyStage>("TO_CUSTOMER");
  const [servicemanPos, setServicemanPos] = useState<LatLng | null>(null);
  const [booking, setBooking] = useState<BookingTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt" | "unknown"
  >("unknown");
  const [isOnline, setIsOnline] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPosRef = useRef<LatLng | null>(null);

  // ── Online / offline detection ──────────────────────────────────────────────
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // ── Fetch booking data ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    (async () => {
      try {
        const res = await api.get(`/api/bookings/${bookingId}/track/`);
        const d = res.data;
        // Normalise — backend may return coords as strings
        setBooking({
          ...d,
          customer_lat:  parseFloat(d.customer_lat),
          customer_lng:  parseFloat(d.customer_lng ?? d.customer_long),
          vendor_lat:    d.vendor_lat  != null ? parseFloat(d.vendor_lat)  : undefined,
          vendor_lng:    d.vendor_lng  != null ? parseFloat(d.vendor_lng)  : undefined,
        });
        setError(null);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(
          axiosErr?.response?.data?.error ||
            "Failed to load booking. Please try again."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  // ── Push location to backend ────────────────────────────────────────────────
  const pushLocation = useCallback(
    async (pos: LatLng) => {
      if (!isOnline) return;
      try {
        await api.post("/api/serviceman/update-location/", {
          lat: pos.lat,
          lon: pos.lng,
        });
      } catch {
        // Silently fail — we don't want to interrupt the UI for a missed update
      }
    },
    [bookingId, isOnline, stage]
  );

  // ── GPS watch ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission("denied");
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // Check permission status if API available
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          setLocationPermission(
            result.state as "granted" | "denied" | "prompt"
          );
          result.onchange = () =>
            setLocationPermission(
              result.state as "granted" | "denied" | "prompt"
            );
        })
        .catch(() => setLocationPermission("unknown"));
    }

    const onSuccess = (position: GeolocationPosition) => {
      const pos: LatLng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setServicemanPos(pos);
      latestPosRef.current = pos;
      setLocationPermission("granted");
    };

    const onError = (err: GeolocationPositionError) => {
      if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
        setLocationPermission("denied");
        setError(
          "Location permission denied. Please enable location access to use live tracking."
        );
      }
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 10000,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      options
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // ── Periodic location push ──────────────────────────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (latestPosRef.current) {
        pushLocation(latestPosRef.current);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pushLocation]);

  // ── Distance + ETA calculation ──────────────────────────────────────────────
  const destination: LatLng | null = (() => {
    if (!booking) return null;
    if (stage === "TO_CUSTOMER") {
      const lat = booking.customer_lat;
      const lng = booking.customer_lng;
      if (!isFinite(lat) || !isFinite(lng)) return null;
      return { lat, lng };
    }
    if (stage === "TO_VENDOR" && booking.vendor_lat && booking.vendor_lng) {
      const lat = booking.vendor_lat;
      const lng = booking.vendor_lng;
      if (!isFinite(lat) || !isFinite(lng)) return null;
      return { lat, lng };
    }
    return null;
  })();

  const distanceMeters: number | null =
    servicemanPos && destination
      ? getDistance(
          { latitude: servicemanPos.lat, longitude: servicemanPos.lng },
          { latitude: destination.lat, longitude: destination.lng }
        )
      : null;

  const etaMinutes: number | null =
    distanceMeters !== null
      ? Math.max(1, Math.round((distanceMeters / 1000 / AVG_SPEED_KMH) * 60))
      : null;

  // ── Stage actions ───────────────────────────────────────────────────────────
  const startJourney = useCallback(() => {
    setStage("TO_CUSTOMER");
  }, []);

  const goToVendor = useCallback(() => {
    if (!booking?.vendor_lat) {
      setError("No vendor assigned to this booking yet.");
      return;
    }
    setStage("TO_VENDOR");
  }, [booking]);

  const completeService = useCallback(async () => {
    setCompleting(true);
    try {
      await api.patch(`/api/booking/${bookingId}/complete/`);
      setStage("COMPLETE");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(
        axiosErr?.response?.data?.error || "Failed to complete service."
      );
    } finally {
      setCompleting(false);
    }
  }, [bookingId]);

  const recenter = useCallback(() => {
    setRecenterTrigger((n) => n + 1);
  }, []);

  return {
    stage,
    servicemanPos,
    booking,
    loading,
    error,
    locationPermission,
    isOnline,
    distanceMeters,
    etaMinutes,
    startJourney,
    goToVendor,
    completeService,
    recenter,
    recenterTrigger,
    completing,
  };
}
