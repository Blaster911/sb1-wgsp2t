import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User } from 'lucide-react';
import { Client } from '../../types/client';
import { ClientSearch } from './ClientSearch';
import { NewClientForm } from './NewClientForm';
import { DeviceAutocomplete } from './DeviceAutocomplete';
import { useClientStore } from '../../stores/clientStore';

export interface TicketData {
  client: Client;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  devicePassword?: string;
  problem: string;
  priority: 'low' | 'medium' | 'high';
}

interface FormData {
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  devicePassword: string;
  problem: string;
  priority: 'low' | 'medium' | 'high';
}

export interface TicketFormProps {
  onSubmit: (data: TicketData) => Promise<void>;
  onCancel: () => void;
}

export function TicketForm({ onSubmit, onCancel }: TicketFormProps) {
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { initializeClients } = useClientStore();

  useEffect(() => {
    initializeClients();
  }, [initializeClients]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      deviceType: '',
      deviceBrand: '',
      deviceModel: '',
      devicePassword: '',
      problem: '',
      priority: 'low',
    },
  });

  const deviceType = watch('deviceType');
  const deviceBrand = watch('deviceBrand');

  const handleFormSubmit = async (data: FormData) => {
    if (!selectedClient) {
      alert('Veuillez sélectionner ou créer un client');
      return;
    }

    try {
      await onSubmit({
        ...data,
        client: selectedClient,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Une erreur est survenue lors de la création du ticket');
    }
  };

  const handleNewClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      ...clientData,
    };
    setSelectedClient(newClient);
    setShowNewClientForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Section Client */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-500" />
          Client
        </h3>

        {showNewClientForm ? (
          <NewClientForm
            onSubmit={handleNewClient}
            onCancel={() => setShowNewClientForm(false)}
          />
        ) : (
          <ClientSearch
            onClientSelect={setSelectedClient}
            onNewClient={() => setShowNewClientForm(true)}
            selectedClient={selectedClient}
          />
        )}
      </div>

      {/* Device and Problem Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Section Appareil */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Appareil</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <DeviceAutocomplete
                type="deviceType"
                value={deviceType}
                onChange={(value) => setValue('deviceType', value)}
              />
              {errors.deviceType && (
                <p className="text-red-500 text-sm mt-1">Ce champ est requis</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marque
              </label>
              <DeviceAutocomplete
                type="deviceBrand"
                value={deviceBrand}
                onChange={(value) => setValue('deviceBrand', value)}
                dependsOn={{ deviceType }}
              />
              {errors.deviceBrand && (
                <p className="text-red-500 text-sm mt-1">Ce champ est requis</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Modèle
              </label>
              <DeviceAutocomplete
                type="deviceModel"
                value={watch('deviceModel')}
                onChange={(value) => setValue('deviceModel', value)}
                dependsOn={{ deviceType, deviceBrand }}
              />
              {errors.deviceModel && (
                <p className="text-red-500 text-sm mt-1">Ce champ est requis</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe appareil
              </label>
              <input
                type="text"
                className="input mt-1"
                placeholder="Optionnel"
                {...register('devicePassword')}
              />
            </div>
          </div>
        </div>

        {/* Section Problème */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Problème</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="input mt-1"
                rows={4}
                {...register('problem', { required: true })}
              />
              {errors.problem && (
                <p className="text-red-500 text-sm mt-1">Ce champ est requis</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priorité
              </label>
              <select className="input mt-1" {...register('priority')}>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Créer le ticket
          </button>
        </div>
      </form>
    </div>
  );
}