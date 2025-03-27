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

## 🚩 Feature Flags (Bandeiras de Funcionalidades)

O sistema utiliza feature flags baseadas em ambiente (environment-based feature flags) para controlar quais funcionalidades estão disponíveis em diferentes ambientes de implantação (desenvolvimento, homologação, produção). Isso permite:

- Desativar funcionalidades específicas em produção enquanto estão em desenvolvimento
- Implementar lançamentos graduais de novas funcionalidades
- Testar diferentes configurações sem alterar o código

### Feature Flags Disponíveis

- `VITE_FEATURE_BILLS` - Contas a Pagar
- `VITE_FEATURE_BUDGETS` - Orçamentos
- `VITE_FEATURE_CARDS` - Cartões
- `VITE_FEATURE_GOALS` - Metas
- `VITE_FEATURE_SPLITBILLS` - Dividir Contas

> **Nota**: A funcionalidade de Relatórios está sempre disponível, mas certos relatórios específicos dependem de outras feature flags:
> - "Planejado vs Realizado" só estará disponível se `VITE_FEATURE_BUDGETS` estiver ativado
> - "Despesas por Cartão" só estará disponível se `VITE_FEATURE_CARDS` estiver ativado

### Configuração de Feature Flags

As feature flags são configuradas através de variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto (baseado no `.env.example`) e defina os valores:

```
# Feature Flags (true para ativar, false para desativar)
VITE_FEATURE_BILLS=true
VITE_FEATURE_BUDGETS=true
VITE_FEATURE_REPORTS=true
VITE_FEATURE_CARDS=true
VITE_FEATURE_GOALS=true
VITE_FEATURE_SPLITBILLS=true
```

### Como Adicionar Novas Feature Flags

1. **Adicione a nova variável de ambiente**:
   - Adicione a variável ao arquivo `.env.example`
   - Adicione a mesma variável ao seu arquivo `.env` local

2. **Atualize o tipo FeatureKey**:
   ```typescript
   // src/context/FeatureFlagsContext.tsx
   export type FeatureKey = 
     | 'bills' 
     | 'budgets' 
     // ... outras flags existentes
     | 'novaFeature'; // Adicione sua nova feature aqui
   ```

3. **Adicione ao método getDefaultFeatureFlags**:
   ```typescript
   // src/context/FeatureFlagsContext.tsx
   const getDefaultFeatureFlags = (): FeatureFlags => ({
     bills: getEnvFlag('bills', true),
     // ... outras flags existentes
     novaFeature: getEnvFlag('novaFeature', false), // Padrão desativado
   });
   ```

4. **Proteja as rotas ou componentes com a nova feature flag**:
   ```tsx
   import { useFeatureFlags } from '@/context/FeatureFlagsContext';
   
   function MinhaFuncionalidade() {
     const { isFeatureEnabled } = useFeatureFlags();
     
     if (!isFeatureEnabled('novaFeature')) {
       return null; // Ou algum fallback
     }
     
     return <MeuComponente />;
   }
   ```

### Modo de Desenvolvimento

No ambiente de desenvolvimento, você pode:
- Ver o painel de Feature Flags na página de Configurações
- Ativar/desativar features localmente para teste (estas mudanças são armazenadas no localStorage)
- Verificar o comportamento da aplicação com diferentes configurações de features

**Nota**: Em ambientes de produção, as feature flags são controladas exclusivamente por variáveis de ambiente, e a interface de controle não é exibida.

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
