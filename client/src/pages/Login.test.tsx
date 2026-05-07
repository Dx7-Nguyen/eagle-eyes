import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../test-utils.js";
import { Login } from "./Login.js";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../context/AuthContext.js", () => ({
  useAuth: () => ({ user: null, loading: false, login: mockLogin }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  mockLogin.mockReset();
  mockNavigate.mockReset();
  localStorage.clear();
});

describe("Login page", () => {
  it("renders email and password fields", () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it("renders the Sign In heading", () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  it("calls login with typed credentials on submit", async () => {
    mockLogin.mockResolvedValue(undefined);
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInput = document.querySelector('input[type="password"]')!;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.submit(emailInput.closest("form")!);

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123", false));
  });

  it("navigates to /profile after successful login", async () => {
    mockLogin.mockResolvedValue(undefined);
    renderWithProviders(<Login />);

    fireEvent.submit(screen.getByPlaceholderText("you@example.com").closest("form")!);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/profile"));
  });

  it("shows error message when login throws", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"));
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "bad@example.com" } });
    fireEvent.submit(emailInput.closest("form")!);

    await waitFor(() =>
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument(),
    );
  });

  it("pre-fills email from localStorage when remember-me was set", () => {
    localStorage.setItem("eagle_eyes_remembered_email", "saved@example.com");
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText("you@example.com")).toHaveValue("saved@example.com");
  });

  it("passes rememberMe=true when checkbox is checked", async () => {
    mockLogin.mockResolvedValue(undefined);
    renderWithProviders(<Login />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    fireEvent.submit(screen.getByPlaceholderText("you@example.com").closest("form")!);

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith(expect.any(String), expect.any(String), true),
    );
  });

  it("shows link to register page", () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole("link", { name: /create one/i })).toBeInTheDocument();
  });
});
