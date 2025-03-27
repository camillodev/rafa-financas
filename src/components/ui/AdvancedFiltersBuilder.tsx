import React from 'react';
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

const AdvancedFiltersBuilder: React.FC<AdvancedFiltersBuilderProps> = ({
  title = "Filtros Avançados",
  fields,
  onChange,
  onClear,
  onClose,
  applyButtonLabel = "Aplicar",
  clearButtonLabel = "Limpar Filtros"
}) => {
  const renderField = (field: FilterField) => {
    const id = `filter-${field.name}`;

    switch (field.type) {
      case 'select':
        return (
          <div className="space-y-1" key={field.name}>
            <Label htmlFor={id}>{field.label}</Label>
            <Select
              value={field.value}
              onValueChange={(value) => onChange(field.name, value)}
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
              onChange={(e) => onChange(field.name, e.target.value)}
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
              onChange={(e) => onChange(field.name, e.target.value)}
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
              onChange={(e) => onChange(field.name, e.target.value)}
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
                onChange={(e) => onChange(`${field.name}.start`, e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${id}-end`}>{`${field.label} Final`}</Label>
              <Input
                id={`${id}-end`}
                type="date"
                value={field.value.end}
                onChange={(e) => onChange(`${field.name}.end`, e.target.value)}
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
                onChange={(e) => onChange(`${field.name}.min`, e.target.value)}
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
                onChange={(e) => onChange(`${field.name}.max`, e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <h4 className="font-medium mb-4">{title}</h4>

      <div className="grid gap-4">
        {fields.map(renderField)}

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
};

export default AdvancedFiltersBuilder; 