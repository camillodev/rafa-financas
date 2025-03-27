// Financial Institutions Mock Data
export const mockFinancialInstitutions = [
  { id: '1', name: 'Banco do Brasil' },
  { id: '2', name: 'Nubank' },
  { id: '3', name: 'Itaú' },
  { id: '4', name: 'Caixa Econômica' },
  { id: '5', name: 'Santander' },
  { id: '6', name: 'Bradesco' },
  { id: '7', name: 'Banco Inter' },
];

// Categories Mock Data
export const mockCategories = [
  // Income Categories
  { id: '1', name: 'Salário', type: 'income' as const },
  { id: '2', name: 'Freelance', type: 'income' as const },
  { id: '3', name: 'Dividendos', type: 'income' as const },
  { id: '4', name: 'Investimentos', type: 'income' as const },
  { id: '5', name: 'Outros', type: 'income' as const },

  // Expense Categories
  { id: '6', name: 'Alimentação', type: 'expense' as const },
  { id: '7', name: 'Moradia', type: 'expense' as const },
  { id: '8', name: 'Transporte', type: 'expense' as const },
  { id: '9', name: 'Saúde', type: 'expense' as const },
  { id: '10', name: 'Lazer', type: 'expense' as const },
  { id: '11', name: 'Educação', type: 'expense' as const },
  { id: '12', name: 'Serviços', type: 'expense' as const },
  { id: '13', name: 'Compras', type: 'expense' as const },
  { id: '14', name: 'Outros', type: 'expense' as const },
];

// Transaction Mock Data
export const mockTransactions = [
  {
    id: '1',
    description: 'Salário mensal',
    amount: 5000,
    type: 'income' as const,
    category: 'Salário',
    categoryId: '1',
    date: new Date(),
    settlementDate: new Date(),
    paymentMethod: 'Transferência' as const,
    financialInstitution: 'Banco do Brasil',
    transactionType: 'Transfer' as const,
    status: 'completed' as const
  },
  {
    id: '2',
    description: 'Aluguel',
    amount: 1500,
    type: 'expense' as const,
    category: 'Moradia',
    categoryId: '7',
    date: new Date(),
    settlementDate: new Date(),
    paymentMethod: 'Débito' as const,
    financialInstitution: 'Nubank',
    transactionType: 'Debit' as const,
    status: 'completed' as const
  },
  {
    id: '3',
    description: 'Supermercado',
    amount: 450,
    type: 'expense' as const,
    category: 'Alimentação',
    categoryId: '6',
    date: new Date(),
    settlementDate: new Date(),
    paymentMethod: 'Crédito' as const,
    financialInstitution: 'Itaú',
    transactionType: 'Credit Card' as const,
    status: 'completed' as const
  },
  {
    id: '4',
    description: 'Freelance projeto web',
    amount: 2500,
    type: 'income' as const,
    category: 'Freelance',
    categoryId: '2',
    date: new Date(),
    settlementDate: new Date(),
    paymentMethod: 'Transferência' as const,
    financialInstitution: 'Nubank',
    transactionType: 'Transfer' as const,
    status: 'completed' as const
  },
  {
    id: '5',
    description: 'Internet',
    amount: 120,
    type: 'expense' as const,
    category: 'Serviços',
    categoryId: '12',
    date: new Date(),
    settlementDate: new Date(Date.now() + 86400000 * 5), // 5 days in the future
    paymentMethod: 'Débito' as const,
    financialInstitution: 'Banco do Brasil',
    transactionType: 'Debit' as const,
    status: 'pending' as const
  },
  {
    id: '6',
    description: 'Academia',
    amount: 99,
    type: 'expense' as const,
    category: 'Saúde',
    categoryId: '9',
    date: new Date(),
    settlementDate: new Date(),
    paymentMethod: 'Crédito' as const,
    financialInstitution: 'Nubank',
    transactionType: 'Credit Card' as const,
    status: 'completed' as const
  },
  {
    id: '7',
    description: 'Curso online',
    amount: 350,
    type: 'expense' as const,
    category: 'Educação',
    categoryId: '11',
    date: new Date(),
    settlementDate: new Date(),
    paymentMethod: 'Crédito' as const,
    financialInstitution: 'Nubank',
    transactionType: 'Credit Card' as const,
    status: 'completed' as const
  },
  {
    id: '8',
    description: 'Dividendos ações',
    amount: 180,
    type: 'income' as const,
    category: 'Dividendos',
    categoryId: '3',
    date: new Date(),
    settlementDate: new Date(),
    paymentMethod: 'Transferência' as const,
    financialInstitution: 'Banco Inter',
    transactionType: 'Transfer' as const,
    status: 'completed' as const
  },
  {
    id: '9',
    description: 'Combustível',
    amount: 200,
    type: 'expense' as const,
    category: 'Transporte',
    categoryId: '8',
    date: new Date(),
    settlementDate: new Date(),
    paymentMethod: 'Crédito' as const,
    financialInstitution: 'Nubank',
    transactionType: 'Credit Card' as const,
    status: 'completed' as const
  },
  {
    id: '10',
    description: 'Cinema',
    amount: 60,
    type: 'expense' as const,
    category: 'Lazer',
    categoryId: '10',
    date: new Date(),
    settlementDate: new Date(),
    paymentMethod: 'Crédito' as const,
    financialInstitution: 'Nubank',
    transactionType: 'Credit Card' as const,
    status: 'completed' as const
  },
]; 