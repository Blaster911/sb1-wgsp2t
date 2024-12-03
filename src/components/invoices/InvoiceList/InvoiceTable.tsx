import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Printer, CreditCard, Trash2, Loader2 } from 'lucide-react';
import { Invoice } from '../../../types/invoice';
import { InvoiceStatusBadge } from '../InvoiceStatusBadge';
import { useSettingsStore } from '../../../stores/settingsStore';
import { generateInvoicePDF } from '../../../utils/generateInvoicePDF';

interface InvoiceTableProps {
  invoices: Invoice[];
  onRowClick: (invoice: Invoice) => void;
  onShowPaymentModal: (invoice: Invoice) => void;
  onShowDeleteModal: (invoice: Invoice) => void;
  setToast: (toast: { type: 'success' | 'error', message: string } | null) => void;
}

export function InvoiceTable({ 
  invoices, 
  onRowClick, 
  onShowPaymentModal, 
  onShowDeleteModal,
  setToast 
}: InvoiceTableProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { settings } = useSettingsStore();

  const handleGeneratePDF = async (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    
    if (!settings) {
      setToast({
        type: 'error',
        message: 'Les paramètres ne sont pas disponibles'
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generateInvoicePDF(invoice, settings);
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Numéro
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total TTC
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reste à payer
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {invoices.map((invoice) => {
            const remainingAmount = invoice.total - (invoice.paidAmount || 0);
            
            return (
              <tr
                key={invoice.id}
                onClick={() => onRowClick(invoice)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invoice.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={remainingAmount > 0 ? 'text-blue-600 font-medium' : 'text-green-600 font-medium'}>
                    {remainingAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => handleGeneratePDF(e, invoice)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Générer PDF"
                      disabled={isGeneratingPDF || !settings}
                    >
                      {isGeneratingPDF ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Printer className="w-4 h-4" />
                      )}
                    </button>
                    
                    {invoice.status !== 'paid' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowPaymentModal(invoice);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Enregistrer un paiement"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowDeleteModal(invoice);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}