import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Invoice } from '../../types/invoice';
import { useInvoiceStore } from '../../stores/invoiceStore';
import { Toast } from '../ui/Toast';

interface DeleteInvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export function DeleteInvoiceModal({ invoice, onClose }: DeleteInvoiceModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { deleteInvoice } = useInvoiceStore();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteInvoice(invoice.id);
      setToast({
        type: 'success',
        message: 'Facture supprimée avec succès'
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setToast({
        type: 'error',
        message: 'Erreur lors de la suppression de la facture'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Supprimer la facture
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer la facture suivante ?
          </p>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">{invoice.number}</p>
            <p className="text-sm text-gray-500">Client : {invoice.clientName}</p>
            <p className="text-sm text-gray-500">
              Montant : {invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>

          <p className="mt-4 text-sm text-red-600">
            Cette action est irréversible.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </button>
          </div>
        </div>

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