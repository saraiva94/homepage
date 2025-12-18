import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Componente de loading para Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  </div>
);

// Página inicial carrega normalmente (crítica para primeira pintura)
import Index from "./pages/Index";

// Rotas secundárias com lazy loading (code splitting)
const DevPage = lazy(() => import("./pages/portfolio/Dev"));
const EditsPage = lazy(() => import("./pages/portfolio/Edits"));
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Rota crítica - carrega imediatamente */}
          <Route path="/" element={<Index />} />
          
          {/* Rotas lazy-loaded - chunks separados */}
          <Route path="/portfolio/dev" element={<DevPage />} />
          <Route path="/portfolio/edits" element={<EditsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
