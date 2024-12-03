import React, { useState, useEffect } from 'react';
import { X, Edit, Printer, CreditCard, Loader2, FileText } from 'lucide-react';
import { Invoice } from '../../types/invoice';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { useInvoiceStore } from '../../stores/invoiceStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Toast } from '../ui/Toast';
import { generateInvoicePDF } from '../../utils/generateInvoicePDF';
import { EditInvoiceModal } from './EditInvoiceModal';
import { PaymentModal } from './PaymentModal';

interface InvoiceDetailsModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export function InvoiceDetailsModal({ invoice, onClose }: InvoiceDetailsModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold">Facture {currentInvoice.number}</h2>
              <div className="text-sm text-gray-500">
                Créée le {format(new Date(currentInvoice.date), 'dd/MM/yyyy', { locale: fr })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <InvoiceStatusBadge status={currentInvoice.status} />
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            
            <button
              onClick={handleGeneratePDF}
              className="btn btn-secondary flex items-center gap-2"
              disabled={isGeneratingPDF || !settings}
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              PDF
            </button>

            {currentInvoice.status !== 'paid' && (
              <button
                onClick={() => setShowPaymentModal(true)}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Client Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Client</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium">{currentInvoice.clientName}</div>
                <div className="text-sm text-gray-600">{currentInvoice.clientEmail}</div>
                {currentInvoice.clientAddress && (
                  <div className="text-sm text-gray-600 mt-2">{currentInvoice.clientAddress}</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Détails</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date d'émission</span>
                  <span className="font-medium">
                    {format(new Date(currentInvoice.date), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>
                {currentInvoice.dueDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date d'échéance</span>
                    <span className="font-medium">
                      {format(new Date(currentInvoice.dueDate), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut</span>
                  <InvoiceStatusBadge status={currentInvoice.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Articles</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qté</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prix unit. HT</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentInvoice.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.description}</div>
                        {item.reference && (
                          <div className="text-sm text-gray-500">Réf: {item.reference}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        {item.unitPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {(item.quantity * item.unitPrice).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total HT</span>
                <span className="font-medium">
                  {currentInvoice.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">TVA ({currentInvoice.vatRate}%)</span>
                <span className="font-medium">
                  {currentInvoice.vatAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex justify-between text-lg font-medium border-t border-gray-200 pt-2">
                <span>Total TTC</span>
                <span>
                  {currentInvoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              {currentInvoice.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Déjà payé</span>
                    <span>
                      {currentInvoice.paidAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-600 font-medium">
                    <span>Reste à payer</span>
                    <span>
                      {(currentInvoice.total - currentInvoice.paidAmount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payments History */}
          {currentInvoice.payments && currentInvoice.payments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Historique des paiements</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentInvoice.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 text-sm">
                          {format(new Date(payment.date), 'dd/MM/yyyy', { locale: fr })}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {payment.method === 'card' ? 'Carte bancaire' :
                           payment.method === 'cash' ? 'Espèces' : 'Virement'}
                        </td>
                        <td className="px-4 py-3 text-sm">{payment.reference}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {payment.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {currentInvoice.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{currentInvoice.notes}</p>
            </div>
          )}
        </div>

        {/* Modals */}
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

        {/* Toast Notifications */}
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