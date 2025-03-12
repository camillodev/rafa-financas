
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Target, 
  CreditCard,
  Settings,
  BarChart3,
  Landmark,
  List,
  FileBarChart,
  Receipt
} from 'lucide-react';

export const sidebarLinks = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    href: "/" 
  },
  { 
    icon: ArrowRightLeft, 
    label: "Transações", 
    href: "/transactions" 
  },
  { 
    icon: Receipt, 
    label: "Contas a Pagar", 
    href: "/bills" 
  },
  { 
    icon: BarChart3, 
    label: "Orçamentos", 
    href: "/budgets" 
  },
  { 
    icon: FileBarChart, 
    label: "Relatórios", 
    href: "/reports" 
  },
  { 
    icon: List, 
    label: "Categorias", 
    href: "/categories" 
  },
  { 
    icon: Landmark, 
    label: "Instituições", 
    href: "/institutions" 
  },
  { 
    icon: CreditCard, 
    label: "Cartões", 
    href: "/cards" 
  },
  { 
    icon: Target, 
    label: "Metas", 
    href: "/goals" 
  }
];

export const settingsLink = {
  icon: Settings,
  label: "Configurações",
  href: "/settings"
};
