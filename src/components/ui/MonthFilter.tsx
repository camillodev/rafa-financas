
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthFilterProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  periodFilterActive?: boolean;
}

const MonthFilter = ({ 
  currentDate, 
  onPreviousMonth, 
  onNextMonth,
  periodFilterActive = false
}: MonthFilterProps) => {
  // Format the month name with first letter capitalized
  const formattedMonth = format(currentDate, 'MMMM yyyy', { locale: ptBR })
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {!periodFilterActive && (
        <button 
          onClick={onPreviousMonth}
          className="p-1 rounded-full hover:bg-accent"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      
      <h2 className="text-lg font-medium">{formattedMonth}</h2>
      
      {!periodFilterActive && (
        <button 
          onClick={onNextMonth}
          className="p-1 rounded-full hover:bg-accent"
          aria-label="Próximo mês"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default MonthFilter;
