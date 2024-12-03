import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Payment } from '../../types/payment';
import { usePaymentStore } from '../../stores/paymentStore';
import { Toast } from '../ui/Toast';

interface DeletePaymentModalProps {
  payment: Payment;
  onClose: () => void;
}

export function DeletePaymentModal({ payment, onClose }: DeletePaymentModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { deletePayment } = usePaymentStore();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deletePayment(payment.id);
      setToast({
        type: 'success',
        message: 'Paiement supprimé avec succès'
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error deleting payment:', error);
      setToast({
        type: 'error',
        message: 'Erreur lors de la suppression du paiement'
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
            Supprimer le paiement
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
            Êtes-vous sûr de vouloir supprimer ce paiement ?
          </p>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">Référence : {payment.reference}</p>
            <p className="text-sm text-gray-500">Client : {payment.clientName}</p>
            <p className="text-sm text-gray-500">
              Montant : {payment.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>

          <p className="mt-4 text-sm text-red-600">
            Cette action est irréversible et mettra à jour le solde de la facture associée.
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