/**
 * Tests for NetworkHealthSummary component – ChainPulse
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NetworkHealthSummary } from "@/components/NetworkHealthSummary";
import { getMockNetworkHealth } from "@/lib/health-api";

// Prevent module-level config throw
vi.mock("@/config", () => ({ config: { apiUrl: "http://localhost:8080" } }));

// Mock health-api so we never hit the network in tests
vi.mock("@/lib/health-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/health-api")>();
  return {
    ...actual,
    fetchNetworkHealth: vi.fn(),
  };
});

import { fetchNetworkHealth } from "@/lib/health-api";
const mockFetchNetworkHealth = vi.mocked(fetchNetworkHealth);

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe("NetworkHealthSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton while fetching", () => {
    // Return a never-resolving promise to keep the loading state
    mockFetchNetworkHealth.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<NetworkHealthSummary />);
    expect(screen.getByTestId("network-health-loading")).toBeInTheDocument();
  });

  it("shows error state when fetch rejects", async () => {
    mockFetchNetworkHealth.mockRejectedValueOnce(new Error("Network error"));
    renderWithQuery(<NetworkHealthSummary />);
    await waitFor(() => {
      expect(screen.getByTestId("network-health-error")).toBeInTheDocument();
    });
  });

  it("renders the summary section with fetched data", async () => {
    mockFetchNetworkHealth.mockResolvedValueOnce(getMockNetworkHealth());
    renderWithQuery(<NetworkHealthSummary />);
    await waitFor(() => {
      expect(
        screen.getByTestId("network-health-summary")
      ).toBeInTheDocument();
    });
  });

  it("shows 'Network Health' heading", async () => {
    mockFetchNetworkHealth.mockResolvedValueOnce(getMockNetworkHealth());
    renderWithQuery(<NetworkHealthSummary />);
    await waitFor(() => {
      expect(screen.getByText("Network Health")).toBeInTheDocument();
    });
  });

  it("displays the network status badge", async () => {
    const health = getMockNetworkHealth();
    mockFetchNetworkHealth.mockResolvedValueOnce(health);
    renderWithQuery(<NetworkHealthSummary />);
    await waitFor(() => {
      expect(
        screen.getByText(health.status.toUpperCase())
      ).toBeInTheDocument();
    });
  });

  it("renders a row for every anchor in the data", async () => {
    const health = getMockNetworkHealth();
    mockFetchNetworkHealth.mockResolvedValueOnce(health);
    renderWithQuery(<NetworkHealthSummary />);
    await waitFor(() => {
      for (const anchor of health.anchors) {
        expect(screen.getByText(anchor.anchor_name)).toBeInTheDocument();
      }
    });
  });

  it("displays KPI: healthy anchors count", async () => {
    const health = getMockNetworkHealth();
    mockFetchNetworkHealth.mockResolvedValueOnce(health);
    renderWithQuery(<NetworkHealthSummary />);
    await waitFor(() => {
      expect(
        screen.getByText(
          `${health.healthy_anchors} / ${health.total_anchors}`
        )
      ).toBeInTheDocument();
    });
  });

  it("displays network uptime percentage", async () => {
    const health = getMockNetworkHealth();
    mockFetchNetworkHealth.mockResolvedValueOnce(health);
    renderWithQuery(<NetworkHealthSummary />);
    await waitFor(() => {
      expect(
        screen.getByText(
          `${health.network_uptime_percent.toFixed(1)}%`
        )
      ).toBeInTheDocument();
    });
  });

  it("has accessible aria-label on the section", async () => {
    mockFetchNetworkHealth.mockResolvedValueOnce(getMockNetworkHealth());
    renderWithQuery(<NetworkHealthSummary />);
    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: /network health summary/i })
      ).toBeInTheDocument();
    });
  });
});
