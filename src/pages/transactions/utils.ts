import { AdvancedFilters } from './hooks/useTransactionFilters';

// Utility function to get transaction filter options
export function getTransactionFilterOptions() {
  return [
    { value: 'all', label: 'Todas' },
    { value: 'income', label: 'Receitas', color: 'green' },
    { value: 'expense', label: 'Despesas', color: 'red' },
  ];
}

// Utility function to get advanced filter fields
export function getAdvancedFilterFields(
  filters: AdvancedFilters,
  categories: Array<{ id: string; name: string; type: 'income' | 'expense' }> = [],
  financialInstitutions: Array<{ id: string; name: string }> = []
) {
  return [
    {
      id: 'dateRange',
      label: 'Período',
      type: 'dateRange' as const,
      value: filters.dateRange,
      options: [],
    },
    {
      id: 'category',
      label: 'Categoria',
      type: 'select' as const,
      value: filters.category,
      options: [
        { value: 'all', label: 'Todas' },
        ...categories.map(cat => ({
          value: cat.name,
          label: cat.name,
        })),
      ],
    },
    {
      id: 'institution',
      label: 'Instituição Financeira',
      type: 'select' as const,
      value: filters.institution,
      options: [
        { value: 'all', label: 'Todas' },
        ...financialInstitutions.map(inst => ({
          value: inst.name,
          label: inst.name,
        })),
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      value: filters.status,
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'completed', label: 'Concluídas' },
        { value: 'pending', label: 'Pendentes' },
      ],
    },
    {
      id: 'amountRange',
      label: 'Valor',
      type: 'range' as const,
      value: filters.amountRange,
      options: [],
    },
  ];
} 