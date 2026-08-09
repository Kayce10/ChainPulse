/**
 * Tests for TxVolumeHeatmap component – ChainPulse
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  TxVolumeHeatmap,
  generateMockHeatmapData,
  type HeatmapCell,
} from "@/components/TxVolumeHeatmap";

describe("TxVolumeHeatmap", () => {
  describe("generateMockHeatmapData", () => {
    it("returns 168 cells (7 days × 24 hours)", () => {
      const data = generateMockHeatmapData();
      expect(data).toHaveLength(168);
    });

    it("all days are in range 0–6", () => {
      const data = generateMockHeatmapData();
      for (const cell of data) {
        expect(cell.day).toBeGreaterThanOrEqual(0);
        expect(cell.day).toBeLessThanOrEqual(6);
      }
    });

    it("all hours are in range 0–23", () => {
      const data = generateMockHeatmapData();
      for (const cell of data) {
        expect(cell.hour).toBeGreaterThanOrEqual(0);
        expect(cell.hour).toBeLessThanOrEqual(23);
      }
    });

    it("all volume_usd values are positive", () => {
      const data = generateMockHeatmapData();
      for (const cell of data) {
        expect(cell.volume_usd).toBeGreaterThan(0);
      }
    });

    it("business hours on weekdays have higher average volume than nights", () => {
      const data = generateMockHeatmapData();
      const businessCells = data.filter(
        (c) => c.day < 5 && c.hour >= 8 && c.hour <= 18
      );
      const nightCells = data.filter(
        (c) => c.day < 5 && (c.hour < 6 || c.hour > 21)
      );
      const avgBusiness =
        businessCells.reduce((s, c) => s + c.volume_usd, 0) /
        businessCells.length;
      const avgNight =
        nightCells.reduce((s, c) => s + c.volume_usd, 0) / nightCells.length;
      expect(avgBusiness).toBeGreaterThan(avgNight);
    });
  });

  describe("rendering", () => {
    it("renders the section with testid", () => {
      const data = generateMockHeatmapData();
      render(<TxVolumeHeatmap data={data} />);
      expect(
        screen.getByTestId("tx-volume-heatmap")
      ).toBeInTheDocument();
    });

    it("shows the default title", () => {
      render(<TxVolumeHeatmap data={[]} />);
      expect(
        screen.getByText("Transaction Volume Heatmap")
      ).toBeInTheDocument();
    });

    it("respects a custom title", () => {
      render(<TxVolumeHeatmap data={[]} title="My Custom Heatmap" />);
      expect(screen.getByText("My Custom Heatmap")).toBeInTheDocument();
    });

    it("renders 7 day labels", () => {
      render(<TxVolumeHeatmap data={[]} />);
      for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
        expect(screen.getByText(day)).toBeInTheDocument();
      }
    });

    it("renders 168 gridcells (7 × 24)", () => {
      const data = generateMockHeatmapData();
      render(<TxVolumeHeatmap data={data} />);
      const cells = screen.getAllByRole("gridcell");
      expect(cells).toHaveLength(168);
    });

    it("renders with empty data without crashing", () => {
      const { container } = render(<TxVolumeHeatmap data={[]} />);
      expect(container).toBeTruthy();
    });

    it("gridcell aria-labels include day, hour and volume", () => {
      const data: HeatmapCell[] = [{ day: 0, hour: 9, volume_usd: 50_000 }];
      render(<TxVolumeHeatmap data={data} />);
      // Mon 9:00 should have a properly formatted label
      const cell = screen.getByRole("gridcell", { name: /Mon 9:00/i });
      expect(cell).toBeInTheDocument();
      // Volume label should contain a formatted amount
      expect(cell.getAttribute("aria-label")).toContain("$50K");
    });

    it("applies custom className to wrapper", () => {
      const { container } = render(
        <TxVolumeHeatmap data={[]} className="my-custom-class" />
      );
      expect(
        container.querySelector(".my-custom-class")
      ).toBeInTheDocument();
    });
  });
});
