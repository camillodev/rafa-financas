
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useSplitBills } from '@/context/SplitBillsContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const paymentFormSchema = z.object({
  participantId: z.string({
    required_error: 'Por favor, selecione um participante',
  }),
  amount: z.coerce
    .number({
      required_error: 'Por favor, informe o valor',
      invalid_type_error: 'O valor deve ser um número',
    })
    .positive('O valor deve ser maior que zero'),
  date: z.date({
    required_error: 'Por favor, selecione uma data',
  }),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface RegisterPaymentFormProps {
  billId: string;
  selectedParticipantId: string | null;
  onSuccess: () => void;
}

export const RegisterPaymentForm: React.FC<RegisterPaymentFormProps> = ({
  billId,
  selectedParticipantId,
  onSuccess,
}) => {
  const { getBillById, getParticipantById, addPayment, calculateParticipantShare } = useSplitBills();
  const bill = getBillById(billId);

  const defaultValues: Partial<PaymentFormValues> = {
    participantId: selectedParticipantId || '',
    amount: 0,
    date: new Date(),
    notes: '',
  };

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues,
  });

  React.useEffect(() => {
    // Set default amount based on participant if one is selected
    if (selectedParticipantId && bill) {
      const share = calculateParticipantShare(bill, selectedParticipantId);
      form.setValue('participantId', selectedParticipantId);
      form.setValue('amount', share);
    }
  }, [selectedParticipantId, bill, form, calculateParticipantShare]);

  const onSubmit = (data: PaymentFormValues) => {
    addPayment({
      splitBillId: billId,
      participantId: data.participantId,
      amount: data.amount,
      date: data.date,
      notes: data.notes,
    });
    onSuccess();
  };

  if (!bill) return null;

  const includedParticipants = bill.participants.filter(p => p.isIncluded);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="participantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Participante</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um participante" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {includedParticipants.map((participant) => {
                    const participantInfo = getParticipantById(participant.participantId);
                    if (!participantInfo) return null;
                    return (
                      <SelectItem key={participant.participantId} value={participant.participantId}>
                        {participantInfo.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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
                <div className="relative">
                  <span className="absolute left-3 top-2.5">R$</span>
                  <Input
                    placeholder="0,00"
                    className="pl-8"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(',', '.');
                      field.onChange(parseFloat(value) || 0);
                    }}
                    value={field.value === 0 ? '' : field.value.toString().replace('.', ',')}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Pagamento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: Pagamento via PIX"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Opcional. Adicione detalhes sobre este pagamento.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit">Registrar Pagamento</Button>
        </div>
      </form>
    </Form>
  );
};
