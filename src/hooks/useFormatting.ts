import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UseFormattingReturn {
  /**
   * Format currency value to BRL
   */
  formatCurrency: (value: number) => string;

  /**
   * Format a date to a specific format with pt-BR locale
   */
  formatDate: (date: Date | string, formatStr?: string) => string;

  /**
   * Format a number with thousands separator
   */
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;

  /**
   * Format a percentage value
   */
  formatPercentage: (value: number, fractionDigits?: number) => string;
}

/**
 * Hook for common formatting operations
 */
export function useFormatting(): UseFormattingReturn {
  /**
   * Format a currency value to BRL
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  /**
   * Format a date with a specific format
   */
  const formatDate = (date: Date | string, formatStr = 'dd/MM/yyyy'): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, formatStr, { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  /**
   * Format a number with thousands separator
   */
  const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}): string => {
    return new Intl.NumberFormat('pt-BR', options).format(value);
  };

  /**
   * Format a percentage value
   */
  const formatPercentage = (value: number, fractionDigits = 2): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value / 100);
  };

  return {
    formatCurrency,
    formatDate,
    formatNumber,
    formatPercentage,
  };
} 