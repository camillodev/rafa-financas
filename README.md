
# Rafa Finanças - Sistema de Gestão Financeira Pessoal

![Rafa Finanças](public/og-image.png)

## 📋 Visão Geral

Rafa Finanças é uma aplicação web abrangente para gestão financeira pessoal desenvolvida com React, TypeScript e Tailwind CSS. A aplicação permite aos usuários gerenciar suas finanças, acompanhar despesas, criar orçamentos, estabelecer metas financeiras e visualizar relatórios detalhados.

## ✨ Funcionalidades

- **Dashboard Interativo**: Visão geral das finanças com gráficos e indicadores
- **Gerenciamento de Transações**: Registro e categorização de receitas e despesas
- **Orçamentos**: Criação e acompanhamento de orçamentos mensais e anuais
- **Contas a Pagar**: Controle de contas e pagamentos agendados
- **Metas Financeiras**: Definição e acompanhamento de metas de economia
- **Cartões de Crédito**: Gerenciamento de gastos com cartões
- **Instituições Financeiras**: Integração com diferentes bancos e instituições
- **Relatórios Personalizados**: Visualização de dados financeiros em diferentes formatos
- **Temas Claro/Escuro**: Personalização da interface para diferentes preferências

## 🛠️ Tecnologias

- [React](https://reactjs.org/) - Biblioteca JavaScript para construção de interfaces
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript tipado
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [shadcn/ui](https://ui.shadcn.com/) - Componentes reutilizáveis construídos com Radix UI e Tailwind
- [React Router](https://reactrouter.com/) - Roteamento para React
- [Recharts](https://recharts.org/) - Biblioteca de gráficos para React
- [date-fns](https://date-fns.org/) - Biblioteca JavaScript para manipulação de datas
- [Lucide React](https://lucide.dev/) - Conjunto de ícones para React

## 📦 Instalação e Uso

### Pré-requisitos
- Node.js (v16+)
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <URL_DO_REPOSITÓRIO>

# Entre no diretório do projeto
cd rafa-financas

# Instale as dependências
npm install
# ou
yarn

# Inicie o servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

O aplicativo será aberto no navegador em `http://localhost:5173` (ou a porta configurada pelo Vite).

## 📱 Responsividade

A aplicação foi desenvolvida seguindo os princípios de design responsivo, garantindo uma experiência consistente em:

- Desktops e laptops
- Tablets
- Dispositivos móveis

## 🗄️ Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── dashboard/      # Componentes específicos do dashboard
│   ├── layout/         # Componentes de layout (Sidebar, AppLayout)
│   └── ui/             # Componentes de UI (shadcn/ui)
├── context/            # Contextos React, incluindo FinanceContext
├── data/               # Dados mockados para desenvolvimento
├── hooks/              # Hooks personalizados
├── lib/                # Utilitários e helpers
├── pages/              # Componentes de página (rotas)
└── types/              # Definições de tipos TypeScript
```

## 🔍 Páginas Principais

- **Dashboard** (`/`): Visão geral das finanças
- **Transações** (`/transactions`): Gerenciamento de transações
- **Contas a Pagar** (`/bills`): Controle de contas e pagamentos
- **Orçamentos** (`/budgets`): Planejamento e acompanhamento orçamentário
- **Relatórios** (`/reports`): Relatórios e análises financeiras
- **Categorias** (`/categories`): Gestão de categorias e subcategorias
- **Instituições** (`/institutions`): Gerenciamento de instituições financeiras
- **Cartões** (`/cards`): Controle de cartões de crédito
- **Metas** (`/goals`): Definição e acompanhamento de metas financeiras
- **Configurações** (`/settings`): Configurações da aplicação

## 🌙 Tema Escuro

A aplicação suporta temas claro e escuro. O usuário pode alternar entre os temas através da página de configurações.

## 🚀 Próximos Passos

- Implementação de backend real
- Autenticação de usuários
- Sincronização com contas bancárias reais
- Aplicativo móvel correspondente
- Funcionalidades de exportação de dados

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## 📞 Contato

Para questões e suporte, entre em contato via [email@exemplo.com](mailto:email@exemplo.com).

## 🙏 Agradecimentos

- [shadcn/ui](https://ui.shadcn.com/) pelo conjunto de componentes
- [Lucide](https://lucide.dev/) pelos ícones
- Todos os contribuidores que ajudaram a tornar este projeto possível
