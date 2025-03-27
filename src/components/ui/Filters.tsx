import React from 'react';
import { Filter, X, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FilterOption {
  value: string;
  label: string;
  color?: string;
}

interface FiltersProps {
  filter: string | null;
  searchTerm: string;
  isAdvancedFilterOpen: boolean;
  setIsAdvancedFilterOpen: (open: boolean) => void;
  setSearchTerm: (term: string) => void;
  handleSetFilter: (filter: string) => void;
  handleClearFilter: () => void;
  hasActiveFilters: boolean;

  // Customization props
  searchPlaceholder?: string;
  filterLabel?: string;
  advancedFiltersLabel?: string;
  clearFiltersLabel?: string;
  showAdvancedFilters?: boolean;
  showSearch?: boolean;
  filterOptions: FilterOption[];

  // The advanced filters content component
  advancedFiltersContent?: React.ReactNode;
}

const Filters: React.FC<FiltersProps> = ({
  filter,
  searchTerm,
  isAdvancedFilterOpen,
  setIsAdvancedFilterOpen,
  setSearchTerm,
  handleSetFilter,
  handleClearFilter,
  hasActiveFilters,

  // Default values for customization
  searchPlaceholder = "Buscar...",
  filterLabel = "Filtrar por:",
  advancedFiltersLabel = "Filtros Avançados",
  clearFiltersLabel = "Limpar filtros",
  showAdvancedFilters = true,
  showSearch = true,
  filterOptions,

  advancedFiltersContent
}) => {
  return (
    <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Type Filter */}
        <div className="bg-accent p-2 rounded-lg flex items-center">
          <Filter size={16} className="mr-2 text-muted-foreground" />
          <span className="text-sm font-medium mr-2">{filterLabel}</span>

          <div className="flex gap-1">
            {filterOptions.map(option => (
              <button
                key={option.value}
                className={`px-3 py-1 text-xs font-medium rounded-md ${filter === option.value
                  ? option.color
                    ? `${option.color}`
                    : 'bg-primary text-primary-foreground'
                  : 'bg-background'
                  }`}
                onClick={() => handleSetFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        {showSearch && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              className="pl-10 w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                onClick={() => setSearchTerm('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Advanced Filter Button */}
        {showAdvancedFilters && advancedFiltersContent && (
          <Popover open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <SlidersHorizontal size={16} />
                <span>{advancedFiltersLabel}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-4">
              {advancedFiltersContent}
            </PopoverContent>
          </Popover>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            className="flex items-center gap-1 text-xs bg-background px-3 py-1 rounded-md border"
            onClick={handleClearFilter}
          >
            <span>{clearFiltersLabel}</span>
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Filters; 