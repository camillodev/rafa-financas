import { FinancialInstitution } from '@/types/finance';

export interface InstitutionsState {
  institutions: any[];
  financialInstitutions: FinancialInstitution[];
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchInstitutions: () => Promise<void>;

  // CRUD operations
  addFinancialInstitution: (institution: Omit<FinancialInstitution, 'id'>) => Promise<void>;
  updateFinancialInstitution: (institution: FinancialInstitution) => Promise<void>;
  deleteFinancialInstitution: (id: string) => Promise<void>;
  archiveFinancialInstitution: (id: string) => Promise<void>;
} 