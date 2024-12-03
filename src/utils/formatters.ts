import { fr } from 'date-fns/locale';
import { format } from 'date-fns';

export const formatCurrency = (amount: number | undefined | null): string => {
  if (typeof amount !== 'number') return '0,00 €';
  return amount.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatDate = (date: string | undefined | null): string => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    return '-';
  }
};

export const formatDateTime = (date: string | undefined | null): string => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'Pp', { locale: fr });
  } catch (error) {
    return '-';
  }
};