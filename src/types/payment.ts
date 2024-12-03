import { Invoice } from './invoice';

export type PaymentMethod = 'card' | 'cash' | 'transfer';
export type PaymentStatus = 'completed' | 'pending' | 'failed';

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  notes?: string;
  invoiceId: string;
  invoice?: Invoice;
  clientId: string;
  clientName: string;
}

export interface NewPayment {
  amount: number;
  method: PaymentMethod;
  reference: string;
  notes?: string;
  invoiceId: string;
  clientId: string;
  clientName: string;
}