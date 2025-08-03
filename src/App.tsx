import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NetworkStatusBanner from "./components/ui/network-status-banner";
import ErrorBoundary from "./components/ui/error-boundary";
import Index from "./pages/Index";
import Auth from "./pages/auth";
import Dashboard from "./pages/dashboard";
import Messages from "./pages/messages";
import Calendar from "./pages/calendar";
import Settings from "./pages/settings";
import NotFound from "./pages/NotFound";
import PairPage from "./pages/pair";
import Paywall from "./pages/paywall";
import { usePushNotifications } from "@/hooks/use-push-notifications";

const queryClient = new QueryClient();

const App = () => {
  usePushNotifications();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <NetworkStatusBanner />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/paywall" element={<Paywall />} />
              <Route path="/dashboard" element={
                <ProtectedRoute requiresPremium>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/pair/:code?" element={
                  <ProtectedRoute>
                    <PairPage />
                  </ProtectedRoute>
                } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
