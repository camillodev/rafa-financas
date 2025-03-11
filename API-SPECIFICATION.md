
# Rafa Finanças - Especificação de API Backend

Este documento descreve a especificação para o desenvolvimento da API backend necessária para suportar a aplicação Rafa Finanças. Ele define os endpoints, estruturas de dados, parâmetros de requisição e respostas esperadas.

## 🏗️ Arquitetura

A API deve ser implementada seguindo os princípios REST, utilizando JSON para troca de dados e autenticação via JWT (JSON Web Tokens).

## 🔐 Autenticação

### Endpoints de Autenticação

#### POST /api/auth/register
- **Objetivo**: Registrar um novo usuário
- **Payload**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "token": "string"
  }
  ```

#### POST /api/auth/login
- **Objetivo**: Autenticar um usuário existente
- **Payload**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "token": "string"
  }
  ```

#### GET /api/auth/me
- **Objetivo**: Obter dados do usuário atual
- **Headers**: Authorization: Bearer {token}
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "createdAt": "string (ISO date)"
  }
  ```

#### POST /api/auth/logout
- **Objetivo**: Encerrar a sessão do usuário
- **Headers**: Authorization: Bearer {token}
- **Resposta (200 OK)**:
  ```json
  {
    "message": "Logout successful"
  }
  ```

## 📊 Módulos e Rotas

### Transações

#### GET /api/transactions
- **Objetivo**: Listar transações com filtros opcionais
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `startDate`: Data inicial (YYYY-MM-DD)
  - `endDate`: Data final (YYYY-MM-DD)
  - `type`: Tipo de transação (income, expense, all)
  - `category`: ID da categoria
  - `subcategory`: ID da subcategoria
  - `institution`: ID da instituição financeira
  - `card`: ID do cartão de crédito
  - `status`: Status da transação (completed, pending, all)
  - `page`: Número da página para paginação
  - `limit`: Quantidade de itens por página
- **Resposta (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "string",
        "description": "string",
        "amount": "number",
        "date": "string (ISO date)",
        "dueDate": "string (ISO date)",
        "type": "string (income, expense)",
        "category": "string",
        "subcategory": "string",
        "institution": "string",
        "card": "string",
        "status": "string",
        "notes": "string",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "totalPages": "number"
    }
  }
  ```

#### POST /api/transactions
- **Objetivo**: Criar uma nova transação
- **Headers**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "description": "string",
    "amount": "number",
    "date": "string (ISO date)",
    "dueDate": "string (ISO date)",
    "type": "string (income, expense)",
    "category": "string",
    "subcategory": "string",
    "institution": "string",
    "card": "string",
    "status": "string",
    "notes": "string"
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "id": "string",
    "description": "string",
    "amount": "number",
    "date": "string (ISO date)",
    "dueDate": "string (ISO date)",
    "type": "string (income, expense)",
    "category": "string",
    "subcategory": "string",
    "institution": "string",
    "card": "string",
    "status": "string",
    "notes": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
  ```

#### GET /api/transactions/:id
- **Objetivo**: Obter detalhes de uma transação específica
- **Headers**: Authorization: Bearer {token}
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "description": "string",
    "amount": "number",
    "date": "string (ISO date)",
    "dueDate": "string (ISO date)",
    "type": "string (income, expense)",
    "category": "string",
    "subcategory": "string",
    "institution": "string",
    "card": "string",
    "status": "string",
    "notes": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
  ```

#### PUT /api/transactions/:id
- **Objetivo**: Atualizar uma transação existente
- **Headers**: Authorization: Bearer {token}
- **Payload**: (Mesmos campos do POST, todos opcionais)
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "description": "string",
    "amount": "number",
    "date": "string (ISO date)",
    "dueDate": "string (ISO date)",
    "type": "string (income, expense)",
    "category": "string",
    "subcategory": "string",
    "institution": "string",
    "card": "string",
    "status": "string",
    "notes": "string",
    "updatedAt": "string (ISO date)"
  }
  ```

#### DELETE /api/transactions/:id
- **Objetivo**: Excluir uma transação
- **Headers**: Authorization: Bearer {token}
- **Resposta (204 No Content)**

### Categorias

#### GET /api/categories
- **Objetivo**: Listar categorias
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `type`: Tipo da categoria (income, expense, all)
  - `active`: Status ativo (true, false, all)
- **Resposta (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "string",
        "name": "string",
        "type": "string (income, expense)",
        "color": "string (hex color)",
        "icon": "string",
        "active": "boolean",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ]
  }
  ```

#### POST /api/categories
- **Objetivo**: Criar uma nova categoria
- **Headers**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "name": "string",
    "type": "string (income, expense)",
    "color": "string (hex color)",
    "icon": "string",
    "active": "boolean"
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string (income, expense)",
    "color": "string (hex color)",
    "icon": "string",
    "active": "boolean",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
  ```

#### PUT /api/categories/:id
- **Objetivo**: Atualizar uma categoria existente
- **Headers**: Authorization: Bearer {token}
- **Payload**: (Mesmos campos do POST, todos opcionais)
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string (income, expense)",
    "color": "string (hex color)",
    "icon": "string",
    "active": "boolean",
    "updatedAt": "string (ISO date)"
  }
  ```

#### DELETE /api/categories/:id
- **Objetivo**: Excluir uma categoria
- **Headers**: Authorization: Bearer {token}
- **Resposta (204 No Content)**

### Subcategorias

#### GET /api/subcategories
- **Objetivo**: Listar subcategorias
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `category`: ID da categoria pai
  - `active`: Status ativo (true, false, all)
- **Resposta (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "string",
        "name": "string",
        "categoryId": "string",
        "active": "boolean",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ]
  }
  ```

#### POST /api/subcategories
- **Objetivo**: Criar uma nova subcategoria
- **Headers**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "name": "string",
    "categoryId": "string",
    "active": "boolean"
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "categoryId": "string",
    "active": "boolean",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
  ```

#### PUT /api/subcategories/:id
- **Objetivo**: Atualizar uma subcategoria existente
- **Headers**: Authorization: Bearer {token}
- **Payload**: (Mesmos campos do POST, todos opcionais)
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "categoryId": "string",
    "active": "boolean",
    "updatedAt": "string (ISO date)"
  }
  ```

#### DELETE /api/subcategories/:id
- **Objetivo**: Excluir uma subcategoria
- **Headers**: Authorization: Bearer {token}
- **Resposta (204 No Content)**

### Orçamentos

#### GET /api/budgets
- **Objetivo**: Listar orçamentos
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `year`: Ano (YYYY)
  - `month`: Mês (1-12)
- **Resposta (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "string",
        "category": "string",
        "amount": "number",
        "year": "number",
        "month": "number",
        "spent": "number",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ]
  }
  ```

#### POST /api/budgets
- **Objetivo**: Criar um novo orçamento
- **Headers**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "category": "string",
    "amount": "number",
    "year": "number",
    "month": "number"
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "id": "string",
    "category": "string",
    "amount": "number",
    "year": "number",
    "month": "number",
    "spent": 0,
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
  ```

#### PUT /api/budgets/:id
- **Objetivo**: Atualizar um orçamento existente
- **Headers**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "amount": "number"
  }
  ```
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "category": "string",
    "amount": "number",
    "year": "number",
    "month": "number",
    "spent": "number",
    "updatedAt": "string (ISO date)"
  }
  ```

#### DELETE /api/budgets/:id
- **Objetivo**: Excluir um orçamento
- **Headers**: Authorization: Bearer {token}
- **Resposta (204 No Content)**

### Instituições Financeiras

#### GET /api/institutions
- **Objetivo**: Listar instituições financeiras
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `archived`: Status arquivado (true, false, all)
- **Resposta (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "string",
        "name": "string",
        "type": "string",
        "icon": "string",
        "color": "string (hex color)",
        "balance": "number",
        "archived": "boolean",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ]
  }
  ```

#### POST /api/institutions
- **Objetivo**: Criar uma nova instituição financeira
- **Headers**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "name": "string",
    "type": "string",
    "icon": "string",
    "color": "string (hex color)",
    "balance": "number"
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string",
    "icon": "string",
    "color": "string (hex color)",
    "balance": "number",
    "archived": false,
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
  ```

#### PUT /api/institutions/:id
- **Objetivo**: Atualizar uma instituição financeira existente
- **Headers**: Authorization: Bearer {token}
- **Payload**: (Mesmos campos do POST, todos opcionais)
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string",
    "icon": "string",
    "color": "string (hex color)",
    "balance": "number",
    "archived": "boolean",
    "updatedAt": "string (ISO date)"
  }
  ```

#### PATCH /api/institutions/:id/archive
- **Objetivo**: Arquivar/desarquivar uma instituição financeira
- **Headers**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "archived": "boolean"
  }
  ```
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "archived": "boolean",
    "updatedAt": "string (ISO date)"
  }
  ```

#### DELETE /api/institutions/:id
- **Objetivo**: Excluir uma instituição financeira
- **Headers**: Authorization: Bearer {token}
- **Resposta (204 No Content)**

### Cartões de Crédito

#### GET /api/cards
- **Objetivo**: Listar cartões de crédito
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `archived`: Status arquivado (true, false, all)
- **Resposta (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "string",
        "name": "string",
        "brand": "string",
        "last4": "string",
        "limit": "number",
        "dueDay": "number",
        "closingDay": "number",
        "color": "string (hex color)",
        "institutionId": "string",
        "archived": "boolean",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ]
  }
  ```

#### POST /api/cards
- **Objetivo**: Criar um novo cartão de crédito
- **Headers**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "name": "string",
    "brand": "string",
    "last4": "string",
    "limit": "number",
    "dueDay": "number",
    "closingDay": "number",
    "color": "string (hex color)",
    "institutionId": "string"
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "brand": "string",
    "last4": "string",
    "limit": "number",
    "dueDay": "number",
    "closingDay": "number",
    "color": "string (hex color)",
    "institutionId": "string",
    "archived": false,
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
  ```

#### PUT /api/cards/:id
- **Objetivo**: Atualizar um cartão de crédito existente
- **Headers**: Authorization: Bearer {token}
- **Payload**: (Mesmos campos do POST, todos opcionais)
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "brand": "string",
    "last4": "string",
    "limit": "number",
    "dueDay": "number",
    "closingDay": "number",
    "color": "string (hex color)",
    "institutionId": "string",
    "archived": "boolean",
    "updatedAt": "string (ISO date)"
  }
  ```

#### PATCH /api/cards/:id/archive
- **Objetivo**: Arquivar/desarquivar um cartão de crédito
- **Headers**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "archived": "boolean"
  }
  ```
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "archived": "boolean",
    "updatedAt": "string (ISO date)"
  }
  ```

#### DELETE /api/cards/:id
- **Objetivo**: Excluir um cartão de crédito
- **Headers**: Authorization: Bearer {token}
- **Resposta (204 No Content)**

### Metas Financeiras

#### GET /api/goals
- **Objetivo**: Listar metas financeiras
- **Headers**: Authorization: Bearer {token}
- **Resposta (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "string",
        "name": "string",
        "targetAmount": "number",
        "currentAmount": "number",
        "targetDate": "string (ISO date)",
        "category": "string",
        "icon": "string",
        "color": "string (hex color)",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ]
  }
  ```

#### POST /api/goals
- **Objetivo**: Criar uma nova meta financeira
- **Headers**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "name": "string",
    "targetAmount": "number",
    "currentAmount": "number",
    "targetDate": "string (ISO date)",
    "category": "string",
    "icon": "string",
    "color": "string (hex color)"
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "targetAmount": "number",
    "currentAmount": "number",
    "targetDate": "string (ISO date)",
    "category": "string",
    "icon": "string",
    "color": "string (hex color)",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
  ```

#### GET /api/goals/:id
- **Objetivo**: Obter detalhes de uma meta específica
- **Headers**: Authorization: Bearer {token}
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "targetAmount": "number",
    "currentAmount": "number",
    "targetDate": "string (ISO date)",
    "category": "string",
    "icon": "string",
    "color": "string (hex color)",
    "transactions": [
      {
        "id": "string",
        "date": "string (ISO date)",
        "amount": "number",
        "type": "string (add, remove)",
        "description": "string"
      }
    ],
    "modifications": [
      {
        "id": "string",
        "date": "string (ISO date)",
        "type": "string (contribution, withdrawal, target_change, date_change, description_change)",
        "description": "string",
        "amount": "number",
        "previousValue": "any",
        "newValue": "any"
      }
    ],
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
  ```

#### PUT /api/goals/:id
- **Objetivo**: Atualizar uma meta financeira existente
- **Headers**: Authorization: Bearer {token}
- **Payload**: (Mesmos campos do POST, todos opcionais)
- **Resposta (200 OK)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "targetAmount": "number",
    "currentAmount": "number",
    "targetDate": "string (ISO date)",
    "category": "string",
    "icon": "string",
    "color": "string (hex color)",
    "updatedAt": "string (ISO date)"
  }
  ```

#### POST /api/goals/:id/transactions
- **Objetivo**: Adicionar uma transação a uma meta
- **Headers**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "date": "string (ISO date)",
    "amount": "number",
    "type": "string (add, remove)",
    "description": "string"
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "id": "string",
    "goalId": "string",
    "date": "string (ISO date)",
    "amount": "number",
    "type": "string (add, remove)",
    "description": "string",
    "createdAt": "string (ISO date)"
  }
  ```

#### DELETE /api/goals/:goalId/transactions/:transactionId
- **Objetivo**: Excluir uma transação de uma meta
- **Headers**: Authorization: Bearer {token}
- **Resposta (204 No Content)**

#### DELETE /api/goals/:id
- **Objetivo**: Excluir uma meta financeira
- **Headers**: Authorization: Bearer {token}
- **Resposta (204 No Content)**

### Relatórios

#### GET /api/reports/summary
- **Objetivo**: Obter resumo financeiro
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `startDate`: Data inicial (YYYY-MM-DD)
  - `endDate`: Data final (YYYY-MM-DD)
- **Resposta (200 OK)**:
  ```json
  {
    "netBalance": "number",
    "totalIncome": "number",
    "totalExpenses": "number",
    "savingsRate": "number"
  }
  ```

#### GET /api/reports/budget-vs-actual
- **Objetivo**: Relatório comparativo de orçamento planejado versus realizado
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `year`: Ano (YYYY)
  - `month`: Mês (1-12)
- **Resposta (200 OK)**:
  ```json
  {
    "data": [
      {
        "category": "string",
        "budgeted": "number",
        "actual": "number",
        "difference": "number",
        "percentageUsed": "number"
      }
    ],
    "totals": {
      "budgeted": "number",
      "actual": "number",
      "difference": "number",
      "percentageUsed": "number"
    }
  }
  ```

#### GET /api/reports/expense-by-category
- **Objetivo**: Relatório de despesas por categoria
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `startDate`: Data inicial (YYYY-MM-DD)
  - `endDate`: Data final (YYYY-MM-DD)
- **Resposta (200 OK)**:
  ```json
  {
    "data": [
      {
        "category": "string",
        "amount": "number",
        "percentage": "number",
        "color": "string (hex color)"
      }
    ],
    "total": "number"
  }
  ```

#### GET /api/reports/monthly-trend
- **Objetivo**: Tendência mensal de receitas e despesas
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `year`: Ano (YYYY)
- **Resposta (200 OK)**:
  ```json
  {
    "data": [
      {
        "month": "string",
        "income": "number",
        "expenses": "number",
        "savings": "number"
      }
    ]
  }
  ```

#### GET /api/reports/credit-card
- **Objetivo**: Relatório de gastos com cartão de crédito
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `cardId`: ID do cartão (opcional)
  - `year`: Ano (YYYY)
  - `month`: Mês (1-12)
- **Resposta (200 OK)**:
  ```json
  {
    "total": "number",
    "limit": "number",
    "percentageUsed": "number",
    "byCategory": [
      {
        "category": "string",
        "amount": "number",
        "percentage": "number"
      }
    ],
    "byDay": [
      {
        "day": "number",
        "amount": "number"
      }
    ]
  }
  ```

## 📚 Modelos de Dados (Schemas)

### User
- id (string, uuid): Identificador único do usuário
- name (string): Nome completo
- email (string): Email (único)
- password (string): Senha (hash)
- createdAt (date): Data de criação
- updatedAt (date): Data de atualização

### Transaction
- id (string, uuid): Identificador único da transação
- userId (string, uuid): Referência ao usuário
- description (string): Descrição da transação
- amount (number): Valor
- date (date): Data da transação
- dueDate (date, opcional): Data de vencimento (para contas a pagar)
- type (string): Tipo (income, expense)
- categoryId (string, uuid): Referência à categoria
- subcategoryId (string, uuid, opcional): Referência à subcategoria
- institutionId (string, uuid, opcional): Referência à instituição financeira
- cardId (string, uuid, opcional): Referência ao cartão de crédito
- status (string, opcional): Status (completed, pending)
- notes (string, opcional): Notas adicionais
- createdAt (date): Data de criação
- updatedAt (date): Data de atualização

### Category
- id (string, uuid): Identificador único da categoria
- userId (string, uuid): Referência ao usuário
- name (string): Nome da categoria
- type (string): Tipo (income, expense)
- color (string): Cor em formato hexadecimal
- icon (string): Ícone
- active (boolean): Status de ativação
- createdAt (date): Data de criação
- updatedAt (date): Data de atualização

### Subcategory
- id (string, uuid): Identificador único da subcategoria
- userId (string, uuid): Referência ao usuário
- categoryId (string, uuid): Referência à categoria pai
- name (string): Nome da subcategoria
- active (boolean): Status de ativação
- createdAt (date): Data de criação
- updatedAt (date): Data de atualização

### Budget
- id (string, uuid): Identificador único do orçamento
- userId (string, uuid): Referência ao usuário
- categoryId (string, uuid): Referência à categoria
- amount (number): Valor orçado
- year (number): Ano
- month (number): Mês (1-12)
- createdAt (date): Data de criação
- updatedAt (date): Data de atualização

### FinancialInstitution
- id (string, uuid): Identificador único da instituição
- userId (string, uuid): Referência ao usuário
- name (string): Nome da instituição
- type (string): Tipo (bank, digital wallet, etc)
- icon (string): Ícone
- color (string): Cor em formato hexadecimal
- balance (number): Saldo atual
- archived (boolean): Status de arquivamento
- createdAt (date): Data de criação
- updatedAt (date): Data de atualização

### CreditCard
- id (string, uuid): Identificador único do cartão
- userId (string, uuid): Referência ao usuário
- name (string): Nome do cartão
- brand (string): Bandeira
- last4 (string): Últimos 4 dígitos
- limit (number): Limite de crédito
- dueDay (number): Dia de vencimento
- closingDay (number): Dia de fechamento
- color (string): Cor em formato hexadecimal
- institutionId (string, uuid): Referência à instituição financeira
- archived (boolean): Status de arquivamento
- createdAt (date): Data de criação
- updatedAt (date): Data de atualização

### Goal
- id (string, uuid): Identificador único da meta
- userId (string, uuid): Referência ao usuário
- name (string): Nome da meta
- targetAmount (number): Valor alvo
- currentAmount (number): Valor atual
- targetDate (date): Data alvo
- category (string): Categoria da meta
- icon (string): Ícone
- color (string): Cor em formato hexadecimal
- createdAt (date): Data de criação
- updatedAt (date): Data de atualização

### GoalTransaction
- id (string, uuid): Identificador único da transação da meta
- goalId (string, uuid): Referência à meta
- date (date): Data da transação
- amount (number): Valor
- type (string): Tipo (add, remove)
- description (string): Descrição
- createdAt (date): Data de criação

### GoalModification
- id (string, uuid): Identificador único da modificação
- goalId (string, uuid): Referência à meta
- date (date): Data da modificação
- type (string): Tipo de modificação (contribution, withdrawal, target_change, date_change, description_change)
- description (string): Descrição
- amount (number, opcional): Valor (para contribution, withdrawal)
- previousValue (any, opcional): Valor anterior (para alterações)
- newValue (any, opcional): Novo valor (para alterações)
- createdAt (date): Data de criação

## 🔄 Fluxos de Integração

### Fluxo de Sincronização de Dados
1. A aplicação frontend faz requisições iniciais para carregar dados
2. Dados financeiros são armazenados em cache local
3. Atualizações são enviadas ao backend e atualizadas localmente
4. Sincronização periódica garante dados atualizados

### Fluxo de Criação de Orçamento
1. Usuário define orçamento total mensal
2. Aloca valores por categorias
3. Sistema calcula valores não alocados
4. API salva o orçamento mensal
5. Dashboard atualiza com o novo orçamento

### Fluxo de Acompanhamento de Metas
1. Usuário cria meta financeira
2. Adiciona/remove fundos através da API
3. Sistema registra modificações e histórico
4. Dashboard atualiza o progresso da meta

## 📊 Relatórios e Análises

A API deve ser capaz de processar e fornecer dados para os seguintes relatórios:

1. **Resumo Financeiro**: Balanço, receitas, despesas e taxa de economia
2. **Orçado vs. Realizado**: Comparativo entre valores planejados e gastos reais
3. **Categorias de Despesas**: Distribuição de despesas por categoria
4. **Tendências Mensais**: Evolução de receitas e despesas ao longo do tempo
5. **Gastos com Cartão de Crédito**: Análise de gastos por cartão e categoria

## 🔧 Requisitos Técnicos

- **Tecnologias Recomendadas**: Node.js, Express, PostgreSQL/MongoDB
- **Autenticação**: JWT com refresh tokens
- **Documentação**: Swagger/OpenAPI
- **Testes**: Unitários e de integração
- **Logging**: Para auditoria e debugging
- **Validação**: Validação de dados de entrada
- **Controle de Acesso**: Baseado em usuário
- **Tratamento de Erros**: Respostas padronizadas de erro
