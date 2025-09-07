import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  // agar token nahi hai to login pe redirect
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // warna children routes render honge
  return <Outlet />;
}
