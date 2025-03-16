
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

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/bills" element={
              <>
                <SignedIn>
                  <FinanceProvider>
                    <Bills />
                  </FinanceProvider>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } />
            <Route path="/budgets" element={
              <>
                <SignedIn>
                  <FinanceProvider>
                    <Budgets />
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
            <Route path="/cards" element={
              <>
                <SignedIn>
                  <FinanceProvider>
                    <Cards />
                  </FinanceProvider>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } />
            <Route path="/goals" element={
              <>
                <SignedIn>
                  <FinanceProvider>
                    <Goals />
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
                    <GoalDetail />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
