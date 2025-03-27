import React, { useCallback, forwardRef } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface FiltersProps {
  filter: string;
  searchTerm: string;
  isAdvancedFilterOpen: boolean;
  setIsAdvancedFilterOpen: (open: boolean) => void;
  setSearchTerm: (term: string) => void;
  handleSetFilter: (filter: string) => void;
  handleClearFilter: () => void;
  hasActiveFilters: boolean;
  searchPlaceholder?: string;
  filterOptions: Array<{ value: string; label: string; color?: string }>;
  advancedFiltersContent: React.ReactNode;
}

// Criar um componente de botão que possa receber refs
const FilterButton = forwardRef<HTMLButtonElement, {
  hasActiveFilters: boolean,
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link',
  className?: string,
  children: React.ReactNode,
  onClick?: () => void
}>(({ hasActiveFilters, variant, className, children, onClick }, ref) => (
  <Button
    ref={ref}
    variant={variant}
    size="icon"
    className={className}
    onClick={onClick}
  >
    {children}
    {hasActiveFilters && (
      <Badge
        className="absolute -top-1 -right-1 w-2 h-2 p-0 rounded-full bg-primary"
        variant="secondary"
      />
    )}
  </Button>
));

FilterButton.displayName = 'FilterButton';

export default function Filters({
  filter,
  searchTerm,
  isAdvancedFilterOpen,
  setIsAdvancedFilterOpen,
  setSearchTerm,
  handleSetFilter,
  handleClearFilter,
  hasActiveFilters,
  searchPlaceholder = 'Pesquisar...',
  filterOptions,
  advancedFiltersContent
}: FiltersProps) {
  // Memoize callbacks
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);

  // Create a function to handle filter option click
  const getFilterOptionHandler = useCallback((optionValue: string) => {
    return () => handleSetFilter(optionValue);
  }, [handleSetFilter]);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          className="pl-8 max-w-lg"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-7 w-7 p-0 rounded-full"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpar busca</span>
          </Button>
        )}
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? 'secondary' : 'outline'}
            size="sm"
            className={
              filter === option.value && option.color
                ? `bg-${option.color}-100 text-${option.color}-700 hover:bg-${option.color}-200`
                : ''
            }
            onClick={getFilterOptionHandler(option.value)}
          >
            {option.label}
          </Button>
        ))}

        {/* Filtro avançado com popover e tooltip */}
        <TooltipProvider>
          <Tooltip>
            <Popover open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <FilterButton
                    hasActiveFilters={hasActiveFilters}
                    variant={hasActiveFilters ? 'secondary' : 'outline'}
                    className="relative"
                  >
                    <Filter className="h-4 w-4" />
                  </FilterButton>
                </PopoverTrigger>
              </TooltipTrigger>
              <PopoverContent align="end" className="w-80 sm:w-96 p-0">
                {advancedFiltersContent}
              </PopoverContent>
            </Popover>
            <TooltipContent side="bottom">
              <p>Filtros avançados</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Botão de limpar filtros com tooltip */}
        {hasActiveFilters && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearFilter}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Limpar filtros</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
} 