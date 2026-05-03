import { BrowserRouter, Routes, Route, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import { Landing } from "./pages/Landing.js";
import { Login } from "./pages/Login.js";
import { Register } from "./pages/Register.js";
import { Profile } from "./pages/Profile.js";
import { Home } from "./pages/Home.js";
import { NewRound } from "./pages/NewRound.js";
import { RoundDetail } from "./pages/RoundDetail.js";
import { Trends } from "./pages/Trends.js";
import { Help } from "./pages/Help.js";

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

function SignOutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await logout();
    navigate("/login");
  }

  return (
    <NavbarItem>
      <button
        onClick={handleSignOut}
        className="text-sm font-medium px-3 py-1.5 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        Sign Out
      </button>
    </NavbarItem>
  );
}

function AppShell() {
  const { user } = useAuth();

  return (
    <>
      <Navbar
        maxWidth="xl"
        className="bg-[#003D2B] border-b-2 border-[#F5D130] sticky top-0 z-50"
        classNames={{ wrapper: "px-8 h-20" }}
      >
        <NavbarBrand>
          <NavLink to="/profile" className="font-black text-[36px] tracking-widest uppercase text-[#F5D130] no-underline">
            Eagle Eyes
          </NavLink>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavItem to="/profile" end>Profile</NavItem>
          <NavItem to="/rounds">Rounds</NavItem>
          <NavItem to="/trends">Trends</NavItem>
          <NavItem to="/new">New Round</NavItem>
          <NavItem to="/help">Help</NavItem>
          {user && (
            <NavbarItem>
              <span className="text-white/40 text-sm hidden md:block max-w-[160px] truncate" title={user.email}>
                {user.firstName || user.email}
              </span>
            </NavbarItem>
          )}
          <SignOutButton />
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
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/rounds" element={<Home />} />
              <Route path="/rounds/:id" element={<RoundDetail />} />
              <Route path="/new" element={<NewRound />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/help" element={<Help />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
