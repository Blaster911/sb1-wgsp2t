import React from 'react';
import { Invoice } from '../../../types/invoice';

interface InvoiceNotesProps {
  invoice: Invoice;
}

export function InvoiceNotes({ invoice }: InvoiceNotesProps) {
  if (!invoice.notes) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
      <p className="text-sm text-gray-600">{invoice.notes}</p>
    </div>
  );
}