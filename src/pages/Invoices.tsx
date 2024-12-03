import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { InvoiceForm } from '../components/invoices/InvoiceForm';
import { InvoiceList } from '../components/invoices/InvoiceList/index';
import { InvoiceFilters } from '../components/invoices/InvoiceFilters';
import { useInvoiceStore } from '../stores/invoiceStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Toast } from '../components/ui/Toast';

export default function Invoices() {
  const [showNewInvoiceForm, setShowNewInvoiceForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending_partial');
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const { invoices, loading: invoicesLoading, error: invoicesError, fetchInvoices, addInvoice } = useInvoiceStore();
  const { settings, loading: settingsLoading, error: settingsError, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchInvoices();
    if (!settings) {
      fetchSettings();
    }
  }, [fetchInvoices, fetchSettings, settings]);

  const handleNewInvoice = async (data: any) => {
    try {
      if (!settings) {
        console.error('Les paramètres ne sont pas disponibles:', settings);
        throw new Error('Les paramètres ne sont pas disponibles');
      }

      console.log('Création d\'une nouvelle facture avec les paramètres:', {
        settings: settings,
        billingSettings: settings?.billing?.invoicing
      });

      await addInvoice(data);
      setShowNewInvoiceForm(false);
      setToast({
        type: 'success',
        message: 'Facture créée avec succès'
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur lors de la création de la facture'
      });
    }
  };

  const filteredInvoices = invoices
    .filter(invoice => {
      const matchesSearch = 
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' ? true :
        filterStatus === 'pending_partial' ? 
          (invoice.status === 'pending' || invoice.status === 'partial') :
          invoice.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (invoicesLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (invoicesError || settingsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">{invoicesError || settingsError}</p>
        <button 
          onClick={() => {
            fetchInvoices();
            fetchSettings();
          }}
          className="text-blue-500 hover:text-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-500">Gérez vos factures et suivez les paiements</p>
        </div>
        <button 
          onClick={() => setShowNewInvoiceForm(true)}
          className="btn btn-primary flex items-center gap-2"
          disabled={!settings}
        >
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <InvoiceFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        <InvoiceList invoices={filteredInvoices} />
      </div>

      {showNewInvoiceForm && (
        <InvoiceForm
          onSubmit={handleNewInvoice}
          onCancel={() => setShowNewInvoiceForm(false)}
        />
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}