export type InvoiceStatus = 'draft' | 'pending' | 'partial' | 'deposit' | 'paid' | 'overdue';

export interface InvoicePayment {
  id: string;
  date: string;
  amount: number;
  method: 'card' | 'cash' | 'transfer';
  reference: string;
  type: 'deposit' | 'partial' | 'full';
  notes?: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  depositAmount?: number;
  depositPercentage?: number;
  payments: InvoicePayment[];
  status: InvoiceStatus;
  paymentMethod?: string;
  notes?: string;
  paymentTerms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  reference?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}