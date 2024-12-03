import React from 'react';
import { Invoice } from '../../../types/invoice';
import { InvoiceDetailsModal } from '../InvoiceDetails';
import { PaymentModal } from '../PaymentModal';
import { DeleteInvoiceModal } from '../DeleteInvoiceModal';

interface InvoiceModalsProps {
  selectedInvoice: Invoice | null;
  showDetailsModal: boolean;
  showPaymentModal: boolean;
  showDeleteModal: boolean;
  onCloseDetails: () => void;
  onClosePayment: () => void;
  onCloseDelete: () => void;
}

export function InvoiceModals({
  selectedInvoice,
  showDetailsModal,
  showPaymentModal,
  showDeleteModal,
  onCloseDetails,
  onClosePayment,
  onCloseDelete
}: InvoiceModalsProps) {
  if (!selectedInvoice) return null;

  return (
    <>
      {showDetailsModal && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={onCloseDetails}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={onClosePayment}
        />
      )}

      {showDeleteModal && (
        <DeleteInvoiceModal
          invoice={selectedInvoice}
          onClose={onCloseDelete}
        />
      )}
    </>
  );
}