import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import NeedDetail from "./pages/NeedDetail";
import Verification from "./pages/Verification";
import Impact from "./pages/Impact";
import Appeals from "./pages/Appeals";
import AppealDetail from "./pages/AppealDetail";
import NotFound from "./pages/NotFound";
import GivingHub from "./pages/giving/GivingHub";
import FidyaPage from "./pages/giving/FidyaPage";
import MealSponsorshipPage from "./pages/giving/MealSponsorshipPage";
import ZakatPage from "./pages/giving/ZakatPage";
import QurbaniPage from "./pages/giving/QurbaniPage";
import SadaqahJariyahPage from "./pages/giving/SadaqahJariyahPage";

const queryClient = new QueryClient();

// Scroll restoration component
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Smooth scroll to hash anchor
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}

const AppRoutes = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/need/:id" element={<NeedDetail />} />
      <Route path="/appeals" element={<Appeals />} />
      <Route path="/appeal/:id" element={<AppealDetail />} />
      <Route path="/verification" element={<Verification />} />
      <Route path="/impact" element={<Impact />} />
      <Route path="/giving" element={<GivingHub />} />
      <Route path="/giving/fidya" element={<FidyaPage />} />
      <Route path="/giving/meal-sponsorship" element={<MealSponsorshipPage />} />
      <Route path="/giving/zakat" element={<ZakatPage />} />
      <Route path="/giving/qurbani" element={<QurbaniPage />} />
      <Route path="/giving/sadaqah-jariyah" element={<SadaqahJariyahPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
