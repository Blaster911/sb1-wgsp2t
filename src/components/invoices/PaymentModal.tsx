import React, { useState, useEffect } from 'react';
import { X, CreditCard, Wallet, Banknote } from 'lucide-react';
import { Invoice } from '../../types/invoice';
import { usePaymentStore } from '../../stores/paymentStore';
import { useInvoiceStore } from '../../stores/invoiceStore';
import { Toast } from '../ui/Toast';

interface PaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onPaymentComplete?: () => Promise<void>;
}

export function PaymentModal({ invoice, onClose, onPaymentComplete }: PaymentModalProps) {
  const [method, setMethod] = useState<'card' | 'cash' | 'transfer'>('card');
  const [amount, setAmount] = useState(invoice.remainingAmount || 0);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { addPayment } = usePaymentStore();
  const { refreshInvoice } = useInvoiceStore();

  // Recalculer le montant restant à chaque fois que la facture change
  useEffect(() => {
    setAmount(invoice.remainingAmount || 0);
  }, [invoice.remainingAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice?.total) return;

    if (amount <= 0) {
      setToast({
        type: 'error',
        message: 'Le montant doit être supérieur à 0'
      });
      return;
    }

    const remainingAmount = invoice.remainingAmount || invoice.total - (invoice.paidAmount || 0);
    if (amount > remainingAmount) {
      setToast({
        type: 'error',
        message: 'Le montant ne peut pas dépasser le montant restant dû'
      });
      return;
    }

    setLoading(true);
    try {
      await addPayment({
        amount,
        method,
        reference: reference || `PAY-${Date.now()}`,
        notes,
        date: new Date().toISOString(),
        clientId: invoice.clientId,
        clientName: invoice.clientName,
        invoiceId: invoice.id
      });

      // Rafraîchir la facture pour mettre à jour les calculs
      await refreshInvoice(invoice.id);

      // Notifier le composant parent que le paiement est terminé
      if (onPaymentComplete) {
        await onPaymentComplete();
      }

      setToast({
        type: 'success',
        message: 'Paiement enregistré avec succès'
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Erreur lors de l\'enregistrement du paiement'
      });
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'card', icon: CreditCard, label: 'Carte bancaire' },
    { id: 'cash', icon: Wallet, label: 'Espèces' },
    { id: 'transfer', icon: Banknote, label: 'Virement' }
  ];

  const remainingAmount = invoice.remainingAmount || invoice.total - (invoice.paidAmount || 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Enregistrer un paiement</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Résumé de la facture */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">{invoice.number}</p>
              <p className="text-sm text-gray-600">Client : {invoice.clientName}</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Montant total :</span>
                  <span className="font-medium">
                    {invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Déjà payé :</span>
                  <span className="font-medium text-green-600">
                    {(invoice.paidAmount || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reste à payer :</span>
                  <span className="font-medium text-blue-600">
                    {remainingAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant du paiement
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="input pr-12"
                  max={remainingAmount}
                  min={0.01}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">EUR</span>
                </div>
              </div>
            </div>

            {/* Méthode de paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement
              </label>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map(({ id, icon: Icon, label }) => (
                  <label
                    key={id}
                    className={`
                      flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer
                      ${method === id 
                        ? 'border-blue-500 bg-blue-50 text-blue-600' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={id}
                      checked={method === id}
                      onChange={(e) => setMethod(e.target.value as any)}
                      className="sr-only"
                    />
                    <Icon className="w-6 h-6" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Référence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence (optionnel)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="input"
                placeholder="Numéro de transaction, chèque..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
                rows={3}
                placeholder="Informations complémentaires..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Traitement...' : 'Valider le paiement'}
            </button>
          </div>
        </form>

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