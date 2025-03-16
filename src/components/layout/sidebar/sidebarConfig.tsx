
import React from 'react';
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
    icon: <LayoutDashboard size={20} />, 
    label: "Dashboard", 
    href: "/" 
  },
  { 
    icon: <ArrowRightLeft size={20} />, 
    label: "Transações", 
    href: "/transactions" 
  },
  { 
    icon: <Receipt size={20} />, 
    label: "Contas a Pagar", 
    href: "/bills" 
  },
  { 
    icon: <BarChart3 size={20} />, 
    label: "Orçamentos", 
    href: "/budgets" 
  },
  { 
    icon: <FileBarChart size={20} />, 
    label: "Relatórios", 
    href: "/reports" 
  },
  { 
    icon: <List size={20} />, 
    label: "Categorias", 
    href: "/categories" 
  },
  { 
    icon: <Landmark size={20} />, 
    label: "Instituições", 
    href: "/institutions" 
  },
  { 
    icon: <CreditCard size={20} />, 
    label: "Cartões", 
    href: "/cards" 
  },
  { 
    icon: <Target size={20} />, 
    label: "Metas", 
    href: "/goals" 
  },
  {
    icon: <Split size={20} />,
    label: "Dividir Contas",
    href: "/split-bills",
    submenu: [
      {
        icon: <Home size={20} />,
        label: "Início",
        href: "/split-bills"
      },
      {
        icon: <Users size={20} />,
        label: "Grupos",
        href: "/split-bills/groups"
      },
      {
        icon: <PieChart size={20} />,
        label: "Relatórios",
        href: "/split-bills/reports"
      },
      {
        icon: <History size={20} />,
        label: "Histórico",
        href: "/split-bills/history"
      }
    ]
  }
];

export const settingsLink = {
  icon: <Settings size={20} />,
  label: "Configurações",
  href: "/settings"
};
