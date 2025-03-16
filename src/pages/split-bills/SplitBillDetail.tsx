
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  Clock, 
  Share, 
  Edit, 
  Trash, 
  Plus, 
  Receipt, 
  Calendar,
  Users,
  CreditCard
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegisterPaymentForm } from '@/components/split-bills/RegisterPaymentForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const SplitBillDetailContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getBillById, 
    getParticipantById, 
    getGroupById, 
    calculateParticipantShare, 
    getPaymentsByBill,
    completeBill,
    deleteBill
  } = useSplitBills();
  const [showRegisterPaymentDialog, setShowRegisterPaymentDialog] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  if (!id) {
    navigate('/split-bills');
    return null;
  }

  const bill = getBillById(id);
  
  if (!bill) {
    navigate('/split-bills');
    return null;
  }

  const group = bill.groupId ? getGroupById(bill.groupId) : null;
  const payments = getPaymentsByBill(bill.id);

  const handleCompleteBill = () => {
    completeBill(bill.id);
  };

  const handleDeleteBill = () => {
    deleteBill(bill.id);
    navigate('/split-bills');
  };

  const openPaymentDialog = (participantId: string) => {
    setSelectedParticipantId(participantId);
    setShowRegisterPaymentDialog(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate total payments for each participant
  const participantPayments = bill.participants.reduce((acc, participant) => {
    const participantId = participant.participantId;
    const filteredPayments = payments.filter(payment => payment.participantId === participantId);
    const totalPaid = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOwed = calculateParticipantShare(bill, participantId);
    
    acc[participantId] = {
      totalPaid,
      totalOwed,
      remaining: totalOwed - totalPaid,
      payments: filteredPayments
    };
    
    return acc;
  }, {} as Record<string, { totalPaid: number; totalOwed: number; remaining: number; payments: any[] }>);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="mr-4" onClick={() => navigate('/split-bills')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{bill.name}</h1>
        <Badge className="ml-3" variant={bill.status === 'active' ? 'default' : 'secondary'}>
          {bill.status === 'active' ? (
            <><Clock className="h-3 w-3 mr-1" /> Ativa</>
          ) : (
            <><Check className="h-3 w-3 mr-1" /> Concluída</>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Divisão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Valor Total</h3>
                  <p className="text-2xl font-bold">R$ {bill.totalAmount.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Data</h3>
                  <p className="text-lg">
                    {format(bill.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Método de Divisão</h3>
                <p className="text-lg">
                  {bill.divisionMethod === 'equal' && 'Divisão Igualitária'}
                  {bill.divisionMethod === 'fixed' && 'Valores Fixos'}
                  {bill.divisionMethod === 'percentage' && 'Porcentagens'}
                  {bill.divisionMethod === 'weight' && 'Por Pesos'}
                </p>
              </div>
              
              {bill.category && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Categoria</h3>
                    <p className="text-lg">{bill.category}</p>
                  </div>
                </>
              )}
              
              {group && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Grupo</h3>
                    <Link to={`/split-bills/groups/${group.id}`} className="text-lg text-primary hover:underline flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {group.name}
                    </Link>
                  </div>
                </>
              )}
              
              {bill.receiptImageUrl && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Comprovante</h3>
                    <div className="mt-2">
                      <img 
                        src={bill.receiptImageUrl} 
                        alt="Comprovante" 
                        className="max-w-xs rounded-md border" 
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/50 p-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
              <div className="flex gap-2">
                {bill.status === 'active' && (
                  <Button variant="default" size="sm" onClick={handleCompleteBill}>
                    <Check className="h-4 w-4 mr-2" />
                    Marcar como Concluída
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá excluir permanentemente esta divisão e todos os seus registros de pagamento.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteBill}>Sim, excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>

          <Tabs defaultValue="participants">
            <TabsList>
              <TabsTrigger value="participants">Participantes</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="participants" className="mt-4 space-y-4">
              {bill.participants.filter(p => p.isIncluded).map((participant) => {
                const participantInfo = getParticipantById(participant.participantId);
                if (!participantInfo) return null;
                
                const paymentInfo = participantPayments[participant.participantId];
                const remainingAmount = paymentInfo.remaining;
                const isPaid = remainingAmount <= 0;
                
                return (
                  <Card key={participant.participantId}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(participantInfo.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{participantInfo.name}</p>
                            {participantInfo.phone && (
                              <p className="text-sm text-muted-foreground">{participantInfo.phone}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Parte</p>
                            <p className="font-medium">
                              R$ {paymentInfo.totalOwed.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Pago</p>
                            <p className="font-medium">
                              R$ {paymentInfo.totalPaid.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {remainingAmount > 0 ? 'Pendente' : 'Excedente'}
                            </p>
                            <p className={`font-medium ${remainingAmount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                              R$ {Math.abs(remainingAmount).toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                          
                          {bill.status === 'active' && (
                            <Button 
                              variant={isPaid ? "outline" : "default"}
                              size="sm"
                              onClick={() => openPaymentDialog(participant.participantId)}
                            >
                              {isPaid ? 'Adicionar Pagamento' : 'Registrar Pagamento'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
            
            <TabsContent value="payments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                  <CardDescription>Todos os pagamentos registrados para esta divisão</CardDescription>
                </CardHeader>
                <CardContent>
                  {payments.length > 0 ? (
                    <div className="space-y-4">
                      {payments.map((payment) => {
                        const participantInfo = getParticipantById(payment.participantId);
                        
                        return (
                          <div key={payment.id} className="flex justify-between items-center border-b pb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {participantInfo ? getInitials(participantInfo.name) : 'UN'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{participantInfo?.name || 'Usuário não encontrado'}</p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {format(payment.date, "dd/MM/yyyy")}
                                  {payment.notes && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span>{payment.notes}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">R$ {payment.amount.toFixed(2).replace('.', ',')}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Receipt className="mx-auto h-12 w-12 mb-4 opacity-20" />
                      <p>Nenhum pagamento registrado para esta divisão.</p>
                      {bill.status === 'active' && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setShowRegisterPaymentDialog(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Registrar Pagamento
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Status dos Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.keys(participantPayments).map((participantId) => {
                  const participantInfo = getParticipantById(participantId);
                  if (!participantInfo) return null;
                  
                  const paymentInfo = participantPayments[participantId];
                  const percentage = Math.min(100, (paymentInfo.totalPaid / paymentInfo.totalOwed) * 100);
                  
                  return (
                    <div key={participantId} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{participantInfo.name}</span>
                        <span>{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Compartilhar por WhatsApp
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Enviar Lembretes de Pagamento
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={showRegisterPaymentDialog} onOpenChange={setShowRegisterPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Registre um pagamento para esta divisão.
            </DialogDescription>
          </DialogHeader>
          <RegisterPaymentForm 
            billId={bill.id}
            selectedParticipantId={selectedParticipantId}
            onSuccess={() => setShowRegisterPaymentDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SplitBillDetail = () => (
  <SplitBillsProvider>
    <AppLayout>
      <SplitBillDetailContent />
    </AppLayout>
  </SplitBillsProvider>
);

export default SplitBillDetail;
