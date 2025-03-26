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

## 🚩 Feature Flags

O sistema de Feature Flags permite ativar ou desativar funcionalidades específicas da aplicação sem necessidade de modificar ou reimplantar o código. Isso é útil para testes A/B, lançamentos graduais, ou personalização da experiência do usuário.

### Como Funciona

- As feature flags são armazenadas no localStorage para persistência
- O controle de features é centralizado em um contexto React
- Usuários podem habilitar/desabilitar funcionalidades na página de configurações
- Os componentes da interface e rotas verificam as flags para determinar o comportamento

### Feature Flags Atuais

- `bills` - Contas a Pagar
- `budgets` - Orçamentos
- `reports` - Relatórios
- `cards` - Cartões
- `goals` - Metas
- `splitBills` - Dividir Contas

### Adicionando Novas Feature Flags

1. **Adicione a chave da feature no tipo `FeatureKey`**:

```typescript
// src/context/FeatureFlagsContext.tsx
export type FeatureKey =
  | 'bills'
  | 'budgets' 
  | 'reports'
  | 'cards'
  | 'goals'
  | 'splitBills'
  | 'novaFeature'; // Adicione sua nova feature aqui
```

2. **Adicione o valor padrão (habilitado ou desabilitado)**:

```typescript
// src/context/FeatureFlagsContext.tsx
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  bills: true,
  budgets: true,
  reports: true,
  cards: true,
  goals: true,
  splitBills: true,
  novaFeature: false, // Adicione com o valor padrão desejado
};
```

3. **Adicione na página de configurações**:

```typescript
// src/pages/Settings.tsx
const featureDetails = {
  // Features existentes...
  novaFeature: {
    label: "Nova Funcionalidade",
    description: "Descrição da nova funcionalidade",
    icon: <MinhaIcon className="h-4 w-4 mr-2" />
  },
};
```

### Proteção de Rotas com Feature Flags

Para proteger uma rota com feature flag, utilize o componente `FeatureRoute`:

```jsx
<Route path="/minha-nova-rota" element={
  <>
    <SignedIn>
      <FinanceProvider>
        <FeatureRoute featureKey="novaFeature" element={<MinhaNovaPage />} />
      </FinanceProvider>
    </SignedIn>
    <SignedOut>
      <Navigate to="/sign-in" replace />
    </SignedOut>
  </>
} />
```

### Adicionando ao Menu de Navegação

Para adicionar uma nova funcionalidade ao menu lateral, atualize o arquivo `sidebarConfig.tsx`:

```typescript
// src/components/layout/sidebar/sidebarConfig.tsx
export const sidebarLinks = [
  // Outros links...
  { 
    icon: <MinhaIcon size={20} />, 
    label: "Nova Funcionalidade", 
    href: "/minha-nova-rota",
    featureFlag: 'novaFeature' as FeatureKey
  },
];
```

### Verificando Feature Flags em Componentes

Para verificar se uma feature está habilitada dentro de qualquer componente:

```typescript
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

function MeuComponente() {
  const { isFeatureEnabled } = useFeatureFlags();
  
  if (isFeatureEnabled('novaFeature')) {
    return <p>Funcionalidade disponível!</p>;
  }
  
  return <p>Funcionalidade não disponível.</p>;
}
```

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
