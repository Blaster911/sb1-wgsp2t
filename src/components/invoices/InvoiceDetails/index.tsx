import React, { useState, useEffect } from 'react';
import { X, Edit, Printer, CreditCard, Loader2 } from 'lucide-react';
import { Invoice } from '../../../types/invoice';
import { InvoiceHeader } from './InvoiceHeader';
import { InvoiceInfo } from './InvoiceInfo';
import { InvoiceItems } from './InvoiceItems';
import { InvoicePayments } from './InvoicePayments';
import { InvoiceNotes } from './InvoiceNotes';
import { EditInvoiceModal } from '../EditInvoiceModal';
import { PaymentModal } from '../PaymentModal';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useInvoiceStore } from '../../../stores/invoiceStore';
import { generateInvoicePDF } from '../../../utils/generateInvoicePDF';
import { Toast } from '../../ui/Toast';

interface InvoiceDetailsModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export function InvoiceDetailsModal({ invoice, onClose }: InvoiceDetailsModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { settings } = useSettingsStore();
  const { refreshInvoice } = useInvoiceStore();
  const [currentInvoice, setCurrentInvoice] = useState(invoice);

  // Rafraîchir les données de la facture quand nécessaire
  useEffect(() => {
    const refreshData = async () => {
      try {
        await refreshInvoice(invoice.id);
        setCurrentInvoice(invoice);
      } catch (error) {
        console.error('Error refreshing invoice:', error);
      }
    };
    refreshData();
  }, [invoice.id, refreshInvoice]);

  const handlePaymentComplete = async () => {
    try {
      await refreshInvoice(invoice.id);
      setShowPaymentModal(false);
      setToast({
        type: 'success',
        message: 'Paiement enregistré avec succès'
      });
    } catch (error) {
      console.error('Error refreshing after payment:', error);
      setToast({
        type: 'error',
        message: 'Erreur lors de la mise à jour des données'
      });
    }
  };

  const handleGeneratePDF = async () => {
    if (!settings) {
      setToast({
        type: 'error',
        message: 'Les paramètres ne sont pas disponibles'
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generateInvoicePDF(currentInvoice, settings);
      setToast({
        type: 'success',
        message: 'PDF généré avec succès'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur lors de la génération du PDF'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <InvoiceHeader
          invoice={currentInvoice}
          onEdit={() => setShowEditModal(true)}
          onGeneratePDF={handleGeneratePDF}
          onAddPayment={() => setShowPaymentModal(true)}
          onClose={onClose}
          isGeneratingPDF={isGeneratingPDF}
        />

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <InvoiceInfo invoice={currentInvoice} />
          <InvoiceItems invoice={currentInvoice} />
          <InvoicePayments invoice={currentInvoice} />
          <InvoiceNotes invoice={currentInvoice} />
        </div>

        {showEditModal && (
          <EditInvoiceModal
            invoice={currentInvoice}
            onClose={() => setShowEditModal(false)}
          />
        )}

        {showPaymentModal && (
          <PaymentModal
            invoice={currentInvoice}
            onClose={() => setShowPaymentModal(false)}
            onPaymentComplete={handlePaymentComplete}
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
    </div>
  );
}