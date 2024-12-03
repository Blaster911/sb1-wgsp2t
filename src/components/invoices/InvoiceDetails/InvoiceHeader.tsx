import React from 'react';
import { X, Edit, Printer, CreditCard, Loader2 } from 'lucide-react';
import { Invoice } from '../../../types/invoice';
import { InvoiceStatusBadge } from '../InvoiceStatusBadge';

interface InvoiceHeaderProps {
  invoice: Invoice;
  onEdit: () => void;
  onGeneratePDF: () => void;
  onAddPayment: () => void;
  onClose: () => void;
  isGeneratingPDF: boolean;
}

export function InvoiceHeader({
  invoice,
  onEdit,
  onGeneratePDF,
  onAddPayment,
  onClose,
  isGeneratingPDF
}: InvoiceHeaderProps) {
  return (
    <div className="px-6 py-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold">Facture {invoice.number}</h2>
          <div className="text-sm text-gray-500">
            Créée le {new Date(invoice.date).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <InvoiceStatusBadge status={invoice.status} />
        
        <button
          onClick={onEdit}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Modifier
        </button>
        
        <button
          onClick={onGeneratePDF}
          className="btn btn-secondary flex items-center gap-2"
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Printer className="w-4 h-4" />
          )}
          PDF
        </button>

        {invoice.status !== 'paid' && (
          <button
            onClick={onAddPayment}
            className="btn btn-primary flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Paiement
          </button>
        )}
        
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}