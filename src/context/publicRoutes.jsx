import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoutes() {
  const token = localStorage.getItem("token");

  // agar token hai to login/signup/portfolio direct access block
  if (token) {
    return <Navigate to="/admin" replace />;
  }

  // warna public pages (login, signup, portfolio) dikhao
  return <Outlet />;
}
