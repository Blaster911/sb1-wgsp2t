import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { Invoice } from '../../../types/invoice';
import { InvoiceTable } from './InvoiceTable';
import { InvoiceModals } from './InvoiceModals';
import { Toast } from '../../ui/Toast';

interface InvoiceListProps {
  invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  if (!invoices.length) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture</h3>
        <p className="text-gray-500">Commencez par créer une nouvelle facture</p>
      </div>
    );
  }

  return (
    <>
      <InvoiceTable 
        invoices={invoices}
        onRowClick={handleRowClick}
        onShowPaymentModal={(invoice) => {
          setSelectedInvoice(invoice);
          setShowPaymentModal(true);
        }}
        onShowDeleteModal={(invoice) => {
          setSelectedInvoice(invoice);
          setShowDeleteModal(true);
        }}
        setToast={setToast}
      />

      <InvoiceModals
        selectedInvoice={selectedInvoice}
        showDetailsModal={showDetailsModal}
        showPaymentModal={showPaymentModal}
        showDeleteModal={showDeleteModal}
        onCloseDetails={() => {
          setShowDetailsModal(false);
          setSelectedInvoice(null);
        }}
        onClosePayment={() => {
          setShowPaymentModal(false);
          setSelectedInvoice(null);
        }}
        onCloseDelete={() => {
          setShowDeleteModal(false);
          setSelectedInvoice(null);
        }}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}