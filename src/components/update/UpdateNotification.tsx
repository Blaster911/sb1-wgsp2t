import React from 'react';
import { Download, X } from 'lucide-react';
import { useUpdateStore } from '../../services/updateService';

export function UpdateNotification() {
  const { updateAvailable, latestVersion } = useUpdateStore();

  if (!updateAvailable || !latestVersion) {
    return null;
  }

  const handleUpdate = () => {
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-slide-in-bottom">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            Nouvelle version disponible
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Version {latestVersion.version} ({new Date(latestVersion.releaseDate).toLocaleDateString('fr-FR')})
          </p>
          {latestVersion.changes.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-700">Nouveautés :</p>
              <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                {latestVersion.changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={handleUpdate}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Mettre à jour
        </button>
      </div>
      {latestVersion.mandatory && (
        <div className="mt-2 p-2 bg-yellow-50 rounded-md">
          <p className="text-xs text-yellow-800">
            Cette mise à jour est obligatoire pour continuer à utiliser l'application.
          </p>
        </div>
      )}
    </div>
  );
}