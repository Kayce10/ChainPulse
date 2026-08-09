/**
 * Tests for health-api.ts – ChainPulse
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchNetworkHealth,
  fetchAnchorHealthTimeSeries,
  getMockNetworkHealth,
  getMockHealthTimeSeries,
  type NetworkHealthSummary,
  type HealthTimeSeries,
} from "@/lib/health-api";

// Mock config so the module doesn't throw at import time
vi.mock("@/config", () => ({ config: { apiUrl: "http://localhost:8080" } }));

global.fetch = vi.fn();
const mockFetch = vi.mocked(global.fetch);

describe("health-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getMockNetworkHealth ───────────────────────────────────────────────────

  describe("getMockNetworkHealth", () => {
    it("returns a NetworkHealthSummary with at least one anchor", () => {
      const health = getMockNetworkHealth();
      expect(health.anchors.length).toBeGreaterThan(0);
    });

    it("total_anchors equals anchors array length", () => {
      const health = getMockNetworkHealth();
      expect(health.total_anchors).toBe(health.anchors.length);
    });

    it("counts healthy, degraded, and critical anchors correctly", () => {
      const health = getMockNetworkHealth();
      const h = health.anchors.filter((a) => a.status === "healthy").length;
      const d = health.anchors.filter((a) => a.status === "degraded").length;
      const c = health.anchors.filter((a) => a.status === "critical").length;
      expect(health.healthy_anchors).toBe(h);
      expect(health.degraded_anchors).toBe(d);
      expect(health.critical_anchors).toBe(c);
    });

    it("network_uptime_percent is between 0 and 100", () => {
      const health = getMockNetworkHealth();
      expect(health.network_uptime_percent).toBeGreaterThan(0);
      expect(health.network_uptime_percent).toBeLessThanOrEqual(100);
    });

    it("each anchor has required fields", () => {
      const health = getMockNetworkHealth();
      for (const anchor of health.anchors) {
        expect(anchor.anchor_id).toBeTruthy();
        expect(anchor.anchor_name).toBeTruthy();
        expect(["healthy", "degraded", "critical", "unknown"]).toContain(
          anchor.status
        );
        expect(anchor.uptime_percent).toBeGreaterThanOrEqual(0);
        expect(anchor.avg_response_ms).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ── getMockHealthTimeSeries ────────────────────────────────────────────────

  describe("getMockHealthTimeSeries", () => {
    it("returns 24 data points (one per hour)", () => {
      const series = getMockHealthTimeSeries();
      expect(series).toHaveLength(24);
    });

    it("timestamps are in chronological order", () => {
      const series = getMockHealthTimeSeries();
      for (let i = 1; i < series.length; i++) {
        expect(new Date(series[i].timestamp).getTime()).toBeGreaterThan(
          new Date(series[i - 1].timestamp).getTime()
        );
      }
    });

    it("uptime_percent values are within valid range", () => {
      const series = getMockHealthTimeSeries();
      for (const point of series) {
        expect(point.uptime_percent).toBeGreaterThanOrEqual(0);
        expect(point.uptime_percent).toBeLessThanOrEqual(100);
      }
    });

    it("incident_count is a non-negative integer", () => {
      const series = getMockHealthTimeSeries();
      for (const point of series) {
        expect(point.incident_count).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(point.incident_count)).toBe(true);
      }
    });
  });

  // ── fetchNetworkHealth ─────────────────────────────────────────────────────

  describe("fetchNetworkHealth", () => {
    it("returns API data on 200 response", async () => {
      const mockData: NetworkHealthSummary = getMockNetworkHealth();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await fetchNetworkHealth();
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/health/network",
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });

    it("falls back to mock data on non-OK response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      } as Response);

      const result = await fetchNetworkHealth();
      expect(result.total_anchors).toBeGreaterThan(0);
    });

    it("falls back to mock data on network error", async () => {
      mockFetch.mockRejectedValueOnce(
        new TypeError("Failed to fetch")
      );

      const result = await fetchNetworkHealth();
      expect(result.total_anchors).toBeGreaterThan(0);
    });
  });

  // ── fetchAnchorHealthTimeSeries ────────────────────────────────────────────

  describe("fetchAnchorHealthTimeSeries", () => {
    it("returns API data on 200 response", async () => {
      const mockSeries: HealthTimeSeries[] = getMockHealthTimeSeries();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSeries,
      } as Response);

      const result = await fetchAnchorHealthTimeSeries("anchor-usdc-1");
      expect(result).toHaveLength(24);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/health/anchors/anchor-usdc-1/history",
        expect.anything()
      );
    });

    it("URL-encodes anchor IDs with special characters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => getMockHealthTimeSeries(),
      } as Response);

      await fetchAnchorHealthTimeSeries("anchor/with spaces");
      const calledUrl = (mockFetch.mock.calls[0] as unknown[])[0] as string;
      expect(calledUrl).toContain("anchor%2Fwith%20spaces");
    });

    it("falls back to mock data on network error", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
      const result = await fetchAnchorHealthTimeSeries("some-anchor");
      expect(result).toHaveLength(24);
    });
  });
});
