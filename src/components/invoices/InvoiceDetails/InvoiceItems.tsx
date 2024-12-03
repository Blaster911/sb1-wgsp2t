import React from 'react';
import { Invoice } from '../../../types/invoice';

interface InvoiceItemsProps {
  invoice: Invoice;
}

export function InvoiceItems({ invoice }: InvoiceItemsProps) {
  return (
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
            {invoice.items?.map((item) => (
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

      <div className="flex justify-end mt-4">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sous-total HT</span>
            <span className="font-medium">
              {invoice.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">TVA ({invoice.vatRate}%)</span>
            <span className="font-medium">
              {invoice.vatAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
          <div className="flex justify-between text-lg font-medium border-t border-gray-200 pt-2">
            <span>Total TTC</span>
            <span>
              {invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
          {invoice.paidAmount > 0 && (
            <>
              <div className="flex justify-between text-sm text-green-600">
                <span>Déjà payé</span>
                <span>
                  {invoice.paidAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex justify-between text-sm text-blue-600 font-medium">
                <span>Reste à payer</span>
                <span>
                  {(invoice.total - invoice.paidAmount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}