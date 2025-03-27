import React from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Filters from '@/components/ui/Filters';
import AdvancedFiltersBuilder from '@/components/ui/AdvancedFiltersBuilder';
import MonthFilter from '@/components/ui/MonthFilter';
import { FilterField } from '@/components/ui/AdvancedFiltersBuilder';

interface TransactionHeaderProps {
  // Date navigation props
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;

  // Filter props
  filterValue: string;
  searchTerm: string;
  isAdvancedFilterOpen: boolean;
  setIsAdvancedFilterOpen: (open: boolean) => void;
  setSearchTerm: (term: string) => void;
  handleSetFilter: (filter: string) => void;
  handleClearFilter: () => void;
  hasActiveFilters: boolean;
  filterOptions: Array<{ value: string; label: string; color?: string }>;
  advancedFilterFields: FilterField[];
  handleAdvancedFilterChange: (field: string, value: string) => void;

  // Action props
  onAddTransaction: () => void;
  onExportTransactions: () => void;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  // Date navigation props
  currentDate,
  onPreviousMonth,
  onNextMonth,

  // Filter props
  filterValue,
  searchTerm,
  isAdvancedFilterOpen,
  setIsAdvancedFilterOpen,
  setSearchTerm,
  handleSetFilter,
  handleClearFilter,
  hasActiveFilters,
  filterOptions,
  advancedFilterFields,
  handleAdvancedFilterChange,

  // Action props
  onAddTransaction,
  onExportTransactions
}) => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
        <p className="text-muted-foreground mt-1">
          Visualize e gerencie todas as suas transações
        </p>
      </div>

      {/* Month Filter */}
      <MonthFilter
        currentDate={currentDate}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
        periodFilterActive={false}
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Filters
          filter={filterValue}
          searchTerm={searchTerm}
          isAdvancedFilterOpen={isAdvancedFilterOpen}
          setIsAdvancedFilterOpen={setIsAdvancedFilterOpen}
          setSearchTerm={setSearchTerm}
          handleSetFilter={handleSetFilter}
          handleClearFilter={handleClearFilter}
          hasActiveFilters={hasActiveFilters}
          searchPlaceholder="Buscar transações..."
          filterOptions={filterOptions}
          advancedFiltersContent={
            <AdvancedFiltersBuilder
              fields={advancedFilterFields}
              onChange={handleAdvancedFilterChange}
              onClear={handleClearFilter}
              onClose={() => setIsAdvancedFilterOpen(false)}
            />
          }
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={onAddTransaction} className="gap-1">
            <Plus size={16} />
            <span>Nova Transação</span>
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onExportTransactions}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default TransactionHeader; 