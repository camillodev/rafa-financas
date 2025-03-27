import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import GoalDetail from "./pages/GoalDetail";
import Cards from "./pages/Cards";
import Institutions from "./pages/Institutions";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Bills from "./pages/Bills";
import SplitBillsHome from "./pages/split-bills/SplitBillsHome";
import SplitBillsGroups from "./pages/split-bills/SplitBillsGroups";
import SplitBillGroupDetail from "./pages/split-bills/SplitBillGroupDetail";
import SplitBillDetail from "./pages/split-bills/SplitBillDetail";
import SplitBillsHistory from "./pages/split-bills/SplitBillsHistory";
import SplitBillsReports from "./pages/split-bills/SplitBillsReports";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { AppProvider } from "./components/providers/AppProvider";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <Routes>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/" element={<Index />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="goals" element={<Goals />} />
            <Route path="goals/:id" element={<GoalDetail />} />
            <Route path="cards" element={<Cards />} />
            <Route path="institutions" element={<Institutions />} />
            <Route path="categories" element={<Categories />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="bills" element={<Bills />} />
            <Route path="split-bills">
              <Route index element={<SplitBillsHome />} />
              <Route path="groups" element={<SplitBillsGroups />} />
              <Route path="groups/:id" element={<SplitBillGroupDetail />} />
              <Route path="bills/:id" element={<SplitBillDetail />} />
              <Route path="history" element={<SplitBillsHistory />} />
              <Route path="reports" element={<SplitBillsReports />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
