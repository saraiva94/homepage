import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded routes — each gets its own chunk
const DevPage = lazy(() => import("./pages/portfolio/Dev"));
const EditsPage = lazy(() => import("./pages/portfolio/Edits"));
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));

function MinimalFallback() {
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<MinimalFallback />}>
      <Routes>
        {/* Homepage loaded eagerly (critical path) */}
        <Route path="/" element={<Index key={location.key} />} />
        {/* Everything else lazy */}
        <Route path="/portfolio/dev" element={<DevPage />} />
        <Route path="/portfolio/edits" element={<EditsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
