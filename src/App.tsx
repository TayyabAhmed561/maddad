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
import CharityDetail from "./pages/CharityDetail";
import GivingHub from "./pages/giving/GivingHub";
import FidyaPage from "./pages/giving/FidyaPage";
import MealSponsorshipPage from "./pages/giving/MealSponsorshipPage";
import ZakatPage from "./pages/giving/ZakatPage";
import QurbaniPage from "./pages/giving/QurbaniPage";
import SadaqahJariyahPage from "./pages/giving/SadaqahJariyahPage";
import KaffarahPage from "./pages/giving/KaffarahPage";
import RamadanPage from "./pages/RamadanPage";
import ReceiptDetail from "./pages/ReceiptDetail";
import MyGiving from "./pages/MyGiving";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OrgVerificationForm from "./pages/verification/OrgVerificationForm";
import CampaignVerificationForm from "./pages/verification/CampaignVerificationForm";
import VerifierDashboard from "./pages/verification/VerifierDashboard";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) { element.scrollIntoView({ behavior: "smooth" }); return; }
    }
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
      <Route path="/needs" element={<Explore />} />
      <Route path="/need/:id" element={<NeedDetail />} />
      <Route path="/needs/:id" element={<NeedDetail />} />
      <Route path="/appeals" element={<Appeals />} />
      <Route path="/appeals/:id" element={<AppealDetail />} />
      <Route path="/charity/:id" element={<CharityDetail />} />
      <Route path="/verification" element={<Verification />} />
      <Route path="/verify/organization" element={<OrgVerificationForm />} />
      <Route path="/verify/campaign" element={<CampaignVerificationForm />} />
      <Route path="/verifier" element={<VerifierDashboard />} />
      <Route path="/impact" element={<Impact />} />
      <Route path="/giving" element={<GivingHub />} />
      <Route path="/give" element={<GivingHub />} />
      <Route path="/giving/fidya" element={<FidyaPage />} />
      <Route path="/give/fidya" element={<FidyaPage />} />
      <Route path="/giving/meal-sponsorship" element={<MealSponsorshipPage />} />
      <Route path="/give/meals" element={<MealSponsorshipPage />} />
      <Route path="/giving/zakat" element={<ZakatPage />} />
      <Route path="/give/zakat" element={<ZakatPage />} />
      <Route path="/giving/qurbani" element={<QurbaniPage />} />
      <Route path="/give/qurbani" element={<QurbaniPage />} />
      <Route path="/giving/sadaqah-jariyah" element={<SadaqahJariyahPage />} />
      <Route path="/give/jariyah" element={<SadaqahJariyahPage />} />
      <Route path="/giving/kaffarah" element={<KaffarahPage />} />
      <Route path="/give/kaffarah" element={<KaffarahPage />} />
      <Route path="/ramadan" element={<RamadanPage />} />
      <Route path="/receipt/:receiptId" element={<ReceiptDetail />} />
      <Route path="/my-giving" element={<MyGiving />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
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
