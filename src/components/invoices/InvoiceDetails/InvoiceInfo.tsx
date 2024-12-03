import React from 'react';
import { User, Calendar } from 'lucide-react';
import { Invoice } from '../../../types/invoice';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InvoiceInfoProps {
  invoice: Invoice;
}

export function InvoiceInfo({ invoice }: InvoiceInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Client</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="font-medium">{invoice.clientName}</div>
          <div className="text-sm text-gray-600">{invoice.clientEmail}</div>
          {invoice.clientAddress && (
            <div className="text-sm text-gray-600 mt-2">{invoice.clientAddress}</div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Détails</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date d'émission</span>
            <span className="font-medium">
              {format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr })}
            </span>
          </div>
          {invoice.dueDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Échéance</span>
              <span className="font-medium">
                {format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: fr })}
              </span>
            </div>
          )}
          {invoice.paymentTerms && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Conditions de paiement</span>
              <span className="font-medium">{invoice.paymentTerms}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}