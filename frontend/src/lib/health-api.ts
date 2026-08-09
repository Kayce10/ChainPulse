/**
 * Network Health API – ChainPulse
 *
 * Fetches real-time health summaries for the Stellar network and
 * individual anchors. Falls back to mock data when the backend is
 * not available (dev / offline).
 */

import { logger } from "@/lib/logger";
import { config } from "@/config";

const API_BASE = config.apiUrl;

// ── Types ─────────────────────────────────────────────────────────────────────

export type HealthStatus = "healthy" | "degraded" | "critical" | "unknown";

export interface AnchorHealthSummary {
  anchor_id: string;
  anchor_name: string;
  status: HealthStatus;
  uptime_percent: number;
  avg_response_ms: number;
  last_checked_at: string;
  incident_count_24h: number;
}

export interface NetworkHealthSummary {
  status: HealthStatus;
  healthy_anchors: number;
  degraded_anchors: number;
  critical_anchors: number;
  total_anchors: number;
  network_uptime_percent: number;
  avg_settlement_ms: number;
  checked_at: string;
  anchors: AnchorHealthSummary[];
}

export interface HealthTimeSeries {
  timestamp: string;
  uptime_percent: number;
  avg_response_ms: number;
  incident_count: number;
}

// ── API calls ─────────────────────────────────────────────────────────────────

/**
 * Fetch the overall network health summary.
 */
export async function fetchNetworkHealth(): Promise<NetworkHealthSummary> {
  try {
    const res = await fetch(`${API_BASE}/api/health/network`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } catch (err) {
    const isNetwork =
      err instanceof TypeError &&
      (err.message.includes("Failed to fetch") ||
        err.message.includes("Network request failed"));
    if (!isNetwork) logger.error("fetchNetworkHealth failed:", err);
    return getMockNetworkHealth();
  }
}

/**
 * Fetch the 24-hour uptime time-series for a specific anchor.
 */
export async function fetchAnchorHealthTimeSeries(
  anchorId: string
): Promise<HealthTimeSeries[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/health/anchors/${encodeURIComponent(anchorId)}/history`,
      { headers: { "Content-Type": "application/json" } }
    );
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } catch (err) {
    const isNetwork =
      err instanceof TypeError && err.message.includes("Failed to fetch");
    if (!isNetwork)
      logger.error("fetchAnchorHealthTimeSeries failed:", err);
    return getMockHealthTimeSeries();
  }
}

// ── Mock data (fallback) ──────────────────────────────────────────────────────

export function getMockNetworkHealth(): NetworkHealthSummary {
  const now = new Date().toISOString();
  const anchors: AnchorHealthSummary[] = [
    {
      anchor_id: "anchor-usdc-1",
      anchor_name: "Circle USDC Anchor",
      status: "healthy",
      uptime_percent: 99.92,
      avg_response_ms: 112,
      last_checked_at: now,
      incident_count_24h: 0,
    },
    {
      anchor_id: "anchor-eurc-1",
      anchor_name: "StraightPay EUR Anchor",
      status: "degraded",
      uptime_percent: 94.5,
      avg_response_ms: 820,
      last_checked_at: now,
      incident_count_24h: 3,
    },
    {
      anchor_id: "anchor-php-1",
      anchor_name: "Coins.ph PHP Anchor",
      status: "healthy",
      uptime_percent: 99.1,
      avg_response_ms: 145,
      last_checked_at: now,
      incident_count_24h: 1,
    },
    {
      anchor_id: "anchor-ngn-1",
      anchor_name: "AfroX NGN Anchor",
      status: "critical",
      uptime_percent: 72.3,
      avg_response_ms: 3200,
      last_checked_at: now,
      incident_count_24h: 12,
    },
    {
      anchor_id: "anchor-mxn-1",
      anchor_name: "Bitso MXN Anchor",
      status: "healthy",
      uptime_percent: 98.7,
      avg_response_ms: 180,
      last_checked_at: now,
      incident_count_24h: 0,
    },
  ];

  const healthy = anchors.filter((a) => a.status === "healthy").length;
  const degraded = anchors.filter((a) => a.status === "degraded").length;
  const critical = anchors.filter((a) => a.status === "critical").length;

  return {
    status: critical > 0 ? "degraded" : degraded > 0 ? "degraded" : "healthy",
    healthy_anchors: healthy,
    degraded_anchors: degraded,
    critical_anchors: critical,
    total_anchors: anchors.length,
    network_uptime_percent: 96.8,
    avg_settlement_ms: 2050,
    checked_at: now,
    anchors,
  };
}

export function getMockHealthTimeSeries(): HealthTimeSeries[] {
  const now = Date.now();
  return Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(now - (23 - i) * 3_600_000).toISOString(),
    uptime_percent: 95 + Math.random() * 5,
    avg_response_ms: 100 + Math.random() * 400,
    incident_count: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
  }));
}
