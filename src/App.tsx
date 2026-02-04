import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EpicProvider } from "@/contexts/EpicContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { AppLayout } from "@/components/layout/AppLayout";
import ProductHub from "@/pages/ProductHub";
import Dashboard from "@/pages/Dashboard";
import ImportPage from "@/pages/ImportPage";
import EpicsPage from "@/pages/EpicsPage";
import RoadmapPage from "@/pages/RoadmapPage";
import StoriesPage from "@/pages/StoriesPage";
import GeneratePage from "@/pages/GeneratePage";
import ExportPage from "@/pages/ExportPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper component for product routes
function ProductRoutes() {
  return (
    <ProductProvider>
      <EpicProvider>
        <AppLayout>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="import" element={<ImportPage />} />
            <Route path="epics" element={<EpicsPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="stories" element={<StoriesPage />} />
            <Route path="generate" element={<GeneratePage />} />
            <Route path="export" element={<ExportPage />} />
          </Routes>
        </AppLayout>
      </EpicProvider>
    </ProductProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<ProductHub />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/:productId/*" element={<ProductRoutes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
