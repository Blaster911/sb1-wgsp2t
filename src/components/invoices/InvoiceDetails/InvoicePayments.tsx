import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Invoice } from '../../../types/invoice';

interface InvoicePaymentsProps {
  invoice: Invoice;
}

export function InvoicePayments({ invoice }: InvoicePaymentsProps) {
  if (!invoice.payments || invoice.payments.length === 0) {
    return null;
  }

  return (
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
            {invoice.payments.map((payment) => (
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
  );
}