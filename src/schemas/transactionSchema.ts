import { z } from 'zod';


/**
 * Schema for transaction types
 */
export const transactionTypeSchema = z.enum(['income', 'expense']);

/**
 * Schema for transaction status
 */
export const transactionStatusSchema = z.enum(['completed', 'pending']);

/**
 * Schema for transaction method types
 */
export const transactionMethodSchema = z.enum([
  'Cartão de Crédito',
  'Transferência',
  'Débito',
  'Outro'
]);

/**
 * Schema for payment methods
 */
export const paymentMethodSchema = z.enum([
  'Débito',
  'Crédito',
  'Transferência',
  'Dinheiro',
  'Outros'
]);

/**
 * Schema for creating/updating a transaction
 */
export const transactionFormSchema = z.object({
  description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  amount: z
    .number({ required_error: 'Valor é obrigatório' })
    .positive('Valor deve ser positivo'),
  type: transactionTypeSchema,
  category: z.string().min(1, 'Categoria é obrigatória'),
  categoryId: z.string().optional(),
  subcategory: z.string().optional(),
  date: z.date({ required_error: 'Data é obrigatória' }),
  settlementDate: z.date().optional(),
  paymentMethod: paymentMethodSchema.optional(),
  financialInstitution: z.string().optional(),
  transactionType: transactionMethodSchema.optional(),
  status: transactionStatusSchema,
});

/**
 * Schema for a complete transaction (including ID)
 */
export const transactionSchema = transactionFormSchema.extend({
  id: z.string(),
});

/**
 * Type for transaction form data
 */
export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

/**
 * Type for a complete transaction
 */
export type TransactionValues = z.infer<typeof transactionSchema>; 