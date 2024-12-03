import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Mail, Trash, Loader2 } from 'lucide-react';
import { ClientForm } from '../components/clients/ClientForm';
import { DeleteClientModal } from '../components/clients/DeleteClientModal';
import { ClientDetailsModal } from '../components/clients/ClientDetailsModal';
import { useClientStore } from '../stores/clientStore';
import { Toast } from '../components/ui/Toast';
import { Client } from '../types/client';

function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { clients, loading, error, initializeClients, addClient, deleteClient } = useClientStore();

  useEffect(() => {
    initializeClients();
  }, [initializeClients]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleNewClient = async (clientData: Omit<Client, 'id'>) => {
    try {
      await addClient(clientData);
      setShowNewClientForm(false);
      setToast({
        type: 'success',
        message: 'Client ajouté avec succès'
      });
    } catch (error) {
      console.error('Error adding client:', error);
      setToast({
        type: 'error',
        message: 'Erreur lors de l\'ajout du client'
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteClient(clientToDelete.id);
      
      if (result.success) {
        setToast({
          type: 'success',
          message: 'Client supprimé avec succès'
        });
        setClientToDelete(null);
      } else {
        setToast({
          type: 'error',
          message: result.error || 'Erreur lors de la suppression du client'
        });
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      setToast({
        type: 'error',
        message: 'Erreur lors de la suppression du client'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">Erreur lors du chargement des clients</p>
          <button 
            onClick={() => initializeClients()}
            className="text-blue-500 hover:text-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500">Gérez votre base clients</p>
        </div>
        <button 
          onClick={() => setShowNewClientForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Aucun résultat pour votre recherche' : 'Commencez par ajouter votre premier client'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">Client depuis le {new Date(client.joinDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setClientToDelete(client)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="w-4 h-4 mr-2" />
                    {client.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="w-4 h-4 mr-2" />
                    {client.phone}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total dépensé</p>
                    <p className="text-sm font-medium text-gray-900">
                      {client.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tickets</p>
                    <p className="text-sm font-medium text-gray-900">{client.ticketsCount}</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => setSelectedClient(client)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewClientForm && (
        <ClientForm
          onSubmit={handleNewClient}
          onCancel={() => setShowNewClientForm(false)}
        />
      )}

      {clientToDelete && (
        <DeleteClientModal
          client={clientToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setClientToDelete(null)}
          isDeleting={isDeleting}
        />
      )}

      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
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

export default Clients;