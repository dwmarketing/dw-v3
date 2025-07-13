import { formatForDisplay, formatCurrency as libFormatCurrency, formatNumber as libFormatNumber, formatPercentage as libFormatPercentage } from './dateUtils';
import { translateStatus, translatePaymentMethod } from './locale';

/**
 * Formatadores padronizados para o padrão brasileiro
 */

/**
 * Formatar moeda em Real brasileiro
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
  return libFormatCurrency(value);
};

/**
 * Formatar números com separadores brasileiros
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return libFormatNumber(value);
};

/**
 * Formatar porcentagem com padrão brasileiro
 */
export const formatPercentage = (value: number | null | undefined, decimals = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return '0,0%';
  return libFormatPercentage(value, decimals);
};

/**
 * Formatar data para exibição brasileira
 */
export const formatDate = (
  date: Date | string | null | undefined, 
  formatType: 'date' | 'dateTime' | 'dateTimeSeconds' | 'time' | 'monthYear' | 'dayMonth' | 'weekDay' | 'month' | 'year' = 'date'
): string => {
  if (!date) return 'N/A';
  
  try {
    return formatForDisplay(date, formatType);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data inválida';
  }
};

/**
 * Formatar número de assinatura
 */
export const formatSubscriptionNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return `#${value}`;
};

/**
 * Formatar status de assinatura
 */
export const formatSubscriptionStatus = (status: string | null | undefined): string => {
  return translateStatus(status);
};

/**
 * Formatar método de pagamento
 */
export const formatPaymentMethod = (method: string | null | undefined): string => {
  return translatePaymentMethod(method);
};

/**
 * Formatar valor de crescimento com sinal
 */
export const formatGrowth = (value: number | null | undefined, decimals = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return '0,0%';
  
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatPercentage(value, decimals)}`;
};

/**
 * Formatar dados de contato do cliente
 */
export const formatCustomerInfo = (name: string | null | undefined, email: string | null | undefined): { name: string; email: string } => {
  return {
    name: name || 'Cliente não identificado',
    email: email || 'Email não disponível'
  };
};