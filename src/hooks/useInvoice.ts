import { useState, useEffect } from 'react';
import { invoicesService } from '../services/firestore/invoices';
import { Invoice } from '../types/invoice';
import { useSettingsStore } from '../stores/settingsStore';

export function useInvoice() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { settings, loading: settingsLoading, fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

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

  const calculateTotals = (items: any[]) => {
    if (!settings) {
      return {
        subtotal: 0,
        vatAmount: 0,
        total: 0,
        vatRate: 20 // Default VAT rate if settings not available
      };
    }

    const subtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const itemTotal = quantity * unitPrice;
      return sum + itemTotal;
    }, 0);

    const vatRate = settings.vatRate || 20;
    const vatAmount = (subtotal * vatRate) / 100;
    const total = subtotal + vatAmount;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
      vatRate
    };
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
    loading: loading || settingsLoading,
    error,
    settings,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    calculateTotals,
    refresh: loadInvoices
  };
}