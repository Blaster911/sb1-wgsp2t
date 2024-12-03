import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Printer, FileCheck, Trash2, Loader2 } from 'lucide-react';
import { Quote } from '../../stores/quoteStore';
import { QuoteStatusBadge } from './QuoteStatusBadge';
import { DeleteQuoteModal } from './DeleteQuoteModal';
import { QuoteDetailsModal } from './QuoteDetailsModal';
import { useQuoteStore } from '../../stores/quoteStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Toast } from '../ui/Toast';
import { generateQuotePDF } from '../../utils/generateQuotePDF';
import { isAfter, parseISO } from 'date-fns';

interface QuoteListProps {
  quotes: Quote[];
}

export function QuoteList({ quotes }: QuoteListProps) {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { settings, loading: settingsLoading, error: settingsError, fetchSettings } = useSettingsStore();
  const { convertToInvoice } = useQuoteStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleGeneratePDF = async (e: React.MouseEvent, quote: Quote) => {
    e.stopPropagation();
    
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

  const handleConvertToInvoice = async (e: React.MouseEvent, quote: Quote) => {
    e.stopPropagation();
    try {
      await convertToInvoice(quote.id);
      setToast({
        type: 'success',
        message: 'Devis converti en facture avec succès'
      });
    } catch (error) {
      console.error('Error converting to invoice:', error);
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur lors de la conversion en facture'
      });
    }
  };

  const handleRowClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowDetailsModal(true);
  };

  if (!quotes.length) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun devis</h3>
        <p className="text-gray-500">Commencez par créer un nouveau devis</p>
      </div>
    );
  }

  return (
    <>
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
                Montant HT
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant TTC
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
            {quotes.map((quote) => (
              <tr
                key={quote.id}
                onClick={() => handleRowClick(quote)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {quote.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {quote.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(quote.date), 'dd/MM/yyyy', { locale: fr })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {quote.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {quote.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <QuoteStatusBadge status={quote.status} />
                 
                  {isAfter(new Date(), parseISO(quote.validUntil)) && quote.status === 'pending' && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Expiré</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => handleGeneratePDF(e, quote)}
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
                    
                    {quote.status === 'pending' && (
                      <button
                        onClick={(e) => handleConvertToInvoice(e, quote)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Convertir en facture"
                      >
                        <FileCheck className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuote(quote);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetailsModal && selectedQuote && (
        <QuoteDetailsModal
          quote={selectedQuote}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedQuote(null);
          }}
        />
      )}

      {showDeleteModal && selectedQuote && (
        <DeleteQuoteModal
          quote={selectedQuote}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedQuote(null);
          }}
        />
      )}

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