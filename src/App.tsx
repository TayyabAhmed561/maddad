import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
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
import DhulHijjah from "./pages/DhulHijjah";
import SupportMaddad from "./pages/SupportMaddad";
import Checkout from "./pages/Checkout";
import CheckoutConfirmation from "./pages/CheckoutConfirmation";
import ReceiptDetail from "./pages/ReceiptDetail";
import MyGiving from "./pages/MyGiving";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import OrgVerificationForm from "./pages/verification/OrgVerificationForm";
import CampaignVerificationForm from "./pages/verification/CampaignVerificationForm";
import VerifierDashboard from "./pages/verification/VerifierDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Apply from "./pages/Apply";
import Partners from "./pages/Partners";
import AppealsSubmit from "./pages/AppealsSubmit";

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
      {/* ── Public routes ──────────────────────────────────────────── */}
      <Route path="/" element={<Index />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/needs" element={<Explore />} />
      <Route path="/need/:id" element={<NeedDetail />} />
      <Route path="/needs/:id" element={<NeedDetail />} />
      <Route path="/appeals" element={<Appeals />} />
      <Route path="/appeals/:id" element={<AppealDetail />} />
      <Route path="/charity/:id" element={<CharityDetail />} />
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
      <Route path="/dhul-hijjah" element={<DhulHijjah />} />
      <Route path="/support-maddad" element={<SupportMaddad />} />
      <Route path="/apply" element={<Apply />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/appeals/submit" element={<AppealsSubmit />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* ── Auth-gated: any signed-in donor ────────────────────────── */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
      <Route
        path="/my-giving"
        element={
          <ProtectedRoute>
            <MyGiving />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receipt/:receiptId"
        element={
          <ProtectedRoute>
            <ReceiptDetail />
          </ProtectedRoute>
        }
      />

      {/* ── Auth-gated: charity_admin, verifier, or platform_admin ──── */}
      <Route
        path="/verification"
        element={
          <RoleProtectedRoute allowedRoles={["charity_admin", "verifier", "platform_admin"]}>
            <Verification />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/verify/organization"
        element={
          <RoleProtectedRoute allowedRoles={["charity_admin", "verifier", "platform_admin"]}>
            <OrgVerificationForm />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/verify/campaign"
        element={
          <RoleProtectedRoute allowedRoles={["charity_admin", "verifier", "platform_admin"]}>
            <CampaignVerificationForm />
          </RoleProtectedRoute>
        }
      />

      {/* ── Auth-gated: verifier or platform_admin only ─────────────── */}
      <Route
        path="/verifier"
        element={
          <RoleProtectedRoute allowedRoles={["verifier", "platform_admin"]}>
            <VerifierDashboard />
          </RoleProtectedRoute>
        }
      />

      {/* ── Auth-gated: platform_admin only ─────────────────────────── */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={["platform_admin"]}>
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />

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
        {/* AuthProvider inside BrowserRouter so child components can use
            both useAuth() and React Router hooks in the same component. */}
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
