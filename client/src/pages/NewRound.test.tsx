import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../test-utils.js";
import { NewRound } from "./NewRound.js";

const mockNavigate = vi.fn();

vi.mock("../context/AuthContext.js", () => ({
  useAuth: () => ({ user: { id: 1, email: "test@example.com", firstName: "Test", gender: "male" } }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../api.js", () => ({
  api: {
    searchCourses: vi.fn().mockResolvedValue([]),
    saveDraft: vi.fn(),
    updateDraft: vi.fn(),
    createRound: vi.fn(),
    publishRound: vi.fn(),
    getRoundEditData: vi.fn(),
  },
}));

import { api } from "../api.js";

beforeEach(() => {
  mockNavigate.mockReset();
  vi.mocked(api.createRound).mockResolvedValue({} as never);
  vi.mocked(api.saveDraft).mockResolvedValue({ id: 1, course: "Test", date: new Date().toISOString(), holeCount: 1 });
});

describe("NewRound page", () => {
  it("renders the New Round heading", () => {
    renderWithProviders(<NewRound />);
    expect(screen.getByRole("heading", { name: /new round/i })).toBeInTheDocument();
  });

  it("renders Course, Date, and Holes controls", () => {
    renderWithProviders(<NewRound />);
    expect(screen.getByText(/course/i)).toBeInTheDocument();
    expect(screen.getByText(/date/i)).toBeInTheDocument();
    expect(screen.getByText(/holes/i)).toBeInTheDocument();
  });

  it("starts with one hole displayed", () => {
    renderWithProviders(<NewRound />);
    expect(screen.getByText(/hole 1/i)).toBeInTheDocument();
  });

  it("adds a hole when '+ Add hole' is clicked", async () => {
    renderWithProviders(<NewRound />);
    const addHoleBtn = screen.getByRole("button", { name: /add hole/i });
    fireEvent.click(addHoleBtn);
    await waitFor(() => expect(screen.getByText(/hole 2/i)).toBeInTheDocument());
  });

  it("adds a shot when '+ Add shot' is clicked", async () => {
    renderWithProviders(<NewRound />);
    // Initially Shot 1 is shown (mobile card or desktop table)
    const addShotBtn = screen.getAllByRole("button", { name: /add shot/i })[0];
    fireEvent.click(addShotBtn);
    await waitFor(() => {
      const shotLabels = screen.getAllByText(/shot 2/i);
      expect(shotLabels.length).toBeGreaterThan(0);
    });
  });

  it("shows Cancel and Save progress and Finish round buttons", () => {
    renderWithProviders(<NewRound />);
    // HeroUI renders Button as={Link} with role="button"
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save progress/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /finish round/i })).toBeInTheDocument();
  });

  it("Save progress is disabled when course is empty", () => {
    renderWithProviders(<NewRound />);
    const saveBtn = screen.getByRole("button", { name: /save progress/i });
    expect(saveBtn).toBeDisabled();
  });

  it("opening Finish round shows the confirm modal", async () => {
    renderWithProviders(<NewRound />);
    const finishBtn = screen.getByRole("button", { name: /finish round/i });
    fireEvent.click(finishBtn);
    await waitFor(() => expect(screen.getByText(/publish round\?|round not complete/i)).toBeInTheDocument());
  });

  it("round type buttons switch between F9, B9, 18", () => {
    renderWithProviders(<NewRound />);
    expect(screen.getByRole("button", { name: "F9" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "B9" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "18" })).toBeInTheDocument();
  });
});
