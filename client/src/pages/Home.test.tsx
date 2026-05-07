import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../test-utils.js";
import { Home } from "./Home.js";
import type { RoundSummary, DraftSummary } from "../../../shared/types/index.js";

const mockRounds: RoundSummary[] = [
  {
    id: 1,
    course: "Pebble Beach",
    date: "2026-05-01T00:00:00.000Z",
    totalStrokes: 82,
    totalPar: 72,
    sgByCategory: { TEE: 0.5, APPROACH: -0.2, SHORT_GAME: 0.1, PUTTING: -0.3 },
    sgTotal: 0.1,
  },
  {
    id: 2,
    course: "Augusta National",
    date: "2026-04-15T00:00:00.000Z",
    totalStrokes: 78,
    totalPar: 72,
    sgByCategory: { TEE: 1.2, APPROACH: 0.3, SHORT_GAME: -0.1, PUTTING: 0.5 },
    sgTotal: 1.9,
  },
];

const mockDrafts: DraftSummary[] = [
  {
    id: 99,
    course: "Lakeside Golf Club",
    date: "2026-05-06T00:00:00.000Z",
    holeCount: 5,
  },
];

vi.mock("../api.js", () => ({
  api: {
    listRounds: vi.fn(),
    listDrafts: vi.fn(),
    deleteRound: vi.fn(),
  },
}));

// Import after mock so we get the mocked version
import { api } from "../api.js";

beforeEach(() => {
  vi.mocked(api.listRounds).mockResolvedValue(mockRounds);
  vi.mocked(api.listDrafts).mockResolvedValue([]);
});

describe("Home page", () => {
  it("shows round course names after loading", async () => {
    renderWithProviders(<Home />);
    await waitFor(() => expect(screen.getAllByText("Pebble Beach").length).toBeGreaterThan(0));
    expect(screen.getAllByText("Augusta National").length).toBeGreaterThan(0);
  });

  it("shows loading state initially", () => {
    vi.mocked(api.listRounds).mockReturnValue(new Promise(() => {})); // never resolves
    renderWithProviders(<Home />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows empty state when no rounds exist", async () => {
    vi.mocked(api.listRounds).mockResolvedValue([]);
    renderWithProviders(<Home />);
    await waitFor(() => expect(screen.getByText(/no rounds yet/i)).toBeInTheDocument());
  });

  it("shows in-progress section when drafts exist", async () => {
    vi.mocked(api.listDrafts).mockResolvedValue(mockDrafts);
    renderWithProviders(<Home />);
    await waitFor(() => expect(screen.getByText(/in progress/i)).toBeInTheDocument());
    expect(screen.getByText("Lakeside Golf Club")).toBeInTheDocument();
    expect(screen.getByText(/5 holes logged/i)).toBeInTheDocument();
  });

  it("does not show in-progress section when no drafts", async () => {
    renderWithProviders(<Home />);
    await waitFor(() => expect(screen.getAllByText("Pebble Beach").length).toBeGreaterThan(0));
    expect(screen.queryByText(/in progress/i)).not.toBeInTheDocument();
  });

  it("shows New Round button", async () => {
    renderWithProviders(<Home />);
    await waitFor(() => expect(screen.getAllByText("Pebble Beach").length).toBeGreaterThan(0));
    // HeroUI renders Button as={Link} with role="button" not role="link"
    expect(screen.getByRole("button", { name: /new round/i })).toBeInTheDocument();
  });

  it("shows error message when API fails", async () => {
    vi.mocked(api.listRounds).mockRejectedValue(new Error("Network error"));
    renderWithProviders(<Home />);
    await waitFor(() => expect(screen.getByText(/network error/i)).toBeInTheDocument());
  });
});
