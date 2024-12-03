import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Edit, Save, Loader2, Ticket } from 'lucide-react';
import { Client } from '../../types/client';
import { useClientStore } from '../../stores/clientStore';
import { useForm } from 'react-hook-form';

interface ClientDetailsModalProps {
  client: Client;
  onClose: () => void;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentClient, setCurrentClient] = useState(client);
  const { updateClient, clients } = useClientStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    defaultValues: {
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address
    }
  });

  useEffect(() => {
    const updatedClient = clients.find(c => c.id === client.id);
    if (updatedClient) {
      setCurrentClient(updatedClient);
    }
  }, [clients, client.id]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      await updateClient(client.id, data);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Erreur lors de la mise à jour du client");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="w-6 h-6 text-blue-500" />
            {isEditing ? 'Modifier le client' : 'Détails du client'}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Le nom est requis' })}
                  className="input w-full"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide'
                    }
                  })}
                  className="input w-full"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  {...register('phone', { required: 'Le téléphone est requis' })}
                  className="input w-full"
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <textarea
                  {...register('address', { required: 'L\'adresse est requise' })}
                  rows={3}
                  className="input w-full"
                  disabled={isSubmitting}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Informations personnelles
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{currentClient.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a
                        href={`mailto:${currentClient.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {currentClient.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a
                        href={`tel:${currentClient.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {currentClient.phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <span className="text-gray-900">{currentClient.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Statistiques
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Ticket className="w-4 h-4 text-blue-500" />
                          <div className="text-sm text-blue-600">Tickets actifs</div>
                        </div>
                        <div className="text-2xl font-semibold text-blue-700">
                          {currentClient.activeTickets}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Ticket className="w-4 h-4 text-gray-500" />
                          <div className="text-sm text-gray-600">Total tickets</div>
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">
                          {currentClient.totalTickets}
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">Total dépensé</div>
                      <div className="text-2xl font-semibold text-green-700">
                        {currentClient.totalSpent.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Informations complémentaires
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">
                    Client depuis le {new Date(currentClient.joinDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}