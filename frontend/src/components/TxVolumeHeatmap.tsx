"use client";

/**
 * TxVolumeHeatmap – ChainPulse
 *
 * A 7-day × 24-hour heatmap of transaction volume per corridor.
 * Colour intensity reflects relative volume; tooltip shows exact figures.
 * Implemented with plain SVG/div grid (no extra chart library import).
 */

import React, { useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HeatmapCell {
  day: number;   // 0 = Monday … 6 = Sunday
  hour: number;  // 0–23
  volume_usd: number;
}

export interface TxVolumeHeatmapProps {
  /** Raw volume data – one entry per (day, hour) bucket */
  data: HeatmapCell[];
  /** Optional title override */
  title?: string;
  /** Optional CSS class for the wrapper */
  className?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

/**
 * Map a normalised value [0,1] to a blue-purple gradient used by ChainPulse.
 */
function volumeToColor(norm: number): string {
  if (norm <= 0) return "rgba(15,23,42,0.6)";
  // Interpolate: slate-800 → indigo-600 → violet-500
  const r = Math.round(30 + norm * (139 - 30));
  const g = Math.round(41 + norm * (92 - 41));
  const b = Math.round(82 + norm * (246 - 82));
  return `rgba(${r},${g},${b},${0.35 + norm * 0.65})`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TxVolumeHeatmap({
  data,
  title = "Transaction Volume Heatmap",
  className = "",
}: TxVolumeHeatmapProps) {
  // Build a (day × hour) lookup map
  const grid = useMemo(() => {
    const map = new Map<string, number>();
    let max = 0;
    for (const cell of data) {
      const key = `${cell.day}-${cell.hour}`;
      const existing = map.get(key) ?? 0;
      const total = existing + cell.volume_usd;
      map.set(key, total);
      if (total > max) max = total;
    }
    return { map, max };
  }, [data]);

  const [tooltip, setTooltip] = React.useState<{
    day: number;
    hour: number;
    volume: number;
    x: number;
    y: number;
  } | null>(null);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-6 ${className}`}
      aria-label={title}
      data-testid="tx-volume-heatmap"
    >
      <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
      <p className="text-xs text-slate-500 mb-5">
        7-day rolling window · colour intensity = relative volume
      </p>

      {/* Hour axis labels */}
      <div className="flex gap-0.5 ml-10 mb-1">
        {HOURS.map((h) => (
          <div
            key={h}
            className="flex-1 text-center text-[9px] text-slate-600"
            aria-hidden="true"
          >
            {h % 6 === 0 ? `${h}h` : ""}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      <div className="space-y-0.5">
        {DAYS.map((dayLabel, dayIdx) => (
          <div key={dayIdx} className="flex items-center gap-0.5">
            {/* Day label */}
            <span className="w-8 text-right text-[10px] text-slate-500 pr-2 shrink-0">
              {dayLabel}
            </span>

            {HOURS.map((hour) => {
              const volume = grid.map.get(`${dayIdx}-${hour}`) ?? 0;
              const norm = grid.max > 0 ? volume / grid.max : 0;
              const bg = volumeToColor(norm);

              return (
                <div
                  key={hour}
                  className="flex-1 aspect-square rounded-sm cursor-pointer transition-transform hover:scale-125 hover:z-10 relative"
                  style={{ backgroundColor: bg }}
                  role="gridcell"
                  aria-label={`${dayLabel} ${hour}:00 – ${formatVolume(volume)}`}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      day: dayIdx,
                      hour,
                      volume,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Colour scale legend */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-[10px] text-slate-500">Low</span>
        <div
          className="h-2 flex-1 rounded-full"
          style={{
            background:
              "linear-gradient(to right, rgba(15,23,42,0.6), rgba(99,102,241,0.6), rgba(139,92,246,1))",
          }}
          aria-hidden="true"
        />
        <span className="text-[10px] text-slate-500">High</span>
      </div>

      {/* Floating tooltip – rendered outside grid to avoid clipping */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg bg-slate-800 border border-white/10 shadow-xl text-xs text-white"
          style={{ left: tooltip.x, top: tooltip.y - 56, transform: "translateX(-50%)" }}
          role="tooltip"
          aria-live="polite"
        >
          <p className="font-semibold">
            {DAYS[tooltip.day]} {tooltip.hour}:00
          </p>
          <p className="text-slate-300">{formatVolume(tooltip.volume)}</p>
        </div>
      )}
    </section>
  );
}

// ── Mock data generator (exported for tests & Storybook) ──────────────────────

export function generateMockHeatmapData(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // Higher volume during business hours (08–18) on weekdays
      const isWeekday = day < 5;
      const isBusinessHour = hour >= 8 && hour <= 18;
      const base = isWeekday && isBusinessHour ? 80_000 : 10_000;
      cells.push({
        day,
        hour,
        volume_usd: base + Math.random() * base * 0.5,
      });
    }
  }
  return cells;
}

export default TxVolumeHeatmap;
