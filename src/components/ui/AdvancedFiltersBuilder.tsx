import React, { useCallback, memo } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterField {
  type: 'select' | 'input' | 'date' | 'number' | 'dateRange' | 'numberRange';
  name: string;
  label: string;
  value: any;
  options?: Array<{ value: string; label: string; }>;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

interface AdvancedFiltersBuilderProps {
  title?: string;
  fields: FilterField[];
  onChange: (name: string, value: any) => void;
  onClear: () => void;
  onClose: () => void;
  applyButtonLabel?: string;
  clearButtonLabel?: string;
}

const AdvancedFiltersBuilder: React.FC<AdvancedFiltersBuilderProps> = memo(({
  title = "Filtros Avançados",
  fields,
  onChange,
  onClear,
  onClose,
  applyButtonLabel = "Aplicar",
  clearButtonLabel = "Limpar Filtros"
}) => {
  const renderField = useCallback((field: FilterField) => {
    const id = `filter-${field.name}`;

    // Create memoized change handlers for each field type
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field.name, e.target.value);
    }, [field.name, onChange]);

    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field.name, e.target.value);
    }, [field.name, onChange]);

    const handleNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field.name, e.target.value);
    }, [field.name, onChange]);

    const handleDateRangeStartChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(`${field.name}.start`, e.target.value);
    }, [field.name, onChange]);

    const handleDateRangeEndChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(`${field.name}.end`, e.target.value);
    }, [field.name, onChange]);

    const handleNumberRangeMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(`${field.name}.min`, e.target.value);
    }, [field.name, onChange]);

    const handleNumberRangeMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(`${field.name}.max`, e.target.value);
    }, [field.name, onChange]);

    const handleSelectChange = useCallback((value: string) => {
      onChange(field.name, value);
    }, [field.name, onChange]);

    switch (field.type) {
      case 'select':
        return (
          <div className="space-y-1" key={field.name}>
            <Label htmlFor={id}>{field.label}</Label>
            <Select
              value={field.value}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger id={id}>
                <SelectValue placeholder={field.placeholder || `Selecione ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'input':
        return (
          <div className="space-y-1" key={field.name}>
            <Label htmlFor={id}>{field.label}</Label>
            <Input
              id={id}
              value={field.value}
              placeholder={field.placeholder}
              onChange={handleInputChange}
              required={field.required}
            />
          </div>
        );

      case 'date':
        return (
          <div className="space-y-1" key={field.name}>
            <Label htmlFor={id}>{field.label}</Label>
            <Input
              id={id}
              type="date"
              value={field.value}
              onChange={handleDateChange}
              required={field.required}
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-1" key={field.name}>
            <Label htmlFor={id}>{field.label}</Label>
            <Input
              id={id}
              type="number"
              value={field.value}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step || 1}
              onChange={handleNumberChange}
              required={field.required}
            />
          </div>
        );

      case 'dateRange':
        return (
          <div className="grid grid-cols-2 gap-2" key={field.name}>
            <div className="space-y-1">
              <Label htmlFor={`${id}-start`}>{`${field.label} Inicial`}</Label>
              <Input
                id={`${id}-start`}
                type="date"
                value={field.value.start}
                onChange={handleDateRangeStartChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${id}-end`}>{`${field.label} Final`}</Label>
              <Input
                id={`${id}-end`}
                type="date"
                value={field.value.end}
                onChange={handleDateRangeEndChange}
              />
            </div>
          </div>
        );

      case 'numberRange':
        return (
          <div className="grid grid-cols-2 gap-2" key={field.name}>
            <div className="space-y-1">
              <Label htmlFor={`${id}-min`}>{`${field.label} Mínimo`}</Label>
              <Input
                id={`${id}-min`}
                type="number"
                placeholder={field.placeholder || "Mínimo"}
                min={field.min}
                max={field.max}
                step={field.step || 1}
                value={field.value.min}
                onChange={handleNumberRangeMinChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${id}-max`}>{`${field.label} Máximo`}</Label>
              <Input
                id={`${id}-max`}
                type="number"
                placeholder={field.placeholder || "Máximo"}
                min={field.min}
                max={field.max}
                step={field.step || 1}
                value={field.value.max}
                onChange={handleNumberRangeMaxChange}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [onChange]);

  return (
    <>
      <h4 className="font-medium mb-4">{title}</h4>

      <div className="grid gap-4">
        {fields.map(field => renderField(field))}

        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
          >
            {clearButtonLabel}
          </Button>
          <Button
            size="sm"
            onClick={onClose}
          >
            {applyButtonLabel}
          </Button>
        </div>
      </div>
    </>
  );
});

AdvancedFiltersBuilder.displayName = 'AdvancedFiltersBuilder';

export default AdvancedFiltersBuilder; 