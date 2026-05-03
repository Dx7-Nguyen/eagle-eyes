import { BrowserRouter, Routes, Route, NavLink, Outlet } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { Landing } from "./pages/Landing";
import { Home } from "./pages/Home";
import { NewRound } from "./pages/NewRound";
import { RoundDetail } from "./pages/RoundDetail";
import { Trends } from "./pages/Trends";
import { Help } from "./pages/Help";

function NavItem({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavbarItem>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `text-base font-medium px-4 py-2 rounded-lg transition-colors ${
            isActive
              ? "text-[#F5D130] bg-white/10"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`
        }
      >
        {children}
      </NavLink>
    </NavbarItem>
  );
}

function AppShell() {
  return (
    <>
      <Navbar
        maxWidth="xl"
        className="bg-[#003D2B] border-b-2 border-[#F5D130] sticky top-0 z-50"
        classNames={{ wrapper: "px-8 h-20" }}
      >
        <NavbarBrand>
          <NavLink to="/" className="font-black text-[36px] tracking-widest uppercase text-[#F5D130] no-underline">
            Eagle Eyes
          </NavLink>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavItem to="/rounds">Rounds</NavItem>
          <NavItem to="/trends">Trends</NavItem>
          <NavItem to="/new">New Round</NavItem>
          <NavItem to="/help">Help</NavItem>
        </NavbarContent>
      </Navbar>
      <main className="max-w-6xl mx-auto px-6 py-7">
        <Outlet />
      </main>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AppShell />}>
          <Route path="/rounds" element={<Home />} />
          <Route path="/rounds/:id" element={<RoundDetail />} />
          <Route path="/new" element={<NewRound />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/help" element={<Help />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
