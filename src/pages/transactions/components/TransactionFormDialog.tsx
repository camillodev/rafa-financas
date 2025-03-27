import React from 'react';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransactionFormValues, transactionFormSchema } from '@/schemas/transactionSchema';
import { Transaction } from '@/types/finance';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface TransactionFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTransaction: Transaction | null;
  onSubmit: (data: TransactionFormValues) => void;
  categories: Array<{ id: string; name: string; type: 'income' | 'expense' }>;
  financialInstitutions: Array<{ id: string; name: string }>;
}

const TransactionFormDialog: React.FC<TransactionFormDialogProps> = ({
  isOpen,
  onOpenChange,
  editingTransaction,
  onSubmit,
  categories,
  financialInstitutions
}) => {
  // Set up form with default values
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when editing transaction changes
  React.useEffect(() => {
    if (isOpen) {
      const values = getDefaultValues();
      Object.keys(values).forEach((key) => {
        form.setValue(key as any, values[key as keyof TransactionFormValues]);
      });
    }
  }, [isOpen, editingTransaction, form]);

  // Get default values based on editing state
  function getDefaultValues(): TransactionFormValues {
    if (editingTransaction) {
      return {
        description: editingTransaction.description,
        amount: editingTransaction.amount,
        type: editingTransaction.type,
        category: editingTransaction.category,
        categoryId: editingTransaction.categoryId || '',
        subcategory: editingTransaction.subcategory || '',
        date: new Date(editingTransaction.date),
        settlementDate: editingTransaction.settlementDate
          ? new Date(editingTransaction.settlementDate)
          : undefined,
        paymentMethod: editingTransaction.paymentMethod || undefined,
        financialInstitution: editingTransaction.financialInstitution || '',
        transactionType: editingTransaction.transactionType || undefined,
        status: editingTransaction.status
      };
    }

    return {
      description: '',
      amount: 0,
      type: 'expense',
      category: categories.find(c => c.type === 'expense')?.name || '',
      categoryId: categories.find(c => c.type === 'expense')?.id || '',
      subcategory: '',
      date: new Date(),
      settlementDate: undefined,
      paymentMethod: 'Débito',
      financialInstitution: financialInstitutions[0]?.name || '',
      transactionType: 'Debit',
      status: 'completed'
    };
  }

  // Get filtered categories based on selected transaction type
  const filteredCategories = categories.filter(
    cat => cat.type === form.watch('type')
  );

  // Handle form submission
  const handleSubmit = form.handleSubmit((data) => {
    // Set category ID based on selected category name
    const categoryObj = categories.find(c => c.name === data.category);
    if (categoryObj) {
      data.categoryId = categoryObj.id;
    }

    onSubmit(data);
    onOpenChange(false);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
          <DialogDescription>
            {editingTransaction
              ? 'Edite os detalhes da transação abaixo.'
              : 'Preencha os detalhes da nova transação abaixo.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset category when type changes
                      const defaultCategory = categories.find(c => c.type === value)?.name || '';
                      form.setValue('category', defaultCategory);
                    }}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategoria</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settlementDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Liquidação</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="financialInstitution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instituição</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a instituição" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {financialInstitutions.map(institution => (
                        <SelectItem key={institution.id} value={institution.name}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Transação</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de transação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Credit Card">Cartão de Crédito</SelectItem>
                      <SelectItem value="Transfer">Transferência</SelectItem>
                      <SelectItem value="Debit">Débito</SelectItem>
                      <SelectItem value="Other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Débito">Débito</SelectItem>
                      <SelectItem value="Crédito">Cartão de Crédito</SelectItem>
                      <SelectItem value="Transferência">Transferência</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">
                {editingTransaction ? 'Salvar Alterações' : 'Adicionar Transação'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionFormDialog; 