import React, { useState } from 'react';
import { X, CreditCard, Wallet, Banknote } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Invoice } from '../../types/invoice';
import { usePaymentStore } from '../../stores/paymentStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Toast } from '../ui/Toast';

interface PaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
}

interface PaymentFormData {
  amount: number;
  method: 'card' | 'cash' | 'transfer';
  reference: string;
  type: 'deposit' | 'partial' | 'full';
  notes?: string;
}

export function PaymentModal({ invoice, onClose }: PaymentModalProps) {
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { settings } = useSettingsStore();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PaymentFormData>({
    defaultValues: {
      amount: invoice.remainingAmount,
      method: 'card',
      type: 'full',
      reference: `PAY-${Date.now()}`
    }
  });

  const paymentType = watch('type');
  const amount = watch('amount');

  // Calculer le montant minimum d'acompte
  const minDepositAmount = settings?.billing?.invoicing?.minDepositPercentage
    ? (invoice.total * settings.billing.invoicing.minDepositPercentage) / 100
    : 0;

  const validateAmount = (value: number) => {
    if (value <= 0) return "Le montant doit être supérieur à 0";
    if (value > invoice.remainingAmount) return "Le montant ne peut pas dépasser le montant restant dû";
    if (paymentType === 'deposit' && value < minDepositAmount) {
      return `L'acompte minimum doit être de ${minDepositAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
    }
    return true;
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as PaymentFormData['type'];
    setValue('type', type);
    if (type === 'full') {
      setValue('amount', invoice.remainingAmount);
    } else if (type === 'deposit') {
      setValue('amount', minDepositAmount);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await addPayment({
        ...data,
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        clientName: invoice.clientName,
        date: new Date().toISOString()
      });

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
    }
  };

  const paymentMethods = [
    { id: 'card', icon: CreditCard, label: 'Carte bancaire' },
    { id: 'cash', icon: Wallet, label: 'Espèces' },
    { id: 'transfer', icon: Banknote, label: 'Virement' }
  ];

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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
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
                    {invoice.paidAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reste à payer :</span>
                  <span className="font-medium text-blue-600">
                    {invoice.remainingAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Type de paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de paiement
              </label>
              <select
                className="input"
                {...register('type')}
                onChange={handleTypeChange}
              >
                <option value="full">Paiement complet</option>
                {settings?.billing?.invoicing?.allowPartialPayments && (
                  <option value="partial">Paiement partiel</option>
                )}
                {settings?.billing?.invoicing?.allowDeposits && invoice.status === 'pending' && (
                  <option value="deposit">Acompte</option>
                )}
               </select>
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
                  {...register('amount', { 
                    required: "Le montant est requis",
                    validate: validateAmount
                  })}
                  className="input pr-12"
                  min={paymentType === 'deposit' ? minDepositAmount : 0.01}
                  max={invoice.remainingAmount}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">EUR</span>
                </div>
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
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
                      ${watch('method') === id 
                        ? 'border-blue-500 bg-blue-50 text-blue-600' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      value={id}
                      {...register('method')}
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
                Référence
              </label>
              <input
                type="text"
                {...register('reference', { required: "La référence est requise" })}
                className="input"
                placeholder="Numéro de transaction, chèque..."
              />
              {errors.reference && (
                <p className="mt-1 text-sm text-red-600">{errors.reference.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                {...register('notes')}
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
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Valider le paiement
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