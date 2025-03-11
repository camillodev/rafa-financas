import { Transaction, Category, BudgetGoal, FinancialSummary, FinancialInstitution, CreditCard, Subcategory } from '../types/finance';

// Categories
export const categories: Category[] = [
  { id: '1', name: 'Salário', icon: 'briefcase', color: '#38bdf8', type: 'income' },
  { id: '2', name: 'Investimentos', icon: 'trending-up', color: '#4ade80', type: 'income' },
  { id: '3', name: 'Presentes', icon: 'gift', color: '#a78bfa', type: 'income' },
  { id: '4', name: 'Moradia', icon: 'home', color: '#f97316', type: 'expense' },
  { id: '5', name: 'Alimentação', icon: 'utensils', color: '#f43f5e', type: 'expense' },
  { id: '6', name: 'Transporte', icon: 'car', color: '#10b981', type: 'expense' },
  { id: '7', name: 'Entretenimento', icon: 'film', color: '#8b5cf6', type: 'expense' },
  { id: '8', name: 'Compras', icon: 'shopping-bag', color: '#ec4899', type: 'expense' },
  { id: '9', name: 'Utilidades', icon: 'zap', color: '#06b6d4', type: 'expense' },
  { id: '10', name: 'Saúde', icon: 'activity', color: '#14b8a6', type: 'expense' },
  { id: '11', name: 'Educação', icon: 'book', color: '#6366f1', type: 'expense' },
  { id: '12', name: 'Assinaturas', icon: 'repeat', color: '#f59e0b', type: 'expense' },
];

// Subcategories
export const subcategories: Subcategory[] = [
  { id: 'sc1', name: 'Aluguel', categoryId: '4' },
  { id: 'sc2', name: 'Condomínio', categoryId: '4' },
  { id: 'sc3', name: 'IPTU', categoryId: '4' },
  { id: 'sc4', name: 'Supermercado', categoryId: '5' },
  { id: 'sc5', name: 'Restaurantes', categoryId: '5' },
  { id: 'sc6', name: 'Delivery', categoryId: '5' },
  { id: 'sc7', name: 'Combustível', categoryId: '6' },
  { id: 'sc8', name: 'Transporte Público', categoryId: '6' },
  { id: 'sc9', name: 'Uber/Táxi', categoryId: '6' },
  { id: 'sc10', name: 'Cinema', categoryId: '7' },
  { id: 'sc11', name: 'Shows', categoryId: '7' },
  { id: 'sc12', name: 'Streaming', categoryId: '7' },
  { id: 'sc13', name: 'Roupas', categoryId: '8' },
  { id: 'sc14', name: 'Eletrônicos', categoryId: '8' },
  { id: 'sc15', name: 'Presentes', categoryId: '8' },
  { id: 'sc16', name: 'Água', categoryId: '9' },
  { id: 'sc17', name: 'Energia', categoryId: '9' },
  { id: 'sc18', name: 'Internet', categoryId: '9' },
  { id: 'sc19', name: 'Celular', categoryId: '9' },
  { id: 'sc20', name: 'Consultas', categoryId: '10' },
  { id: 'sc21', name: 'Medicamentos', categoryId: '10' },
  { id: 'sc22', name: 'Plano de Saúde', categoryId: '10' },
  { id: 'sc23', name: 'Cursos', categoryId: '11' },
  { id: 'sc24', name: 'Livros', categoryId: '11' },
  { id: 'sc25', name: 'Material Escolar', categoryId: '11' },
  { id: 'sc26', name: 'Netflix', categoryId: '12' },
  { id: 'sc27', name: 'Spotify', categoryId: '12' },
  { id: 'sc28', name: 'Academia', categoryId: '12' },
];

// Financial Institutions
export const financialInstitutions: FinancialInstitution[] = [
  { id: 'fi1', name: 'Nubank', icon: 'bank', currentBalance: 8500, isActive: true },
  { id: 'fi2', name: 'Banco do Brasil', icon: 'bank', currentBalance: 12000, isActive: true },
  { id: 'fi3', name: 'Itaú', icon: 'bank', currentBalance: 5000, isActive: true },
  { id: 'fi4', name: 'Bradesco', icon: 'bank', currentBalance: 3500, isActive: false },
  { id: 'fi5', name: 'Santander', icon: 'bank', currentBalance: 2000, isActive: true },
];

// Credit Cards
export const creditCards: CreditCard[] = [
  { id: 'cc1', name: 'Nubank Platinum', limit: 8000, brand: 'Mastercard', dueDate: 15, institutionId: 'fi1' },
  { id: 'cc2', name: 'BB Ourocard', limit: 10000, brand: 'Visa', dueDate: 10, institutionId: 'fi2' },
  { id: 'cc3', name: 'Itaú Personnalité', limit: 15000, brand: 'Mastercard', dueDate: 5, institutionId: 'fi3' },
  { id: 'cc4', name: 'Santander Free', limit: 5000, brand: 'Visa', dueDate: 20, institutionId: 'fi5' },
];

// Transactions
export const transactions: Transaction[] = [
  {
    id: 't1',
    amount: 8500,
    type: 'income',
    category: 'Salário',
    date: new Date(2023, 7, 1),
    description: 'Salário Mensal',
    paymentMethod: 'Transferência Bancária',
    financialInstitution: 'Nubank',
    status: 'completed'
  },
  {
    id: 't2',
    amount: 2500,
    type: 'expense',
    category: 'Moradia',
    subcategory: 'Aluguel',
    date: new Date(2023, 7, 5),
    description: 'Aluguel Mensal',
    paymentMethod: 'Transferência Bancária',
    financialInstitution: 'Banco do Brasil',
    status: 'completed'
  },
  {
    id: 't3',
    amount: 120,
    type: 'expense',
    category: 'Utilidades',
    subcategory: 'Energia',
    date: new Date(2023, 7, 10),
    description: 'Conta de Luz',
    paymentMethod: 'Cartão de Crédito',
    financialInstitution: 'Nubank',
    transactionType: 'Credit Card',
    status: 'completed'
  },
  {
    id: 't4',
    amount: 350,
    type: 'expense',
    category: 'Alimentação',
    subcategory: 'Supermercado',
    date: new Date(2023, 7, 12),
    description: 'Compras Semanais',
    paymentMethod: 'Cartão de Crédito',
    financialInstitution: 'Nubank',
    transactionType: 'Credit Card',
    status: 'completed'
  },
  {
    id: 't5',
    amount: 45,
    type: 'expense',
    category: 'Transporte',
    subcategory: 'Combustível',
    date: new Date(2023, 7, 15),
    description: 'Gasolina para o Carro',
    paymentMethod: 'Cartão de Débito',
    financialInstitution: 'Banco do Brasil',
    transactionType: 'Debit',
    status: 'completed'
  },
  {
    id: 't6',
    amount: 25,
    type: 'expense',
    category: 'Assinaturas',
    subcategory: 'Netflix',
    date: new Date(2023, 7, 15),
    description: 'Assinatura Netflix',
    paymentMethod: 'Cartão de Crédito',
    financialInstitution: 'Itaú',
    transactionType: 'Credit Card',
    status: 'completed'
  },
  {
    id: 't7',
    amount: 80,
    type: 'expense',
    category: 'Entretenimento',
    subcategory: 'Restaurantes',
    date: new Date(2023, 7, 18),
    description: 'Jantar com Amigos',
    paymentMethod: 'Cartão de Crédito',
    financialInstitution: 'Nubank',
    transactionType: 'Credit Card',
    status: 'completed'
  },
  {
    id: 't8',
    amount: 200,
    type: 'expense',
    category: 'Compras',
    subcategory: 'Roupas',
    date: new Date(2023, 7, 20),
    description: 'Tênis Novo',
    paymentMethod: 'Cartão de Crédito',
    financialInstitution: 'Banco do Brasil',
    transactionType: 'Credit Card',
    status: 'completed'
  },
  {
    id: 't9',
    amount: 1000,
    type: 'income',
    category: 'Investimentos',
    date: new Date(2023, 7, 22),
    description: 'Dividendos de Ações',
    paymentMethod: 'Transferência Bancária',
    financialInstitution: 'Itaú',
    status: 'completed'
  },
  {
    id: 't10',
    amount: 150,
    type: 'expense',
    category: 'Saúde',
    subcategory: 'Consultas',
    date: new Date(2023, 7, 25),
    description: 'Consulta Médica',
    paymentMethod: 'Plano de Saúde',
    status: 'completed'
  },
  {
    id: 't11',
    amount: 1500,
    type: 'income',
    category: 'Investimentos',
    date: new Date(2023, 8, 5),
    description: 'Resgate de Investimentos',
    paymentMethod: 'Transferência Bancária',
    financialInstitution: 'Nubank',
    status: 'completed'
  },
  {
    id: 't12',
    amount: 300,
    type: 'expense',
    category: 'Compras',
    subcategory: 'Eletrônicos',
    date: new Date(2023, 8, 8),
    description: 'Fones de Ouvido',
    paymentMethod: 'Cartão de Crédito',
    financialInstitution: 'Itaú',
    transactionType: 'Credit Card',
    status: 'completed'
  },
  {
    id: 't13',
    amount: 200,
    type: 'expense',
    category: 'Alimentação',
    subcategory: 'Delivery',
    date: new Date(2023, 8, 10),
    description: 'Pedido iFood',
    paymentMethod: 'Cartão de Crédito',
    financialInstitution: 'Nubank',
    transactionType: 'Credit Card',
    status: 'completed'
  },
  {
    id: 't14',
    amount: 180,
    type: 'expense',
    category: 'Utilidades',
    subcategory: 'Internet',
    date: new Date(2023, 8, 15),
    description: 'Fatura Internet',
    paymentMethod: 'Débito Automático',
    financialInstitution: 'Banco do Brasil',
    status: 'completed'
  },
  {
    id: 't15',
    amount: 3000,
    type: 'income',
    category: 'Salário',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    description: 'Bônus Trimestral',
    paymentMethod: 'Transferência Bancária',
    financialInstitution: 'Banco do Brasil',
    status: 'completed'
  },
  {
    id: 't16',
    amount: 400,
    type: 'expense',
    category: 'Contas a Pagar',
    subcategory: 'Plano de Saúde',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    description: 'Mensalidade Plano de Saúde',
    paymentMethod: 'Débito Automático',
    financialInstitution: 'Santander',
    status: 'pending'
  },
  {
    id: 't17',
    amount: 250,
    type: 'expense',
    category: 'Educação',
    subcategory: 'Cursos',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 8),
    description: 'Curso Online',
    paymentMethod: 'Cartão de Crédito',
    financialInstitution: 'Nubank',
    transactionType: 'Credit Card',
    status: 'completed'
  },
  {
    id: 't18',
    amount: 120,
    type: 'expense',
    category: 'Assinaturas',
    subcategory: 'Academia',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
    description: 'Mensalidade Academia',
    paymentMethod: 'Cartão de Crédito',
    financialInstitution: 'Itaú',
    transactionType: 'Credit Card',
    status: 'completed'
  },
  {
    id: 't19',
    amount: 800,
    type: 'expense',
    category: 'Compras',
    subcategory: 'Eletrônicos',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 12),
    description: 'Novo Monitor',
    paymentMethod: 'Cartão de Crédito',
    financialInstitution: 'Banco do Brasil',
    transactionType: 'Credit Card',
    card: 'cc2',
    status: 'pending'
  },
  {
    id: 't20',
    amount: 500,
    type: 'income',
    category: 'Presentes',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    description: 'Presente de Aniversário',
    paymentMethod: 'Transferência Bancária',
    financialInstitution: 'Nubank',
    status: 'completed'
  },
  {
    id: 't21',
    amount: 150,
    type: 'expense',
    category: 'Transporte',
    subcategory: 'Uber/Táxi',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 18),
    description: 'Viagem de Trabalho',
    paymentMethod: 'Cartão de Débito',
    financialInstitution: 'Nubank',
    transactionType: 'Debit',
    status: 'completed'
  },
  {
    id: 't22',
    amount: 90,
    type: 'expense',
    category: 'Entretenimento',
    subcategory: 'Cinema',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    description: 'Estreia de Filme',
    paymentMethod: 'Cartão de Crédito',
    financialInstitution: 'Nubank',
    transactionType: 'Credit Card',
    status: 'completed'
  },
  {
    id: 't23',
    amount: 60,
    type: 'expense',
    category: 'Alimentação',
    subcategory: 'Restaurantes',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 22),
    description: 'Almoço de Negócios',
    paymentMethod: 'Cartão de Crédito',
    financialInstitution: 'Itaú',
    transactionType: 'Credit Card',
    status: 'completed'
  },
  {
    id: 't24',
    amount: 2000,
    type: 'expense',
    category: 'Contas a Pagar',
    subcategory: 'Condomínio',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 30),
    description: 'Condomínio Mensal',
    paymentMethod: 'Transferência Bancária',
    financialInstitution: 'Banco do Brasil',
    transactionType: 'Transfer',
    status: 'pending'
  },
  {
    id: 't25',
    amount: 100,
    type: 'expense',
    category: 'Contas a Pagar',
    subcategory: 'Água',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 28),
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5),
    description: 'Conta de Água',
    paymentMethod: 'Débito Automático',
    financialInstitution: 'Banco do Brasil',
    status: 'pending'
  },
];

// Budget goals
export const budgetGoals: BudgetGoal[] = [
  { category: 'Moradia', amount: 2500, spent: 2500, period: 'monthly', date: new Date(2023, 7, 1) },
  { category: 'Alimentação', amount: 600, spent: 450, period: 'monthly', date: new Date(2023, 7, 1) },
  { category: 'Transporte', amount: 200, spent: 150, period: 'monthly', date: new Date(2023, 7, 1) },
  { category: 'Entretenimento', amount: 200, spent: 180, period: 'monthly', date: new Date(2023, 7, 1) },
  { category: 'Compras', amount: 300, spent: 250, period: 'monthly', date: new Date(2023, 7, 1) },
  { category: 'Utilidades', amount: 300, spent: 280, period: 'monthly', date: new Date(2023, 7, 1) },
  { category: 'Saúde', amount: 200, spent: 150, period: 'monthly', date: new Date(2023, 7, 1) },
  { category: 'Educação', amount: 100, spent: 0, period: 'monthly', date: new Date(2023, 7, 1) },
  { category: 'Assinaturas', amount: 50, spent: 25, period: 'monthly', date: new Date(2023, 7, 1) },
];

// Financial summary
export const financialSummary: FinancialSummary = {
  totalIncome: 9500,
  totalExpenses: 3950,
  netBalance: 5550,
  savingsGoal: 3000,
  savingsProgress: 2550,
};

// Monthly data for charts
export const monthlyData = [
  { month: 'Jan', income: 8500, expenses: 4200 },
  { month: 'Fev', income: 8500, expenses: 4100 },
  { month: 'Mar', income: 8700, expenses: 4300 },
  { month: 'Abr', income: 8500, expenses: 4150 },
  { month: 'Mai', income: 8500, expenses: 4250 },
  { month: 'Jun', income: 9200, expenses: 4400 },
  { month: 'Jul', income: 9500, expenses: 3950 },
  { month: 'Ago', income: 0, expenses: 0 },
  { month: 'Set', income: 0, expenses: 0 },
  { month: 'Out', income: 0, expenses: 0 },
  { month: 'Nov', income: 0, expenses: 0 },
  { month: 'Dez', income: 0, expenses: 0 },
];

// Category breakdown for charts
export const expenseBreakdown = [
  { category: 'Moradia', value: 2500, color: '#f97316' },
  { category: 'Alimentação', value: 450, color: '#f43f5e' },
  { category: 'Transporte', value: 150, color: '#10b981' },
  { category: 'Entretenimento', value: 180, color: '#8b5cf6' },
  { category: 'Compras', value: 250, color: '#ec4899' },
  { category: 'Utilidades', value: 280, color: '#06b6d4' },
  { category: 'Saúde', value: 150, color: '#14b8a6' },
  { category: 'Educação', value: 0, color: '#6366f1' },
  { category: 'Assinaturas', value: 25, color: '#f59e0b' },
];
