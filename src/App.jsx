import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Portfolio from "./public/portfolio";
import AdminLayout from "./private/layout/AdminLayout";
import LoginPage from "./private/Login";
import SignupPage from "./private/Signup";
import UsersPage from "./private/User";
import Skills from "./private/Skills";
import ProjectsPage from "./private/Project";
import ExperiencePage from "./private/Expirence";
import QAPage from "./private/QA";
import TestimonialsPage from "./private/Testimonial";
import BlogsPage from "./private/Blog";
import AnalyticsDashboard from "./private/Dashboard";
import ProtectedRoute from "./context/protectedRoutes";
import PublicRoutes from "./context/publicRoutes";
import SettingsPage from "./private/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root route → Portfolio */}
        <Route path="/" element={<Portfolio />} />
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Admin route → Admin Layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="users" element={<UsersPage />} />
            <Route path="skills" element={<Skills />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="experience" element={<ExperiencePage />} />
            <Route path="qa" element={<QAPage />} />
            <Route path="testimonial" element={<TestimonialsPage />} />
            <Route path="blog" element={<BlogsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="" element={<AnalyticsDashboard />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
