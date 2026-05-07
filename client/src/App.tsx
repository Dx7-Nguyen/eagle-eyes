import { useState } from "react";
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

const NAV_LINKS = [
  { to: "/profile", end: true, label: "Profile" },
  { to: "/rounds", label: "Rounds" },
  { to: "/trends", label: "Trends" },
  { to: "/new", label: "New Round" },
  { to: "/help", label: "Help" },
];

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

function SignOutButton({ onSignOut }: { onSignOut?: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    onSignOut?.();
    await logout();
    navigate("/login");
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm font-medium px-3 py-1.5 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
    >
      Sign Out
    </button>
  );
}

function AppShell() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Navbar
        maxWidth="xl"
        className="bg-[#003D2B] border-b-2 border-[#F5D130] sticky top-0 z-50"
        classNames={{ wrapper: "px-4 sm:px-8 h-16 sm:h-20" }}
      >
        {/* Brand + hamburger */}
        <NavbarContent>
          <button
            className="sm:hidden text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
          <NavbarBrand>
            <NavLink
              to="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="font-black text-2xl sm:text-[36px] tracking-widest uppercase text-[#F5D130] no-underline"
            >
              Eagle Eyes
            </NavLink>
          </NavbarBrand>
        </NavbarContent>

        {/* Desktop nav */}
        <NavbarContent justify="end" className="hidden sm:flex">
          {NAV_LINKS.map(({ to, end, label }) => (
            <NavItem key={to} to={to} end={end}>{label}</NavItem>
          ))}
          {user && (
            <NavbarItem>
              <span className="text-white/40 text-sm hidden md:block max-w-[160px] truncate" title={user.email}>
                {user.firstName || user.email}
              </span>
            </NavbarItem>
          )}
          <NavbarItem>
            <SignOutButton />
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Mobile menu — rendered outside Navbar so it's not constrained by HeroUI internals */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-[#003D2B] border-t border-[#F5D130]/30 z-40 sm:hidden flex flex-col py-2 shadow-xl">
          {NAV_LINKS.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `block text-base font-medium mx-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "text-[#F5D130] bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="mx-2 mt-2 pt-3 border-t border-white/10 flex flex-col gap-2 px-4">
            {user && (
              <span className="text-white/40 text-sm">{user.firstName || user.email}</span>
            )}
            <div>
              <SignOutButton onSignOut={() => setIsMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
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
