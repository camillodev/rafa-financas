
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Plus, X, Upload, Camera } from 'lucide-react';

import { useSplitBills } from '@/context/SplitBillsContext';
import { SplitBillParticipantShare, SplitBillParticipant } from '@/types/finance';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const expenseSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome da despesa deve ter pelo menos 2 caracteres',
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
  paidBy: z.string({
    required_error: 'Por favor, selecione quem pagou',
  }),
  notes: z.string().optional(),
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

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { participants, groups, addBill } = useSplitBills();
  const [currentStep, setCurrentStep] = useState<'select-participants' | 'expense-details'>('select-participants');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newParticipantName, setNewParticipantName] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: '',
      totalAmount: 0,
      date: new Date(),
      category: categories[0],
      divisionMethod: 'equal',
      paidBy: '', // Será definido com base no usuário atual
      notes: '',
      participants: [],
    },
  });

  // Reset form and state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('select-participants');
      setSelectedParticipants([]);
      setSearchTerm('');
      setNewParticipantName('');
      setShowAddParticipant(false);
      setUploadedImages([]);
      form.reset({
        name: '',
        totalAmount: 0,
        date: new Date(),
        category: categories[0],
        divisionMethod: 'equal',
        paidBy: '1', // Definindo o usuário atual (ID 1) como pagador padrão
        notes: '',
        participants: [],
      });
    }
  }, [isOpen, form]);

  // Filtrar participantes com base no termo de busca
  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar grupos com base no termo de busca
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manipular a seleção de participantes
  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev => {
      if (prev.includes(participantId)) {
        return prev.filter(id => id !== participantId);
      } else {
        return [...prev, participantId];
      }
    });
  };

  // Manipular a seleção de grupos (adiciona todos os participantes do grupo)
  const toggleGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const groupParticipantIds = group.participants.map(p => p.id);
    
    setSelectedParticipants(prev => {
      // Verificar se todos os participantes do grupo já estão selecionados
      const allSelected = groupParticipantIds.every(id => prev.includes(id));
      
      if (allSelected) {
        // Remover todos os participantes do grupo
        return prev.filter(id => !groupParticipantIds.includes(id));
      } else {
        // Adicionar participantes que ainda não estão selecionados
        const newSelection = [...prev];
        groupParticipantIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      }
    });
  };

  // Adicionar novo participante
  const addNewParticipant = () => {
    if (newParticipantName.trim().length < 2) return;
    
    // Normalmente chamaríamos a função do contexto para adicionar um participante,
    // mas para simplicidade, vamos apenas simular:
    const newId = `new-${Date.now()}`;
    // Aqui adicionaríamos o novo participante ao contexto
    
    // Adicionar à seleção atual
    setSelectedParticipants(prev => [...prev, newId]);
    
    // Limpar e esconder o input
    setNewParticipantName('');
    setShowAddParticipant(false);
  };

  // Avançar para o próximo passo
  const goToExpenseDetails = () => {
    if (selectedParticipants.length === 0) return;

    // Configurar os participantes no formulário
    const participantsData = selectedParticipants.map(id => ({
      participantId: id,
      isIncluded: true,
      amount: 0,
      percentage: 0,
      weight: 1,
    }));

    form.setValue('participants', participantsData);
    setCurrentStep('expense-details');
  };

  // Voltar para a seleção de participantes
  const goBackToParticipants = () => {
    setCurrentStep('select-participants');
  };

  // Manipular o carregamento de imagens
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Em um app real, enviaria para um servidor. Aqui, vamos criar URLs locais
    Array.from(files).forEach(file => {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImages(prev => [...prev, imageUrl]);
    });
  };

  // Remover imagem
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Abrir input de arquivo
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Enviar o formulário
  const onSubmit = (data: ExpenseFormValues) => {
    // Garantir que todos os participantId são definidos
    const validParticipants: SplitBillParticipantShare[] = data.participants.map(p => ({
      participantId: p.participantId,
      isIncluded: p.isIncluded,
      amount: p.amount,
      percentage: p.percentage,
      weight: p.weight,
    }));

    // Chamar a função addBill do contexto
    addBill({
      name: data.name,
      totalAmount: data.totalAmount,
      date: data.date,
      category: data.category,
      divisionMethod: data.divisionMethod,
      participants: validParticipants,
      status: 'active',
      // Em um app real, salvaria as imagens e notas
      // receiptImageUrl: uploadedImages[0], 
    });

    // Fechar o modal
    onClose();
  };

  // Obter valores observados do formulário
  const watchDivisionMethod = form.watch('divisionMethod');
  const watchParticipants = form.watch('participants');
  const watchTotalAmount = form.watch('totalAmount');
  const watchPaidBy = form.watch('paidBy');

  // Funções auxiliares para cálculos
  const getParticipantName = (id: string) => {
    const participant = participants.find(p => p.id === id);
    return participant?.name || "Participante";
  };

  // Calcular o total de percentual
  const totalPercentage = watchParticipants
    .filter(p => p.isIncluded)
    .reduce((sum, p) => sum + (p.percentage || 0), 0);

  // Calcular o total de valores fixos
  const totalFixedAmount = watchParticipants
    .filter(p => p.isIncluded)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Contar participantes incluídos
  const includedCount = watchParticipants.filter(p => p.isIncluded).length;

  // Calcular divisão igual
  const equalShare = includedCount > 0 ? watchTotalAmount / includedCount : 0;

  // Obter iniciais para os avatares
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'select-participants' ? 'Com quem você está dividindo?' : 'Detalhes da Despesa'}
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'select-participants' ? (
          <div className="space-y-4">
            <Command className="rounded-lg border shadow-md">
              <CommandInput 
                placeholder="Buscar contatos ou grupos..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>
                  {showAddParticipant ? (
                    <div className="flex items-center space-x-2 p-2">
                      <Input
                        placeholder="Nome do novo contato"
                        value={newParticipantName}
                        onChange={(e) => setNewParticipantName(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={addNewParticipant}>
                        Adicionar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setShowAddParticipant(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="p-2 text-center">
                      <p className="text-sm text-muted-foreground">
                        Nenhum resultado encontrado.
                      </p>
                      <Button 
                        variant="link" 
                        className="mt-1"
                        onClick={() => setShowAddParticipant(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> 
                        Adicionar novo contato
                      </Button>
                    </div>
                  )}
                </CommandEmpty>

                {filteredGroups.length > 0 && (
                  <CommandGroup heading="Grupos">
                    {filteredGroups.map(group => {
                      const groupParticipantIds = group.participants.map(p => p.id);
                      const allSelected = groupParticipantIds.every(id => selectedParticipants.includes(id));
                      const someSelected = groupParticipantIds.some(id => selectedParticipants.includes(id));
                      
                      return (
                        <CommandItem 
                          key={group.id}
                          onSelect={() => toggleGroup(group.id)}
                          className="flex items-center space-x-2"
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center 
                            ${allSelected ? 'bg-primary text-primary-foreground' : 'border'}`}
                          >
                            {allSelected && <Check className="h-3 w-3" />}
                            {someSelected && !allSelected && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                          </div>
                          <span>{group.name}</span>
                          <Badge className="ml-auto" variant="outline">
                            {group.participants.length} {group.participants.length === 1 ? 'pessoa' : 'pessoas'}
                          </Badge>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}

                {filteredParticipants.length > 0 && (
                  <CommandGroup heading="Contatos">
                    {filteredParticipants.map(participant => (
                      <CommandItem 
                        key={participant.id}
                        onSelect={() => toggleParticipant(participant.id)}
                        className="flex items-center space-x-2"
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center 
                          ${selectedParticipants.includes(participant.id) ? 'bg-primary text-primary-foreground' : 'border'}`}
                        >
                          {selectedParticipants.includes(participant.id) && <Check className="h-3 w-3" />}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-muted">
                            {getInitials(participant.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{participant.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>

            {selectedParticipants.length > 0 && (
              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Selecionados ({selectedParticipants.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedParticipants.map(id => {
                    const participant = participants.find(p => p.id === id);
                    if (!participant) return null;
                    
                    return (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {participant.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => toggleParticipant(id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={goToExpenseDetails}
                disabled={selectedParticipants.length === 0}
              >
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Despesa</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Jantar no restaurante" {...field} />
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
                              variant="outline"
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
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="paidBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pago por</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="1">Você</option>
                        {selectedParticipants.map(id => {
                          const participant = participants.find(p => p.id === id);
                          if (!participant || participant.id === '1') return null; // Não listar "Você" duas vezes
                          return (
                            <option key={participant.id} value={participant.id}>
                              {participant.name}
                            </option>
                          );
                        })}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <div className="space-y-2">
                <FormLabel>Participantes</FormLabel>
                <ScrollArea className="h-60 border rounded-md p-4">
                  <div className="space-y-4">
                    {form.watch('participants').map((participant, index) => {
                      const participantInfo = participants.find(p => p.id === participant.participantId);
                      if (!participantInfo) return null;

                      const isPayer = watchPaidBy === participantInfo.id;

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
                                        disabled={isPayer} // O pagador sempre deve estar incluído
                                      />
                                    </FormControl>
                                    <FormLabel className="font-medium cursor-pointer flex items-center space-x-2">
                                      <Avatar className="h-6 w-6 mr-2">
                                        <AvatarFallback className="text-xs">
                                          {getInitials(participantInfo.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{participantInfo.name}</span>
                                      {isPayer && (
                                        <Badge variant="outline" className="ml-2">
                                          Pagador
                                        </Badge>
                                      )}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {participant.isIncluded && (
                              <div className="text-sm">
                                {watchDivisionMethod === 'equal' && (
                                  <span>R$ {equalShare.toFixed(2).replace('.', ',')}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {participant.isIncluded && watchDivisionMethod !== 'equal' && (
                            <div className="mt-2 pl-6">
                              {watchDivisionMethod === 'fixed' && (
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

                              {watchDivisionMethod === 'percentage' && (
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

                              {watchDivisionMethod === 'weight' && (
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
                                          <div className="h-4 w-4 flex items-center justify-center">-</div>
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
                                          <div className="h-4 w-4 flex items-center justify-center">+</div>
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
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione detalhes relevantes sobre a despesa..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Adicionar Fotos (opcional)</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative h-24 w-24 overflow-hidden rounded-md">
                      <img src={image} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="h-24 w-24 flex flex-col items-center justify-center border-dashed"
                    onClick={triggerFileInput}
                  >
                    <Camera className="h-6 w-6 mb-1" />
                    <span className="text-xs">Adicionar</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={goBackToParticipants}>
                  Voltar
                </Button>
                <Button type="submit">Salvar Despesa</Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
