import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useQuoteStore } from '../stores/quoteStore';
import { QuoteList } from '../components/quotes/QuoteList';
import { QuoteForm } from '../components/quotes/QuoteForm';
import { QuoteFilters } from '../components/quotes/QuoteFilters';
import { Toast } from '../components/ui/Toast';

export default function Quotes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { quotes, loading, error, fetchQuotes, addQuote } = useQuoteStore();

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleNewQuote = async (data: any) => {
    try {
      await addQuote(data);
      setShowNewQuoteForm(false);
      setToast({
        type: 'success',
        message: 'Devis créé avec succès'
      });
    } catch (error) {
      console.error('Error creating quote:', error);
      setToast({
        type: 'error',
        message: 'Erreur lors de la création du devis'
      });
    }
  };

  const filteredQuotes = quotes
    .filter(quote => {
      const matchesSearch = 
        quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || quote.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Trier par date décroissante
      return new Date(b.date).getTime() - new Date(a.date).getTime();
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
        <p className="text-red-500 mb-2">{error}</p>
        <button 
          onClick={() => fetchQuotes()}
          className="text-blue-500 hover:text-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
          <p className="text-gray-500">Gérez vos devis clients</p>
        </div>
        <button 
          onClick={() => setShowNewQuoteForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau devis
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <QuoteFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        <QuoteList quotes={filteredQuotes} />
      </div>

      {showNewQuoteForm && (
        <QuoteForm
          onSubmit={handleNewQuote}
          onCancel={() => setShowNewQuoteForm(false)}
        />
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}