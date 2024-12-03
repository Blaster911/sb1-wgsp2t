import React from 'react';
import { useClientStore } from '../../stores/clientStore';
import { Client } from '../../types/client';
import { Toast } from '../ui/Toast';

interface NewClientFormProps {
  onSubmit: (client: Client) => void;
  onCancel: () => void;
}

export function NewClientForm({ onSubmit, onCancel }: NewClientFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { addClient } = useClientStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const clientData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        joinDate: new Date().toISOString(),
        totalSpent: 0,
        totalTickets: 0,
        activeTickets: 0
      };

      // Ajouter le client à la base de données et récupérer l'ID généré
      const newClientRef = await addClient(clientData);

      // Créer l'objet client complet avec l'ID généré par Firebase
      const newClient: Client = {
        id: newClientRef.id, // Utiliser l'ID réel généré par Firebase
        ...clientData
      };

      setToast({
        type: 'success',
        message: 'Client ajouté avec succès'
      });

      // Passer le nouveau client au composant parent
      onSubmit(newClient);
    } catch (error) {
      console.error('Error adding client:', error);
      setToast({
        type: 'error',
        message: 'Erreur lors de l\'ajout du client'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            name="name"
            required
            className="input mt-1"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            required
            className="input mt-1"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            type="tel"
            name="phone"
            required
            className="input mt-1"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Adresse</label>
          <input
            type="text"
            name="address"
            required
            className="input mt-1"
            disabled={loading}
          />
        </div>
        <div className="col-span-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Ajout en cours...
              </span>
            ) : (
              'Ajouter le client'
            )}
          </button>
        </div>
      </form>

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