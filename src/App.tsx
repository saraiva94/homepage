import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DevPage from "./pages/portfolio/Dev";
import EditsPage from "./pages/portfolio/Edits";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/portfolio/dev" element={<DevPage />} />
        <Route path="/portfolio/edits" element={<EditsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;