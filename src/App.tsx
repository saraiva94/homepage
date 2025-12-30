import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DevPage from "./pages/portfolio/Dev";
import EditsPage from "./pages/portfolio/Edits";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes>
      {/* key força remount da Index ao navegar de volta, garantindo animação inicial */}
      <Route path="/" element={<Index key={location.key} />} />
      <Route path="/portfolio/dev" element={<DevPage />} />
      <Route path="/portfolio/edits" element={<EditsPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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