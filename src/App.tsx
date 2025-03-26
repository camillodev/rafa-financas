import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";
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
import { FinanceProvider } from "@/context/FinanceContext";
import { ThemeProvider } from "@/hooks/use-theme";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { FeatureFlagsProvider, useFeatureFlags } from "@/context/FeatureFlagsContext";

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
const FeatureRoute = ({ featureKey, element }) => {
  const { isFeatureEnabled } = useFeatureFlags();

  // If no feature key is provided or the feature is enabled, render the element
  if (!featureKey || isFeatureEnabled(featureKey)) {
    return element;
  }

  // Otherwise, navigate to home (or show not found)
  return <Navigate to="/" replace />;
};

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <FeatureFlagsProvider>
            <Routes>
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />

              {/* Protected routes */}
              <Route path="/" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <Index />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              <Route path="/transactions" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <Transactions />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              {/* Bills - Feature Flagged */}
              <Route path="/bills" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <FeatureRoute featureKey="bills" element={<Bills />} />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              {/* Budgets - Feature Flagged */}
              <Route path="/budgets" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <FeatureRoute featureKey="budgets" element={<Budgets />} />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              <Route path="/reports" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <Reports />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              <Route path="/categories" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <Categories />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              <Route path="/institutions" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <Institutions />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              {/* Cards - Feature Flagged */}
              <Route path="/cards" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <FeatureRoute featureKey="cards" element={<Cards />} />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              {/* Goals - Feature Flagged */}
              <Route path="/goals" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <FeatureRoute featureKey="goals" element={<Goals />} />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              <Route path="/goals/:id" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <FeatureRoute featureKey="goals" element={<GoalDetail />} />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              <Route path="/settings" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <Settings />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />

              {/* Split Bills Routes - Feature Flagged */}
              <Route path="/split-bills" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <FeatureRoute featureKey="splitBills" element={<SplitBillsHome />} />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              <Route path="/split-bills/groups" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <FeatureRoute featureKey="splitBills" element={<SplitBillsGroups />} />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              <Route path="/split-bills/groups/:id" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <FeatureRoute featureKey="splitBills" element={<SplitBillGroupDetail />} />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              <Route path="/split-bills/reports" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <FeatureRoute featureKey="splitBills" element={<SplitBillsReports />} />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              <Route path="/split-bills/history" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <FeatureRoute featureKey="splitBills" element={<SplitBillsHistory />} />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } />
              <Route path="/split-bills/:id" element={
                <>
                  <SignedIn>
                    <FinanceProvider>
                      <FeatureRoute featureKey="splitBills" element={<SplitBillDetail />} />
                    </FinanceProvider>
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
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
