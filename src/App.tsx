import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel";
import PublicProfile from "./pages/PublicProfile";
import PublicTruthDare from "./pages/PublicTruthDare";
import PublicAnonymous from "./pages/PublicAnonymous";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-warm">
            <Routes>
              {/* Home - shows list of profiles or redirects */}
              <Route path="/" element={<Home />} />
              
              {/* Public profile routes - no auth needed */}
              <Route path="/u/:username" element={<PublicProfile />} />
              <Route path="/u/:username/games/truth-dare" element={<PublicTruthDare />} />
              <Route path="/u/:username/games/anonymous" element={<PublicAnonymous />} />
              
              {/* Auth */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Admin panel - protected */}
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminPanel />
                  </ProtectedAdminRoute>
                }
              />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;