import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";
import { AppProvider } from "@/components/providers/AppProvider";
import { ThemeProvider } from "@/hooks/use-theme";
import { FeatureFlagsProvider, useFeatureFlags } from "@/context/FeatureFlagsContext";

// Import pages
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Categories from "./pages/Categories";
import Institutions from "./pages/Institutions";
import Cards from "./pages/Cards";
import Goals from "./pages/Goals";
import GoalDetail from "./pages/GoalDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Bills from "./pages/Bills";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

// Split Bills pages
import SplitBillsHome from "./pages/split-bills/SplitBillsHome";
import SplitBillsGroups from "./pages/split-bills/SplitBillsGroups";
import SplitBillsReports from "./pages/split-bills/SplitBillsReports";
import SplitBillsHistory from "./pages/split-bills/SplitBillsHistory";
import SplitBillDetail from "./pages/split-bills/SplitBillDetail";
import SplitBillGroupDetail from "./pages/split-bills/SplitBillGroupDetail";

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Feature-gated route component
const FeatureRoute = ({ featureKey, element }: { featureKey?: string, element: React.ReactNode }) => {
  const { isFeatureEnabled } = useFeatureFlags();

  // If no feature key is provided or the feature is enabled, render the element
  if (!featureKey || isFeatureEnabled(featureKey as any)) {
    return <>{element}</>;
  }

  // Otherwise, navigate to home (or show not found)
  return <Navigate to="/" replace />;
};

// Protected route component
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => (
  <>
    <SignedIn>
      <AppProvider>{element}</AppProvider>
    </SignedIn>
    <SignedOut>
      <Navigate to="/sign-in" replace />
    </SignedOut>
  </>
);

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <FeatureFlagsProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute element={<Index />} />} />
              <Route path="/transactions" element={<ProtectedRoute element={<Transactions />} />} />
              
              {/* Bills - Feature Flagged */}
              <Route path="/bills" element={
                <ProtectedRoute element={<FeatureRoute featureKey="bills" element={<Bills />} />} />
              } />
              
              {/* Budgets - Feature Flagged */}
              <Route path="/budgets" element={
                <ProtectedRoute element={<FeatureRoute featureKey="budgets" element={<Budgets />} />} />
              } />
              
              {/* Reports */}
              <Route path="/reports" element={<ProtectedRoute element={<Reports />} />} />
              <Route path="/categories" element={<ProtectedRoute element={<Categories />} />} />
              <Route path="/institutions" element={<ProtectedRoute element={<Institutions />} />} />
              
              {/* Cards - Feature Flagged */}
              <Route path="/cards" element={
                <ProtectedRoute element={<FeatureRoute featureKey="cards" element={<Cards />} />} />
              } />
              
              {/* Goals - Feature Flagged */}
              <Route path="/goals" element={
                <ProtectedRoute element={<FeatureRoute featureKey="goals" element={<Goals />} />} />
              } />
              <Route path="/goals/:id" element={
                <ProtectedRoute element={<FeatureRoute featureKey="goals" element={<GoalDetail />} />} />
              } />
              
              {/* Settings */}
              <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />

              {/* Split Bills Routes - Feature Flagged */}
              <Route path="/split-bills" element={
                <ProtectedRoute element={<FeatureRoute featureKey="splitBills" element={<SplitBillsHome />} />} />
              } />
              <Route path="/split-bills/groups" element={
                <ProtectedRoute element={<FeatureRoute featureKey="splitBills" element={<SplitBillsGroups />} />} />
              } />
              <Route path="/split-bills/groups/:id" element={
                <ProtectedRoute element={<FeatureRoute featureKey="splitBills" element={<SplitBillGroupDetail />} />} />
              } />
              <Route path="/split-bills/reports" element={
                <ProtectedRoute element={<FeatureRoute featureKey="splitBills" element={<SplitBillsReports />} />} />
              } />
              <Route path="/split-bills/history" element={
                <ProtectedRoute element={<FeatureRoute featureKey="splitBills" element={<SplitBillsHistory />} />} />
              } />
              <Route path="/split-bills/:id" element={
                <ProtectedRoute element={<FeatureRoute featureKey="splitBills" element={<SplitBillDetail />} />} />
              } />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </FeatureFlagsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
