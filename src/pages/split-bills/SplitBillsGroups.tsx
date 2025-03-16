
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { SplitBillsProvider, useSplitBills } from '@/context/SplitBillsContext';
import { AddGroupForm } from '@/components/split-bills/AddGroupForm';

const SplitBillsGroupsContent = () => {
  const { groups } = useSplitBills();
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grupos</h1>
          <p className="text-muted-foreground">
            Gerencie grupos de pessoas para dividir despesas com facilidade.
          </p>
        </div>
        <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
              <DialogDescription>
                Crie um grupo para facilitar a divisão de despesas entre as mesmas pessoas.
              </DialogDescription>
            </DialogHeader>
            <AddGroupForm onSuccess={() => setIsAddGroupOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar grupos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold">{group.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Opções</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/split-bills/groups/${group.id}`}>Ver detalhes</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Editar grupo</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Excluir grupo</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{group.participants.length} participantes</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Criado em {format(group.createdAt, "dd/MM/yyyy")}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {group.participants.slice(0, 3).map((participant) => (
                    <Badge key={participant.id} variant="outline" className="px-2 py-1">
                      {participant.name}
                    </Badge>
                  ))}
                  {group.participants.length > 3 && (
                    <Badge variant="outline" className="px-2 py-1">
                      +{group.participants.length - 3} mais
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 p-3">
                <div className="flex justify-between items-center w-full">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/split-bills/groups/${group.id}`}>Ver detalhes</Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Nova divisão
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            {searchQuery ? (
              <p className="text-muted-foreground mb-4">Nenhum grupo encontrado para a busca "{searchQuery}".</p>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">Você ainda não tem grupos criados.</p>
                <Button onClick={() => setIsAddGroupOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Grupo
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const SplitBillsGroups = () => (
  <SplitBillsProvider>
    <AppLayout>
      <SplitBillsGroupsContent />
    </AppLayout>
  </SplitBillsProvider>
);

export default SplitBillsGroups;
