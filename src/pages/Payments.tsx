import React, { useState, useEffect } from 'react';
import { Search, Filter, CreditCard } from 'lucide-react';
import { usePaymentStore } from '../stores/paymentStore';
import { PaymentList } from '../components/payments/PaymentList';
import { PaymentDetailsModal } from '../components/payments/PaymentDetailsModal';
import { PaymentFilters } from '../components/payments/PaymentFilters';
import { Payment } from '../types/payment';

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { payments, loading, error, fetchPayments } = usePaymentStore();

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
        <p className="text-gray-500">Suivez tous les paiements clients</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <PaymentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterMethod={filterMethod}
          onFilterChange={setFilterMethod}
        />

        <PaymentList 
          payments={filteredPayments}
          onPaymentClick={setSelectedPayment}
        />
      </div>

      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}