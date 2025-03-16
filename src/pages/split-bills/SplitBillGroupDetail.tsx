
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Edit, 
  Trash, 
  Plus, 
  Calendar,
  MoreHorizontal 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import AppLayout from '@/components/layout/AppLayout';
import { SplitBillsProvider, useSplitBills } from '@/context/SplitBillsContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const SplitBillGroupDetailContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getGroupById,
    getBillsByGroup,
    deleteGroup,
    participants
  } = useSplitBills();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);

  if (!id) {
    navigate('/split-bills/groups');
    return null;
  }

  const group = getGroupById(id);
  
  if (!group) {
    navigate('/split-bills/groups');
    return null;
  }

  const groupBills = getBillsByGroup(id);

  const handleDeleteGroup = () => {
    deleteGroup(id);
    navigate('/split-bills/groups');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="mr-4" onClick={() => navigate('/split-bills/groups')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Grupo</CardTitle>
              <CardDescription>
                Criado em {format(group.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Participantes ({group.participants.length})
                </h3>
                
                {group.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between border-b pb-2 mb-2 last:border-0">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        {participant.phone && (
                          <p className="text-sm text-muted-foreground">{participant.phone}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Remover</Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-4 flex justify-between">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar Grupo
              </Button>
              
              <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="h-4 w-4 mr-2" />
                    Excluir Grupo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá excluir permanentemente este grupo. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteGroup}>Sim, excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Divisões do Grupo</h2>
            <Button onClick={() => setIsAddBillOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Divisão
            </Button>
          </div>

          {groupBills.length > 0 ? (
            <div className="space-y-4">
              {groupBills.map((bill) => (
                <Card key={bill.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Link to={`/split-bills/${bill.id}`} className="block p-4">
                      <div className="flex flex-col md:flex-row justify-between w-full">
                        <div className="space-y-1">
                          <div className="flex gap-2 items-center">
                            <h3 className="text-lg font-medium">{bill.name}</h3>
                            <Badge variant={bill.status === 'active' ? 'default' : 'secondary'}>
                              {bill.status === 'active' ? 'Ativa' : 'Concluída'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(bill.date, "dd/MM/yyyy")}
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 flex flex-col items-end justify-center">
                          <div className="text-xl font-semibold">
                            R$ {bill.totalAmount.toFixed(2).replace('.', ',')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {bill.divisionMethod === 'equal' && 'Divisão Igualitária'}
                            {bill.divisionMethod === 'fixed' && 'Valores Fixos'}
                            {bill.divisionMethod === 'percentage' && 'Porcentagens'}
                            {bill.divisionMethod === 'weight' && 'Por Pesos'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">Este grupo ainda não tem divisões de despesas.</p>
                <Button onClick={() => setIsAddBillOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Nova Divisão
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Participantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {group.participants.map((participant) => (
                  <Badge key={participant.id} variant="outline" className="px-2 py-1">
                    {participant.name}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Participante
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas do Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Divisões</p>
                  <p className="text-2xl font-bold">{groupBills.length}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total Dividido</p>
                  <p className="text-2xl font-bold">
                    R$ {groupBills.reduce((total, bill) => total + bill.totalAmount, 0).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SplitBillGroupDetail = () => (
  <SplitBillsProvider>
    <AppLayout>
      <SplitBillGroupDetailContent />
    </AppLayout>
  </SplitBillsProvider>
);

export default SplitBillGroupDetail;
