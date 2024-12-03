import React from 'react';
import { X, CreditCard, User, Calendar, FileText, Wallet, Banknote } from 'lucide-react';
import { Payment } from '../../types/payment';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useInvoiceStore } from '../../stores/invoiceStore';

interface PaymentDetailsModalProps {
  payment: Payment;
  onClose: () => void;
}

export function PaymentDetailsModal({ payment, onClose }: PaymentDetailsModalProps) {
  const { invoices } = useInvoiceStore();
  const invoice = invoices.find(inv => inv.id === payment.invoiceId);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'cash':
        return <Wallet className="w-5 h-5 text-green-500" />;
      case 'transfer':
        return <Banknote className="w-5 h-5 text-purple-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-blue-500" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Carte bancaire';
      case 'cash':
        return 'Espèces';
      case 'transfer':
        return 'Virement';
      default:
        return method;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getMethodIcon(payment.method)}
            <div>
              <h2 className="text-xl font-semibold">Détails du paiement</h2>
              <div className="text-sm text-gray-500">
                Référence : {payment.reference}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Informations principales */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Client</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{payment.clientName}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Date et heure</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {format(new Date(payment.date), 'PPP à p', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails du paiement */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Montant</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-semibold text-gray-900">
                    {payment.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Méthode de paiement</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    {getMethodIcon(payment.method)}
                    <span>{getMethodLabel(payment.method)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Facture associée */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Facture associée</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{invoice?.number || 'N/A'}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {invoice ? format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr }) : ''}
                </span>
              </div>
              {invoice && (
                <div className="mt-2 text-sm text-gray-600">
                  Montant total : {invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">{payment.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}