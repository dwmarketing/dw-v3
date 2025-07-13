import { ptBR } from 'date-fns/locale';

/**
 * Configurações de localização brasileira
 */

export const BRAZILIAN_LOCALE = ptBR;
export const BRAZILIAN_TIMEZONE = 'America/Sao_Paulo';
export const BRAZILIAN_CURRENCY = 'BRL';

/**
 * Configurações de formatação brasileira para números
 */
export const BRAZILIAN_NUMBER_FORMAT = {
  locale: 'pt-BR',
  currency: 'BRL',
  options: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }
} as const;

/**
 * Configurações de formatação brasileira para datas
 */
export const BRAZILIAN_DATE_FORMATS = {
  short: 'dd/MM/yyyy',
  medium: 'dd/MM/yyyy HH:mm',
  long: 'dd/MM/yyyy HH:mm:ss',
  time: 'HH:mm',
  dayMonth: 'dd/MM',
  monthYear: 'MM/yyyy'
} as const;

/**
 * Mapa de status para português brasileiro
 */
export const STATUS_TRANSLATIONS = {
  // Status de assinatura
  'active': 'Ativa',
  'ativo': 'Ativa',
  'Active': 'Ativa',
  'Ativo': 'Ativa',
  'canceled': 'Cancelada',
  'cancelado': 'Cancelada',
  'Canceled': 'Cancelada',
  'Cancelado': 'Cancelada',
  'cancelled': 'Cancelada',
  'Cancelled': 'Cancelada',
  'suspended': 'Suspensa',
  'suspenso': 'Suspensa',
  'Suspended': 'Suspensa',
  'Suspenso': 'Suspensa',
  'pending': 'Pendente',
  'Pending': 'Pendente',
  'expired': 'Expirada',
  'expirado': 'Expirada',
  'Expired': 'Expirada',
  'Expirado': 'Expirada',
  'trial': 'Teste',
  'Trial': 'Teste',
  'paused': 'Pausada',
  'Paused': 'Pausada',
  
  // Status de pagamento
  'completed': 'Completo',
  'Completed': 'Completo',
  'failed': 'Falhou',
  'Failed': 'Falhou',
  'processing': 'Processando',
  'Processing': 'Processando',
  'refunded': 'Reembolsado',
  'Refunded': 'Reembolsado'
} as const;

/**
 * Mapa de métodos de pagamento para português brasileiro
 */
export const PAYMENT_METHOD_TRANSLATIONS = {
  'credit_card': 'Cartão de Crédito',
  'debit_card': 'Cartão de Débito',
  'pix': 'PIX',
  'bank_slip': 'Boleto Bancário',
  'boleto': 'Boleto',
  'bank_transfer': 'Transferência Bancária',
  'paypal': 'PayPal',
  'apple_pay': 'Apple Pay',
  'google_pay': 'Google Pay'
} as const;

/**
 * Função utilitária para traduzir status
 */
export const translateStatus = (status: string | null | undefined): string => {
  if (!status) return 'N/A';
  return STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS] || status;
};

/**
 * Função utilitária para traduzir métodos de pagamento
 */
export const translatePaymentMethod = (method: string | null | undefined): string => {
  if (!method) return 'N/A';
  return PAYMENT_METHOD_TRANSLATIONS[method as keyof typeof PAYMENT_METHOD_TRANSLATIONS] || method;
};