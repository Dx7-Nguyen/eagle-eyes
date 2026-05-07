import { render, type RenderOptions } from "@testing-library/react";
import { HeroUIProvider } from "@heroui/react";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";

function AllProviders({
  children,
  initialEntries,
}: {
  children: React.ReactNode;
  initialEntries?: MemoryRouterProps["initialEntries"];
}) {
  return (
    <HeroUIProvider>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </HeroUIProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    initialEntries,
    ...options
  }: Omit<RenderOptions, "wrapper"> & { initialEntries?: MemoryRouterProps["initialEntries"] } = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialEntries={initialEntries}>{children}</AllProviders>
    ),
    ...options,
  });
}
