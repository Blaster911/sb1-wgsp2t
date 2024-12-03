import { useState, useEffect } from 'react';
import { invoicesService } from '../services/firestore/invoices';
import { Invoice } from '../types/invoice';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await invoicesService.getAll();
      setInvoices(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
    try {
      const newInvoice = await invoicesService.add(invoiceData);
      setInvoices(prev => [...prev, newInvoice]);
      return newInvoice;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      await invoicesService.update(id, updates);
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? { ...invoice, ...updates } : invoice
      ));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await invoicesService.delete(id);
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    invoices,
    loading,
    error,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    refresh: loadInvoices
  };
}