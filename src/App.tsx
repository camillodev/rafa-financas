
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
            <Route path="/" element={
              <FinanceProvider>
                <Index />
              </FinanceProvider>
            } />
            <Route path="/transactions" element={
              <FinanceProvider>
                <Transactions />
              </FinanceProvider>
            } />
            <Route path="/bills" element={
              <FinanceProvider>
                <Bills />
              </FinanceProvider>
            } />
            <Route path="/budgets" element={
              <FinanceProvider>
                <Budgets />
              </FinanceProvider>
            } />
            <Route path="/reports" element={
              <FinanceProvider>
                <Reports />
              </FinanceProvider>
            } />
            <Route path="/categories" element={
              <FinanceProvider>
                <Categories />
              </FinanceProvider>
            } />
            <Route path="/institutions" element={
              <FinanceProvider>
                <Institutions />
              </FinanceProvider>
            } />
            <Route path="/cards" element={
              <FinanceProvider>
                <Cards />
              </FinanceProvider>
            } />
            <Route path="/goals" element={
              <FinanceProvider>
                <Goals />
              </FinanceProvider>
            } />
            <Route path="/goals/:id" element={
              <FinanceProvider>
                <GoalDetail />
              </FinanceProvider>
            } />
            <Route path="/settings" element={
              <FinanceProvider>
                <Settings />
              </FinanceProvider>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
