import React, { useState, useEffect } from 'react';
import { X, FileText, Printer, Edit, Loader2, FileCheck, AlertTriangle } from 'lucide-react';
import { Quote, useQuoteStore } from '../../stores/quoteStore';
import { QuoteStatusBadge } from './QuoteStatusBadge';
import { useSettingsStore } from '../../stores/settingsStore';
import { format, isAfter, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Toast } from '../ui/Toast';
import { generateQuotePDF } from '../../utils/generateQuotePDF';
import { EditQuoteModal } from './EditQuoteModal';

interface QuoteDetailsModalProps {
  quote: Quote;
  onClose: () => void;
}

export function QuoteDetailsModal({ quote, onClose }: QuoteDetailsModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { settings, loading: settingsLoading, error: settingsError, fetchSettings } = useSettingsStore();
  const { convertToInvoice, updateQuote } = useQuoteStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  const isQuoteExpired = (validUntil: string) => {
    return isAfter(new Date(), parseISO(validUntil));
  };
  
  const handleRejectQuote = async () => {
    try {
      await updateQuote(quote.id, {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
      
      setToast({
        type: 'success',
        message: 'Devis refusé avec succès'
      });
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error rejecting quote:', error);
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur lors du refus du devis'
      });
    }
  };
  
  const handleGeneratePDF = async () => {
    if (settingsLoading) {
      setToast({
        type: 'error',
        message: 'Chargement des paramètres en cours...'
      });
      return;
    }

    if (!settings) {
      setToast({
        type: 'error',
        message: 'Les paramètres ne sont pas disponibles'
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generateQuotePDF(quote, settings);
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

  const handleConvertToInvoice = async () => {
    try {
      await convertToInvoice(quote.id);
      setToast({
        type: 'success',
        message: 'Devis converti en facture avec succès'
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error converting to invoice:', error);
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur lors de la conversion en facture'
      });
    }
  };

  if (settingsLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="mt-2 text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-red-600">Erreur: {settingsError}</p>
          <button onClick={onClose} className="mt-4 btn btn-secondary">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold">Devis {quote.number}</h2>
              <div className="text-sm text-gray-500">
                Créé le {format(new Date(quote.date), 'dd/MM/yyyy', { locale: fr })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <QuoteStatusBadge status={quote.status} />
            {quote.status !== 'accepted' && (
              <button
                onClick={() => setShowEditModal(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
            )}
            {quote.status === 'pending' && (
              <button
                onClick={handleRejectQuote}
                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Refuser le devis
              </button>
            )}
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF || !settings}
              className="btn btn-secondary flex items-center gap-2"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  PDF
                </>
              )}
            </button>
            {quote.status === 'pending' && (
              <button
                onClick={handleConvertToInvoice}
                className="btn btn-primary flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                Convertir en facture
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
                <div className="font-medium">{quote.clientName}</div>
                <div className="text-sm text-gray-600">{quote.clientEmail}</div>
                {quote.clientAddress && (
                  <div className="text-sm text-gray-600 mt-2">{quote.clientAddress}</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Détails</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date d'émission</span>
                  <span className="font-medium">
                    {format(new Date(quote.date), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date de validité</span>
                  <span className="font-medium">
                    {format(new Date(quote.validUntil), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut</span>
                  <QuoteStatusBadge status={quote.status} />
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Qté
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Prix unit. HT
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Total HT
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quote.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.description}</div>
                        {item.reference && (
                          <div className="text-sm text-gray-500">Réf: {item.reference}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        {item.unitPrice.toLocaleString('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        })}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {(item.quantity * item.unitPrice).toLocaleString('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total HT</span>
                <span className="font-medium">
                  {quote.subtotal.toLocaleString('fr-FR', { 
                    style: 'currency', 
                    currency: 'EUR' 
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">TVA ({settings?.vatRate || 0}%)</span>
                <span className="font-medium">
                  {quote.tax.toLocaleString('fr-FR', { 
                    style: 'currency', 
                    currency: 'EUR' 
                  })}
                </span>
              </div>
              <div className="flex justify-between text-lg font-medium border-t border-gray-200 pt-2">
                <span>Total TTC</span>
                <span>
                  {quote.total.toLocaleString('fr-FR', { 
                    style: 'currency', 
                    currency: 'EUR' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{quote.notes}</p>
            </div>
          )}

          {/* Expiration Warning */}
          {isQuoteExpired(quote.validUntil) && quote.status === 'pending' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-medium">Ce devis a dépassé sa date de validité</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Modals */}
        {showEditModal && quote.status !== 'accepted' && (
          <EditQuoteModal
            quote={quote}
            onClose={() => setShowEditModal(false)}
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