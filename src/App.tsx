import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Diary from "./pages/Diary";
import Travel from "./pages/Travel";
import Tasks from "./pages/Tasks";
import QnA from "./pages/QnA";
import Messages from "./pages/Messages";
import Navigation from "./components/Navigation";
import Auth from "./pages/Auth";
import Games from "./pages/Games";
import TruthDare from "./pages/TruthDare";
import AnonymousQuestions from "./pages/AnonymousQuestions";
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
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/diary" element={<Diary />} />
              <Route path="/travel" element={<Travel />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/qna" element={<QnA />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/truth-dare" element={<TruthDare />} />
              <Route path="/games/anonymous-questions" element={<AnonymousQuestions />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
