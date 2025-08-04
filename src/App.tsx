import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NetworkStatusBanner from "./components/ui/network-status-banner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import Index from "./pages/Index";
import Auth from "./pages/auth";
import Dashboard from "./pages/dashboard";
import Messages from "./pages/messages";
import Calendar from "./pages/calendar";
import History from "./pages/history";
import Insights from "./pages/insights";
import Settings from "./pages/settings";
import FAQ from "./pages/faq";
import Contact from "./pages/contact";
import PairPage from "./pages/pair";
import Paywall from "./pages/paywall";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

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
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Index">
                <Stack.Screen name="Index" component={Index} />
                <Stack.Screen name="Auth" component={Auth} />
                <Stack.Screen name="Paywall" component={Paywall} />
                <Stack.Screen name="Dashboard">
                  {() => (
                    <ProtectedRoute requiresPremium>
                      <Dashboard />
                    </ProtectedRoute>
                  )}
                </Stack.Screen>
                <Stack.Screen name="Messages">
                  {() => (
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  )}
                </Stack.Screen>
                <Stack.Screen name="Calendar">
                  {() => (
                    <ProtectedRoute>
                      <Calendar />
                    </ProtectedRoute>
                  )}
                </Stack.Screen>
                <Stack.Screen name="History">
                  {() => (
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  )}
                </Stack.Screen>
                <Stack.Screen name="Insights">
                  {() => (
                    <ProtectedRoute>
                      <Insights />
                    </ProtectedRoute>
                  )}
                </Stack.Screen>
                <Stack.Screen name="Settings">
                  {() => (
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  )}
                </Stack.Screen>
                <Stack.Screen name="FAQ">
                  {() => (
                    <ProtectedRoute>
                      <FAQ />
                    </ProtectedRoute>
                  )}
                </Stack.Screen>
                <Stack.Screen name="Contact">
                  {() => (
                    <ProtectedRoute>
                      <Contact />
                    </ProtectedRoute>
                  )}
                </Stack.Screen>
                <Stack.Screen name="Pair">
                  {() => (
                    <ProtectedRoute>
                      <PairPage />
                    </ProtectedRoute>
                  )}
                </Stack.Screen>
                <Stack.Screen name="NotFound" component={NotFound} />
              </Stack.Navigator>
            </NavigationContainer>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

