"use client";

/**
 * NetworkHealthSummary – ChainPulse
 *
 * Displays a real-time overview of anchor health statuses, overall
 * network uptime, and average settlement latency.  Uses React Query
 * for auto-refresh every 30 s.
 */

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchNetworkHealth,
  type AnchorHealthSummary,
  type HealthStatus,
  type NetworkHealthSummary as TNetworkHealthSummary,
} from "@/lib/health-api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusColor(status: HealthStatus): string {
  switch (status) {
    case "healthy":
      return "text-green-400";
    case "degraded":
      return "text-yellow-400";
    case "critical":
      return "text-red-400";
    default:
      return "text-slate-400";
  }
}

function statusBadge(status: HealthStatus): string {
  switch (status) {
    case "healthy":
      return "bg-green-900/40 text-green-300 border border-green-700/50";
    case "degraded":
      return "bg-yellow-900/40 text-yellow-300 border border-yellow-700/50";
    case "critical":
      return "bg-red-900/40 text-red-300 border border-red-700/50";
    default:
      return "bg-slate-800 text-slate-400 border border-slate-600";
  }
}

function dot(status: HealthStatus): string {
  switch (status) {
    case "healthy":
      return "bg-green-400";
    case "degraded":
      return "bg-yellow-400";
    case "critical":
      return "bg-red-400 animate-pulse";
    default:
      return "bg-slate-500";
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  colorClass = "text-white",
}: {
  label: string;
  value: string;
  sub?: string;
  colorClass?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function AnchorRow({ anchor }: { anchor: AnchorHealthSummary }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${dot(anchor.status)}`}
          />
          <span className="text-sm text-slate-200 font-medium">
            {anchor.anchor_name}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge(anchor.status)}`}
        >
          {anchor.status}
        </span>
      </td>
      <td className="py-3 px-4 text-right text-sm text-slate-300">
        {anchor.uptime_percent.toFixed(2)}%
      </td>
      <td className="py-3 px-4 text-right text-sm text-slate-300">
        {anchor.avg_response_ms.toLocaleString()} ms
      </td>
      <td className="py-3 px-4 text-right text-sm text-slate-400">
        {anchor.incident_count_24h === 0 ? (
          <span className="text-green-400">—</span>
        ) : (
          <span className="text-red-400">{anchor.incident_count_24h}</span>
        )}
      </td>
    </tr>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function NetworkHealthSummary() {
  const { data, isPending, isError, dataUpdatedAt } =
    useQuery<TNetworkHealthSummary>({
      queryKey: ["network-health"],
      queryFn: fetchNetworkHealth,
      refetchInterval: 30_000,
      staleTime: 25_000,
    });

  if (isPending) {
    return (
      <div
        className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 animate-pulse"
        data-testid="network-health-loading"
      >
        <div className="h-6 w-48 bg-white/10 rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="rounded-2xl border border-red-800/40 bg-red-950/20 p-6"
        data-testid="network-health-error"
      >
        <p className="text-red-400 text-sm">
          Failed to load network health data. Retrying…
        </p>
      </div>
    );
  }

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : "—";

  return (
    <section
      className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-6"
      aria-label="Network health summary"
      data-testid="network-health-summary"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Network Health
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-refreshes every 30 s · Last updated {lastUpdated}
          </p>
        </div>
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${statusBadge(data.status)}`}
        >
          {data.status.toUpperCase()}
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Network Uptime"
          value={`${data.network_uptime_percent.toFixed(1)}%`}
          colorClass={statusColor(data.status)}
        />
        <StatCard
          label="Avg Settlement"
          value={`${data.avg_settlement_ms.toLocaleString()} ms`}
          sub="across all corridors"
        />
        <StatCard
          label="Healthy Anchors"
          value={`${data.healthy_anchors} / ${data.total_anchors}`}
          colorClass="text-green-400"
        />
        <StatCard
          label="Incidents (24 h)"
          value={`${data.degraded_anchors + data.critical_anchors}`}
          colorClass={
            data.critical_anchors > 0
              ? "text-red-400"
              : data.degraded_anchors > 0
                ? "text-yellow-400"
                : "text-green-400"
          }
          sub={`${data.critical_anchors} critical · ${data.degraded_anchors} degraded`}
        />
      </div>

      {/* Anchor table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-label="Anchor health table">
          <thead>
            <tr className="border-b border-white/10 text-xs text-slate-500 uppercase tracking-wider">
              <th className="pb-2 px-4 font-medium">Anchor</th>
              <th className="pb-2 px-4 font-medium">Status</th>
              <th className="pb-2 px-4 text-right font-medium">Uptime</th>
              <th className="pb-2 px-4 text-right font-medium">
                Avg Response
              </th>
              <th className="pb-2 px-4 text-right font-medium">
                Incidents 24 h
              </th>
            </tr>
          </thead>
          <tbody>
            {data.anchors.map((anchor) => (
              <AnchorRow key={anchor.anchor_id} anchor={anchor} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default NetworkHealthSummary;
