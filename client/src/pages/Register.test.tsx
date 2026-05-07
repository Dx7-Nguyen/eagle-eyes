import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../test-utils.js";
import { Register } from "./Register.js";

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../context/AuthContext.js", () => ({
  useAuth: () => ({ user: null, loading: false, register: mockRegister }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  mockRegister.mockReset();
  mockNavigate.mockReset();
});

function getForm() {
  return document.querySelector("form")!;
}

function fillForm(firstName = "Alice", email = "alice@example.com", password = "Password1", confirm = "Password1") {
  const inputs = document.querySelectorAll("form input");
  // Order: full name, email, password, confirm password
  fireEvent.change(inputs[0], { target: { value: firstName } });
  fireEvent.change(inputs[1], { target: { value: email } });
  fireEvent.change(inputs[2], { target: { value: password } });
  fireEvent.change(inputs[3], { target: { value: confirm } });
}

describe("Register page", () => {
  it("renders all four input fields", () => {
    renderWithProviders(<Register />);
    const inputs = document.querySelectorAll("form input");
    expect(inputs).toHaveLength(4);
  });

  it("renders Create Account heading", () => {
    renderWithProviders(<Register />);
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
  });

  it("shows error when full name is blank", async () => {
    renderWithProviders(<Register />);
    fillForm("", "alice@example.com", "Password1", "Password1");
    fireEvent.submit(getForm());
    await waitFor(() => expect(screen.getByText(/full name is required/i)).toBeInTheDocument());
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("shows error when passwords do not match", async () => {
    renderWithProviders(<Register />);
    fillForm("Alice", "alice@example.com", "Password1", "Different1");
    fireEvent.submit(getForm());
    await waitFor(() => expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument());
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("shows error when password is too short", async () => {
    renderWithProviders(<Register />);
    fillForm("Alice", "alice@example.com", "Pass1", "Pass1");
    fireEvent.submit(getForm());
    await waitFor(() => expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument());
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("shows error when password contains special characters", async () => {
    renderWithProviders(<Register />);
    fillForm("Alice", "alice@example.com", "Pass!word1", "Pass!word1");
    fireEvent.submit(getForm());
    await waitFor(() => expect(screen.getByText(/letters.*numbers only/i)).toBeInTheDocument());
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("calls register and navigates on valid submission", async () => {
    mockRegister.mockResolvedValue(undefined);
    renderWithProviders(<Register />);
    fillForm("Alice", "alice@example.com", "Password1", "Password1");
    fireEvent.submit(getForm());

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith("alice@example.com", "Password1", "Alice"),
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/profile"));
  });

  it("shows API error when register throws", async () => {
    mockRegister.mockRejectedValue(new Error("Email already in use"));
    renderWithProviders(<Register />);
    fillForm();
    fireEvent.submit(getForm());

    await waitFor(() => expect(screen.getByText("Email already in use")).toBeInTheDocument());
  });

  it("shows link to login page", () => {
    renderWithProviders(<Register />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });
});
