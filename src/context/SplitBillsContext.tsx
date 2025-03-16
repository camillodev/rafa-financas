
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  SplitBillParticipant, 
  SplitBill, 
  SplitBillGroup, 
  SplitBillPayment,
  SplitBillDivisionMethod,
  SplitBillParticipantShare
} from '@/types/finance';

// Mock data
const mockParticipants: SplitBillParticipant[] = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 98765-4321' },
  { id: '2', name: 'Maria Oliveira', email: 'maria@email.com', phone: '(11) 91234-5678' },
  { id: '3', name: 'Pedro Santos', email: 'pedro@email.com', phone: '(11) 99876-5432' },
  { id: '4', name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 98765-1234' },
];

const mockGroups: SplitBillGroup[] = [
  { 
    id: '1', 
    name: 'Amigos do Bar', 
    participants: [mockParticipants[0], mockParticipants[1], mockParticipants[2]], 
    createdAt: new Date('2023-10-15'), 
    updatedAt: new Date('2023-10-15') 
  },
  { 
    id: '2', 
    name: 'Família', 
    participants: [mockParticipants[0], mockParticipants[3]], 
    createdAt: new Date('2023-09-01'), 
    updatedAt: new Date('2023-09-10') 
  },
];

const mockBills: SplitBill[] = [
  {
    id: '1',
    name: 'Jantar no Restaurante',
    totalAmount: 240.00,
    category: 'Alimentação',
    date: new Date('2023-10-20'),
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date('2023-10-20'),
    divisionMethod: 'equal',
    participants: [
      { participantId: '1', isIncluded: true },
      { participantId: '2', isIncluded: true },
      { participantId: '3', isIncluded: true },
    ],
    groupId: '1',
    status: 'active',
  },
  {
    id: '2',
    name: 'Conta de Internet',
    totalAmount: 120.00,
    category: 'Serviços',
    date: new Date('2023-10-05'),
    createdAt: new Date('2023-10-05'),
    updatedAt: new Date('2023-10-05'),
    divisionMethod: 'equal',
    participants: [
      { participantId: '1', isIncluded: true },
      { participantId: '3', isIncluded: true },
    ],
    status: 'active',
  },
  {
    id: '3',
    name: 'Supermercado',
    totalAmount: 350.00,
    category: 'Alimentação',
    date: new Date('2023-09-25'),
    createdAt: new Date('2023-09-25'),
    updatedAt: new Date('2023-09-25'),
    divisionMethod: 'percentage',
    participants: [
      { participantId: '1', percentage: 60, isIncluded: true },
      { participantId: '3', percentage: 40, isIncluded: true },
    ],
    status: 'completed',
  },
];

const mockPayments: SplitBillPayment[] = [
  {
    id: '1',
    splitBillId: '3',
    participantId: '3',
    amount: 140.00,
    date: new Date('2023-09-26'),
    notes: 'Pago via PIX',
  },
  {
    id: '2',
    splitBillId: '2',
    participantId: '3',
    amount: 60.00,
    date: new Date('2023-10-07'),
    notes: 'Pago em dinheiro',
  },
];

interface SplitBillsContextType {
  participants: SplitBillParticipant[];
  groups: SplitBillGroup[];
  bills: SplitBill[];
  payments: SplitBillPayment[];
  addParticipant: (participant: Omit<SplitBillParticipant, 'id'>) => void;
  updateParticipant: (participant: SplitBillParticipant) => void;
  deleteParticipant: (id: string) => void;
  addGroup: (group: Omit<SplitBillGroup, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGroup: (group: SplitBillGroup) => void;
  deleteGroup: (id: string) => void;
  addBill: (bill: Omit<SplitBill, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBill: (bill: SplitBill) => void;
  deleteBill: (id: string) => void;
  addPayment: (payment: Omit<SplitBillPayment, 'id'>) => void;
  deletePayment: (id: string) => void;
  completeBill: (id: string) => void;
  getParticipantById: (id: string) => SplitBillParticipant | undefined;
  getGroupById: (id: string) => SplitBillGroup | undefined;
  getBillById: (id: string) => SplitBill | undefined;
  getBillsByGroup: (groupId: string) => SplitBill[];
  getPaymentsByBill: (billId: string) => SplitBillPayment[];
  calculateParticipantShare: (bill: SplitBill, participantId: string) => number;
  getTotalToReceive: () => number;
  getTotalToPay: () => number;
  getBalanceTotal: () => number;
  getActiveBills: () => SplitBill[];
  getCompletedBills: () => SplitBill[];
}

const SplitBillsContext = createContext<SplitBillsContextType | undefined>(undefined);

export const useSplitBills = () => {
  const context = useContext(SplitBillsContext);
  if (!context) {
    throw new Error('useSplitBills must be used within a SplitBillsProvider');
  }
  return context;
};

export const SplitBillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [participants, setParticipants] = useState<SplitBillParticipant[]>(mockParticipants);
  const [groups, setGroups] = useState<SplitBillGroup[]>(mockGroups);
  const [bills, setBills] = useState<SplitBill[]>(mockBills);
  const [payments, setPayments] = useState<SplitBillPayment[]>(mockPayments);

  // Participants CRUD
  const addParticipant = (participant: Omit<SplitBillParticipant, 'id'>) => {
    const newParticipant = {
      ...participant,
      id: Date.now().toString(),
    };
    setParticipants([...participants, newParticipant]);
    toast.success('Participante adicionado com sucesso');
  };

  const updateParticipant = (participant: SplitBillParticipant) => {
    setParticipants(participants.map(p => p.id === participant.id ? participant : p));
    toast.success('Participante atualizado com sucesso');
  };

  const deleteParticipant = (id: string) => {
    // Check if participant is used in any bill
    const participantInUse = bills.some(bill => 
      bill.participants.some(p => p.participantId === id)
    );

    if (participantInUse) {
      toast.error('Não é possível excluir este participante pois está associado a uma ou mais contas');
      return;
    }

    // Check if participant is in any group
    const participantInGroup = groups.some(group => 
      group.participants.some(p => p.id === id)
    );

    if (participantInGroup) {
      toast.error('Não é possível excluir este participante pois está associado a um ou mais grupos');
      return;
    }

    setParticipants(participants.filter(p => p.id !== id));
    toast.success('Participante excluído com sucesso');
  };

  // Groups CRUD
  const addGroup = (group: Omit<SplitBillGroup, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGroup = {
      ...group,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setGroups([...groups, newGroup]);
    toast.success('Grupo adicionado com sucesso');
  };

  const updateGroup = (group: SplitBillGroup) => {
    const updatedGroup = {
      ...group,
      updatedAt: new Date(),
    };
    setGroups(groups.map(g => g.id === group.id ? updatedGroup : g));
    toast.success('Grupo atualizado com sucesso');
  };

  const deleteGroup = (id: string) => {
    // Check if group is used in any bill
    const groupInUse = bills.some(bill => bill.groupId === id);

    if (groupInUse) {
      toast.error('Não é possível excluir este grupo pois está associado a uma ou mais contas');
      return;
    }

    setGroups(groups.filter(g => g.id !== id));
    toast.success('Grupo excluído com sucesso');
  };

  // Bills CRUD
  const addBill = (bill: Omit<SplitBill, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Ensure all participant shares have the required properties
    const validatedParticipants: SplitBillParticipantShare[] = bill.participants.map(p => ({
      participantId: p.participantId, // This must be provided
      isIncluded: p.isIncluded,
      amount: p.amount,
      percentage: p.percentage,
      weight: p.weight,
    }));

    const newBill = {
      ...bill,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      participants: validatedParticipants,
    };
    
    setBills([...bills, newBill]);
    toast.success('Conta adicionada com sucesso');
  };

  const updateBill = (bill: SplitBill) => {
    // Ensure all participant shares have the required properties
    const validatedParticipants: SplitBillParticipantShare[] = bill.participants.map(p => ({
      participantId: p.participantId, // This must be provided
      isIncluded: p.isIncluded,
      amount: p.amount,
      percentage: p.percentage,
      weight: p.weight,
    }));

    const updatedBill = {
      ...bill,
      updatedAt: new Date(),
      participants: validatedParticipants,
    };
    
    setBills(bills.map(b => b.id === bill.id ? updatedBill : b));
    toast.success('Conta atualizada com sucesso');
  };

  const deleteBill = (id: string) => {
    // Delete related payments as well
    setPayments(payments.filter(p => p.splitBillId !== id));
    setBills(bills.filter(b => b.id !== id));
    toast.success('Conta excluída com sucesso');
  };

  // Payments CRUD
  const addPayment = (payment: Omit<SplitBillPayment, 'id'>) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
    };
    setPayments([...payments, newPayment]);
    toast.success('Pagamento registrado com sucesso');
  };

  const deletePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
    toast.success('Pagamento excluído com sucesso');
  };

  // Bill status management
  const completeBill = (id: string) => {
    setBills(bills.map(b => b.id === id ? { ...b, status: 'completed' } : b));
    toast.success('Conta marcada como concluída');
  };

  // Getters
  const getParticipantById = (id: string) => participants.find(p => p.id === id);
  
  const getGroupById = (id: string) => groups.find(g => g.id === id);
  
  const getBillById = (id: string) => bills.find(b => b.id === id);
  
  const getBillsByGroup = (groupId: string) => bills.filter(b => b.groupId === groupId);
  
  const getPaymentsByBill = (billId: string) => payments.filter(p => p.splitBillId === billId);

  // Calculation functions
  const calculateParticipantShare = (bill: SplitBill, participantId: string): number => {
    // Check if participant is included in the bill
    const participant = bill.participants.find(p => p.participantId === participantId);
    if (!participant || !participant.isIncluded) return 0;

    // Get all included participants
    const includedParticipants = bill.participants.filter(p => p.isIncluded);
    
    switch (bill.divisionMethod) {
      case 'equal':
        return bill.totalAmount / includedParticipants.length;
      
      case 'fixed':
        return participant.amount || 0;
      
      case 'percentage':
        return bill.totalAmount * ((participant.percentage || 0) / 100);
      
      case 'weight':
        const totalWeight = includedParticipants.reduce((acc, p) => acc + (p.weight || 0), 0);
        return totalWeight > 0 ? bill.totalAmount * ((participant.weight || 0) / totalWeight) : 0;
      
      default:
        return 0;
    }
  };

  // Summary calculations
  const getTotalToReceive = (): number => {
    // This would calculate based on the user's participant ID in a real app
    // For demo, we'll assume the current user is participant ID 1
    const currentUserId = '1';
    
    return bills
      .filter(bill => bill.status === 'active')
      .reduce((total, bill) => {
        // If current user is not included, return the current total
        if (!bill.participants.some(p => p.participantId === currentUserId && p.isIncluded)) {
          return total;
        }

        // Calculate what each participant owes to the current user
        const totalReceivable = bill.participants
          .filter(p => p.participantId !== currentUserId && p.isIncluded)
          .reduce((sum, participant) => {
            return sum + calculateParticipantShare(bill, participant.participantId);
          }, 0);

        return total + totalReceivable;
      }, 0);
  };

  const getTotalToPay = (): number => {
    // For demo, assume the current user is participant ID 1
    const currentUserId = '1';
    
    return bills
      .filter(bill => bill.status === 'active')
      .reduce((total, bill) => {
        // Calculate what the current user owes to others
        const participant = bill.participants.find(p => p.participantId === currentUserId);
        if (!participant || !participant.isIncluded) return total;
        
        return total + calculateParticipantShare(bill, currentUserId);
      }, 0);
  };

  const getBalanceTotal = (): number => {
    return getTotalToReceive() - getTotalToPay();
  };

  const getActiveBills = (): SplitBill[] => {
    return bills.filter(bill => bill.status === 'active');
  };

  const getCompletedBills = (): SplitBill[] => {
    return bills.filter(bill => bill.status === 'completed');
  };

  return (
    <SplitBillsContext.Provider
      value={{
        participants,
        groups,
        bills,
        payments,
        addParticipant,
        updateParticipant,
        deleteParticipant,
        addGroup,
        updateGroup,
        deleteGroup,
        addBill,
        updateBill,
        deleteBill,
        addPayment,
        deletePayment,
        completeBill,
        getParticipantById,
        getGroupById,
        getBillById,
        getBillsByGroup,
        getPaymentsByBill,
        calculateParticipantShare,
        getTotalToReceive,
        getTotalToPay,
        getBalanceTotal,
        getActiveBills,
        getCompletedBills
      }}
    >
      {children}
    </SplitBillsContext.Provider>
  );
};
