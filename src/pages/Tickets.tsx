import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTicketStore } from '../stores/ticketStore';
import { TicketList } from '../components/tickets/TicketList';
import { TicketForm, TicketData } from '../components/tickets/TicketForm';
import { TicketDetails } from '../components/tickets/TicketDetails';
import { Ticket, NewTicket } from '../types/ticket';

export default function Tickets() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const {
    tickets,
    loading,
    error,
    addTicket,
    updateTicket,
    deleteTicket,
    fetchTickets,
  } = useTicketStore();

  // Charger les tickets au montage du composant
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSubmit = async (data: TicketData) => {
    try {
      const newTicketData: NewTicket = {
        ...data,
        status: 'reception',
        ticketNumber: generateTicketNumber(), // Assurez-vous d'avoir cette fonction
        notes: [],
      };

      await addTicket(newTicketData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error submitting ticket:', error);
    }
  };

  const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `#REP${year}${month}${day}-${random}`;
  };

  const handleUpdateTicket = async (id: string, data: Partial<Ticket>) => {
    try {
      await updateTicket(id, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      await deleteTicket(id);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Une erreur est survenue lors du chargement des tickets
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-500">Gérez les demandes de réparation</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau ticket
        </button>
      </div>

      {isFormOpen ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Nouveau ticket de réparation
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <TicketForm
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      ) : (
        <TicketList tickets={tickets} onTicketClick={setSelectedTicket} />
      )}

      {selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdateTicket}
          onDelete={handleDeleteTicket}
        />
      )}
    </div>
  );
}
