import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F7F4]">
        <span className="text-[#003D2B] font-semibold tracking-wide">Loading…</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
