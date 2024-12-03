import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Client } from '../../types/client';
import { useClientStore } from '../../stores/clientStore';

interface DeleteClientModalProps {
  client: Client;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}

export function DeleteClientModal({ client, onConfirm, onCancel, isDeleting }: DeleteClientModalProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState(true);
  const [hasTickets, setHasTickets] = React.useState(false);
  const { hasActiveTickets } = useClientStore();

  React.useEffect(() => {
    const checkTickets = async () => {
      setChecking(true);
      setError(null);
      try {
        const hasActive = await hasActiveTickets(client.id);
        setHasTickets(hasActive);
      } catch (err) {
        setError("Erreur lors de la vérification des tickets. Veuillez réessayer.");
        setHasTickets(true); // Par sécurité, on suppose qu'il y a des tickets
      } finally {
        setChecking(false);
      }
    };

    checkTickets();
  }, [client.id, hasActiveTickets]);

  if (checking) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Vérification des tickets en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Supprimer le client
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error ? (
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-900 font-medium mb-2">
                Erreur de vérification
              </p>
              <p className="text-gray-600">
                {error}
              </p>
            </div>
          ) : hasTickets ? (
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-900 font-medium mb-2">
                Suppression impossible
              </p>
              <p className="text-gray-600">
                Ce client ne peut pas être supprimé car il a des tickets en cours.
                Veuillez d'abord clôturer tous ses tickets.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer le client suivant ?
              </p>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-500">{client.email}</p>
                <p className="text-sm text-gray-500">{client.phone}</p>
              </div>

              <p className="mt-4 text-sm text-red-600">
                Cette action est irréversible et supprimera toutes les données associées à ce client.
              </p>
            </>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isDeleting}
            >
              {error || hasTickets ? 'Fermer' : 'Annuler'}
            </button>
            {!hasTickets && !error && (
              <button
                onClick={onConfirm}
                disabled={isDeleting || hasTickets}
                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Suppression...
                  </>
                ) : (
                  'Supprimer'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}