
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
  Receipt,
  Split,
  Home,
  PieChart,
  Users,
  History
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
  },
  {
    icon: Split,
    label: "Dividir Contas",
    href: "/split-bills",
    submenu: [
      {
        icon: Home,
        label: "Início",
        href: "/split-bills"
      },
      {
        icon: Users,
        label: "Grupos",
        href: "/split-bills/groups"
      },
      {
        icon: PieChart,
        label: "Relatórios",
        href: "/split-bills/reports"
      },
      {
        icon: History,
        label: "Histórico",
        href: "/split-bills/history"
      }
    ]
  }
];

export const settingsLink = {
  icon: Settings,
  label: "Configurações",
  href: "/settings"
};
