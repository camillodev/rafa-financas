
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Plus, Minus } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';

const billFormSchema = z.object({
  name: z.string().min(3, {
    message: 'O nome da divisão deve ter pelo menos 3 caracteres',
  }),
  totalAmount: z.coerce
    .number({
      required_error: 'Por favor, informe o valor total',
      invalid_type_error: 'O valor deve ser um número',
    })
    .positive('O valor deve ser maior que zero'),
  date: z.date({
    required_error: 'Por favor, selecione uma data',
  }),
  category: z.string().optional(),
  divisionMethod: z.enum(['equal', 'fixed', 'percentage', 'weight'], {
    required_error: 'Por favor, selecione um método de divisão',
  }),
  groupId: z.string().optional(),
  participants: z.array(
    z.object({
      participantId: z.string(),
      isIncluded: z.boolean(),
      amount: z.number().optional(),
      percentage: z.number().optional(),
      weight: z.number().optional(),
    })
  ),
});

type BillFormValues = z.infer<typeof billFormSchema>;

interface AddBillFormProps {
  onSuccess: () => void;
}

export const AddBillForm: React.FC<AddBillFormProps> = ({ onSuccess }) => {
  const { participants, groups, addBill } = useSplitBills();
  const [currentTab, setCurrentTab] = useState<'group' | 'individual'>('individual');

  // Predefined categories
  const categories = [
    'Alimentação',
    'Transporte',
    'Lazer',
    'Moradia',
    'Serviços',
    'Compras',
    'Outros',
  ];

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      name: '',
      totalAmount: 0,
      date: new Date(),
      category: '',
      divisionMethod: 'equal',
      groupId: '',
      participants: participants.map(p => ({
        participantId: p.id,
        isIncluded: false,
        amount: 0,
        percentage: 0,
        weight: 1,
      })),
    },
  });

  const watchDivisionMethod = form.watch('divisionMethod');
  const watchGroupId = form.watch('groupId');
  const watchParticipants = form.watch('participants');
  const watchTotalAmount = form.watch('totalAmount');

  // Update participants list when group changes
  React.useEffect(() => {
    if (currentTab === 'group' && watchGroupId) {
      const group = groups.find(g => g.id === watchGroupId);
      if (group) {
        const updatedParticipants = participants.map(p => {
          const isInGroup = group.participants.some(gp => gp.id === p.id);
          return {
            participantId: p.id,
            isIncluded: isInGroup,
            amount: 0,
            percentage: 0,
            weight: 1,
          };
        });
        form.setValue('participants', updatedParticipants);
      }
    }
  }, [watchGroupId, currentTab, groups, participants, form]);

  const onSubmit = (data: BillFormValues) => {
    addBill({
      name: data.name,
      totalAmount: data.totalAmount,
      date: data.date,
      category: data.category,
      divisionMethod: data.divisionMethod,
      groupId: currentTab === 'group' ? data.groupId : undefined,
      participants: data.participants,
      status: 'active',
    });
    
    onSuccess();
  };

  // Calculate total percentage
  const totalPercentage = watchParticipants
    .filter(p => p.isIncluded)
    .reduce((sum, p) => sum + (p.percentage || 0), 0);

  // Calculate total fixed amount
  const totalFixedAmount = watchParticipants
    .filter(p => p.isIncluded)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Get included participants count
  const includedCount = watchParticipants.filter(p => p.isIncluded).length;

  // Calculate equal share
  const equalShare = includedCount > 0 ? watchTotalAmount / includedCount : 0;

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Divisão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Jantar de aniversário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total</FormLabel>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="divisionMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Método de Divisão</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="equal" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Igualitária (Dividir igualmente)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="fixed" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Valores Fixos (Definir quanto cada um paga)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="percentage" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Porcentagens (Definir porcentagem para cada um)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="weight" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Por Pesos (Definir peso proporcional para cada um)
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <FormLabel>Participantes</FormLabel>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={currentTab === 'individual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTab('individual')}
                >
                  Selecionar Indivíduos
                </Button>
                <Button
                  type="button"
                  variant={currentTab === 'group' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTab('group')}
                >
                  Usar Grupo
                </Button>
              </div>
            </div>

            {currentTab === 'group' ? (
              <FormField
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um grupo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name} ({group.participants.length} pessoas)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione um grupo predefinido de participantes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-4">
                {form.watch('participants').map((participant, index) => {
                  const participantInfo = participants.find(p => p.id === participant.participantId);
                  if (!participantInfo) return null;

                  return (
                    <div key={participant.participantId} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name={`participants.${index}.isIncluded`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium cursor-pointer">
                                  {participantInfo.name}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>

                        {participant.isIncluded && (
                          <div className="text-sm">
                            {form.watch('divisionMethod') === 'equal' && (
                              <span>R$ {equalShare.toFixed(2).replace('.', ',')}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {participant.isIncluded && form.watch('divisionMethod') !== 'equal' && (
                        <div className="mt-2 pl-6">
                          {form.watch('divisionMethod') === 'fixed' && (
                            <FormField
                              control={form.control}
                              name={`participants.${index}.amount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Valor Fixo</FormLabel>
                                  <div className="flex items-center">
                                    <FormControl>
                                      <div className="relative w-full">
                                        <span className="absolute left-3 top-2">R$</span>
                                        <Input
                                          placeholder="0,00"
                                          className="pl-8"
                                          value={field.value?.toString().replace('.', ',') || '0,00'}
                                          onChange={(e) => {
                                            const value = e.target.value.replace(',', '.');
                                            field.onChange(parseFloat(value) || 0);
                                          }}
                                        />
                                      </div>
                                    </FormControl>
                                  </div>
                                  {totalFixedAmount !== watchTotalAmount && (
                                    <p className="text-xs text-red-500 mt-1">
                                      Total não confere. Restante: R$ {(watchTotalAmount - totalFixedAmount).toFixed(2).replace('.', ',')}
                                    </p>
                                  )}
                                </FormItem>
                              )}
                            />
                          )}

                          {form.watch('divisionMethod') === 'percentage' && (
                            <FormField
                              control={form.control}
                              name={`participants.${index}.percentage`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Porcentagem</FormLabel>
                                  <div className="flex items-center">
                                    <FormControl>
                                      <div className="relative w-full">
                                        <Input
                                          placeholder="0"
                                          className="pr-8"
                                          value={field.value || '0'}
                                          onChange={(e) => {
                                            field.onChange(parseInt(e.target.value) || 0);
                                          }}
                                        />
                                        <span className="absolute right-3 top-2">%</span>
                                      </div>
                                    </FormControl>
                                    <div className="ml-4 text-sm">
                                      ≈ R$ {(((field.value || 0) / 100) * watchTotalAmount).toFixed(2).replace('.', ',')}
                                    </div>
                                  </div>
                                  {totalPercentage !== 100 && (
                                    <p className="text-xs text-red-500 mt-1">
                                      Total: {totalPercentage}% (deve ser 100%)
                                    </p>
                                  )}
                                </FormItem>
                              )}
                            />
                          )}

                          {form.watch('divisionMethod') === 'weight' && (
                            <FormField
                              control={form.control}
                              name={`participants.${index}.weight`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Peso</FormLabel>
                                  <div className="flex items-center">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        const currentValue = field.value || 1;
                                        if (currentValue > 1) {
                                          field.onChange(currentValue - 1);
                                        }
                                      }}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <FormControl>
                                      <Input
                                        className="w-16 mx-2 text-center"
                                        value={field.value || 1}
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value);
                                          field.onChange(value > 0 ? value : 1);
                                        }}
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        const currentValue = field.value || 1;
                                        field.onChange(currentValue + 1);
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancelar
            </Button>
            <Button type="submit">Criar Divisão</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
