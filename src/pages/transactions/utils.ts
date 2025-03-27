import { FilterField } from '@/components/ui/AdvancedFiltersBuilder';
import { TransactionType } from '@/types/finance';

interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

interface Institution {
  id: string;
  name: string;
}

interface AdvancedFilters {
  dateRange: {
    start: string;
    end: string;
  };
  category: string;
  subcategory: string;
  institution: string;
  transactionType: string;
  paymentMethod: string;
  status: string;
  amountRange: {
    min: string;
    max: string;
  };
}

/**
 * Get filter options for transaction types
 */
export const getTransactionFilterOptions = () => [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Receitas', color: 'bg-finance-income text-white' },
  { value: 'expense', label: 'Despesas', color: 'bg-finance-expense text-white' }
];

/**
 * Get advanced filter fields based on categories and institutions
 */
export const getAdvancedFilterFields = (
  advancedFilters: AdvancedFilters,
  categories: Category[],
  institutions: Institution[]
): FilterField[] => [
    {
      type: 'dateRange',
      name: 'dateRange',
      label: 'Data',
      value: advancedFilters.dateRange
    },
    {
      type: 'select',
      name: 'category',
      label: 'Categoria',
      value: advancedFilters.category,
      options: [
        { value: 'all', label: 'Todas as categorias' },
        ...categories.map(category => ({ value: category.name, label: category.name }))
      ]
    },
    {
      type: 'input',
      name: 'subcategory',
      label: 'Subcategoria',
      value: advancedFilters.subcategory,
      placeholder: 'Filtrar por subcategoria'
    },
    {
      type: 'select',
      name: 'institution',
      label: 'Instituição Financeira',
      value: advancedFilters.institution,
      options: [
        { value: 'all', label: 'Todas as instituições' },
        ...institutions.map(institution => ({ value: institution.name, label: institution.name }))
      ]
    },
    {
      type: 'select',
      name: 'transactionType',
      label: 'Tipo de Transação',
      value: advancedFilters.transactionType,
      options: [
        { value: 'all', label: 'Todos os tipos' },
        { value: 'Credit Card', label: 'Cartão de Crédito' },
        { value: 'Transfer', label: 'Transferência' },
        { value: 'Debit', label: 'Débito' },
        { value: 'Other', label: 'Outro' }
      ]
    },
    {
      type: 'select',
      name: 'paymentMethod',
      label: 'Método de Pagamento',
      value: advancedFilters.paymentMethod,
      options: [
        { value: 'all', label: 'Todos os métodos' },
        { value: 'Débito', label: 'Débito' },
        { value: 'Crédito', label: 'Cartão de Crédito' },
        { value: 'Transferência', label: 'Transferência' },
        { value: 'Dinheiro', label: 'Dinheiro' },
        { value: 'Outros', label: 'Outros' }
      ]
    },
    {
      type: 'select',
      name: 'status',
      label: 'Status',
      value: advancedFilters.status,
      options: [
        { value: 'all', label: 'Todos os status' },
        { value: 'completed', label: 'Concluído' },
        { value: 'pending', label: 'Pendente' }
      ]
    },
    {
      type: 'numberRange',
      name: 'amountRange',
      label: 'Valor',
      value: advancedFilters.amountRange,
      placeholder: 'R$ 0,00',
      min: 0,
      step: 0.01
    }
  ]; 