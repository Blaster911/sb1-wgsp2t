import React, { useState, useEffect } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { Client } from '../../types/client';
import { useClientStore } from '../../stores/clientStore';

interface ClientSearchProps {
  onClientSelect: (client: Client) => void;
  onNewClient: () => void;
  selectedClient: Client | null;
}

export function ClientSearch({ onClientSelect, onNewClient, selectedClient }: ClientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { clients, loading, initializeClients } = useClientStore();

  useEffect(() => {
    initializeClients();
  }, [initializeClients]);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleSelect = (client: Client) => {
    onClientSelect(client);
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
          />
          {showResults && searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Chargement...
                </div>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-start gap-3"
                    onClick={() => handleSelect(client)}
                  >
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-600">{client.email}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Aucun client trouvé
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onNewClient}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </button>
      </div>

      {selectedClient && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">{selectedClient.name}</p>
              <p className="text-sm text-gray-600">{selectedClient.email}</p>
              <p className="text-sm text-gray-600">{selectedClient.phone}</p>
              <p className="text-sm text-gray-600">{selectedClient.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}