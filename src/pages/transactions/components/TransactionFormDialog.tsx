import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { transactionFormSchema, TransactionFormValues, TransactionValues } from '@/schemas/transactionSchema';

interface TransactionFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTransaction: TransactionValues | null;
  onSubmit: (data: TransactionFormValues) => Promise<void>;
  categories: Array<{ id: string; name: string; type: 'income' | 'expense' }>;
  financialInstitutions: Array<{ id: string; name: string }>;
}

export default function TransactionFormDialog({
  isOpen,
  onOpenChange,
  editingTransaction,
  onSubmit,
  categories,
  financialInstitutions,
}: TransactionFormDialogProps) {
  // Setup form with React Hook Form and zod validation
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'expense',
      category: '',
      categoryId: '',
      date: new Date(),
      status: 'completed',
    },
  });

  // Reset form when dialog opens/closes or editing transaction changes
  React.useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        form.reset({
          description: editingTransaction.description,
          amount: editingTransaction.amount,
          type: editingTransaction.type,
          category: editingTransaction.category,
          categoryId: editingTransaction.categoryId,
          subcategory: editingTransaction.subcategory,
          date: new Date(editingTransaction.date),
          settlementDate: editingTransaction.settlementDate ? new Date(editingTransaction.settlementDate) : undefined,
          paymentMethod: editingTransaction.paymentMethod,
          financialInstitution: editingTransaction.financialInstitution,
          transactionType: editingTransaction.transactionType,
          status: editingTransaction.status,
        });
      } else {
        form.reset({
          description: '',
          amount: 0,
          type: 'expense',
          category: categories.find(c => c.type === 'expense')?.name || '',
          categoryId: categories.find(c => c.type === 'expense')?.id || '',
          date: new Date(),
          status: 'completed',
        });
      }
    }
  }, [isOpen, editingTransaction, form, categories]);

  // Get filtered categories based on selected transaction type
  const filteredCategories = categories.filter(
    (category) => category.type === form.watch('type')
  );

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'PPP', { locale: ptBR });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{editingTransaction ? 'Editar' : 'Adicionar'} Transação</DialogTitle>
          <DialogDescription>
            {editingTransaction
              ? 'Edite os detalhes da transação selecionada.'
              : 'Preencha os detalhes da nova transação.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type Selection */}
            <FormField
              control={form.control}
              name="type"
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
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição da transação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const selectedCategory = categories.find((cat) => cat.name === value);
                      if (selectedCategory) {
                        form.setValue('categoryId', selectedCategory.id);
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
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

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="text-left font-normal"
                        >
                          {field.value ? formatDate(field.value) : "Selecione uma data"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Financial Institution */}
            <FormField
              control={form.control}
              name="financialInstitution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instituição Financeira</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma instituição" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {financialInstitutions.map((institution) => (
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

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">{editingTransaction ? 'Salvar' : 'Adicionar'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 