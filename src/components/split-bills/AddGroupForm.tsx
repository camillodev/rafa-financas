
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const groupFormSchema = z.object({
  name: z.string().min(3, {
    message: 'O nome do grupo deve ter pelo menos 3 caracteres',
  }),
  selectedParticipantIds: z.array(z.string()).min(1, {
    message: 'Selecione pelo menos 1 participante',
  }),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

interface AddGroupFormProps {
  onSuccess: () => void;
}

export const AddGroupForm: React.FC<AddGroupFormProps> = ({ onSuccess }) => {
  const { participants, addGroup } = useSplitBills();
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantPhone, setNewParticipantPhone] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: '',
      selectedParticipantIds: [],
    },
  });

  const onSubmit = (data: GroupFormValues) => {
    const selectedParticipants = participants.filter(p => 
      data.selectedParticipantIds.includes(p.id)
    );
    
    addGroup({
      name: data.name,
      participants: selectedParticipants,
    });
    
    onSuccess();
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Grupo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Amigos do Bar" {...field} />
                </FormControl>
                <FormDescription>
                  Dê um nome para o grupo que ajude a identificá-lo facilmente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="selectedParticipantIds"
              render={() => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Participantes</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddParticipant(!showAddParticipant)}
                    >
                      {showAddParticipant ? (
                        <>Cancelar</>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" /> Adicionar Novo
                        </>
                      )}
                    </Button>
                  </div>

                  {showAddParticipant && (
                    <div className="p-4 border rounded-md mb-4 space-y-3">
                      <h4 className="font-medium">Adicionar Novo Participante</h4>
                      <div>
                        <label htmlFor="newName" className="text-sm font-medium">
                          Nome
                        </label>
                        <Input
                          id="newName"
                          value={newParticipantName}
                          onChange={(e) => setNewParticipantName(e.target.value)}
                          placeholder="Nome do participante"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label htmlFor="newPhone" className="text-sm font-medium">
                          Telefone (Opcional)
                        </label>
                        <Input
                          id="newPhone"
                          value={newParticipantPhone}
                          onChange={(e) => setNewParticipantPhone(e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label htmlFor="newEmail" className="text-sm font-medium">
                          Email (Opcional)
                        </label>
                        <Input
                          id="newEmail"
                          value={newParticipantEmail}
                          onChange={(e) => setNewParticipantEmail(e.target.value)}
                          placeholder="email@exemplo.com"
                          className="mt-1"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          // Logic to add new participant would go here
                          setNewParticipantName('');
                          setNewParticipantPhone('');
                          setNewParticipantEmail('');
                          setShowAddParticipant(false);
                        }}
                        className="w-full"
                      >
                        Adicionar Participante
                      </Button>
                    </div>
                  )}

                  <FormDescription>
                    Selecione as pessoas que farão parte deste grupo.
                  </FormDescription>

                  <div className="border rounded-md mt-2">
                    {participants.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhum participante encontrado. Adicione um novo participante.
                      </div>
                    ) : (
                      <ScrollArea className="h-[200px]">
                        <div className="p-4 space-y-2">
                          {participants.map((participant) => (
                            <FormField
                              key={participant.id}
                              control={form.control}
                              name="selectedParticipantIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={participant.id}
                                    className="flex items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(participant.id)}
                                        onCheckedChange={(checked) => {
                                          const currentValue = [...(field.value || [])];
                                          if (checked) {
                                            field.onChange([...currentValue, participant.id]);
                                          } else {
                                            field.onChange(
                                              currentValue.filter((id) => id !== participant.id)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <div className="leading-none space-y-1">
                                      <FormLabel className="text-sm font-medium cursor-pointer">
                                        {participant.name}
                                      </FormLabel>
                                      {participant.phone && (
                                        <p className="text-xs text-muted-foreground">
                                          {participant.phone}
                                        </p>
                                      )}
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>

                  <div className="mt-2">
                    <FormLabel className="text-sm">Selecionados:</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {form.watch('selectedParticipantIds').length > 0 ? (
                        form.watch('selectedParticipantIds').map((id) => {
                          const participant = participants.find((p) => p.id === id);
                          return participant ? (
                            <Badge key={id} variant="outline" className="px-2 py-1">
                              {participant.name}
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => {
                                  const currentValue = form.getValues('selectedParticipantIds');
                                  form.setValue(
                                    'selectedParticipantIds',
                                    currentValue.filter((i) => i !== id)
                                  );
                                }}
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remover</span>
                              </Button>
                            </Badge>
                          ) : null;
                        })
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Nenhum participante selecionado
                        </span>
                      )}
                    </div>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancelar
            </Button>
            <Button type="submit">Criar Grupo</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
