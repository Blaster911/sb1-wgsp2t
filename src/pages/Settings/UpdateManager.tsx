import React, { useState, useRef } from 'react';
import { Upload, AlertTriangle, FileUp } from 'lucide-react';
import { publishUpdate } from '../../utils/updateManager';
import { useUpdateStore } from '../../services/updateService';
import { Toast } from '../../components/ui/Toast';
import { uploadUpdateFile } from '../../utils/updateManager';

export function UpdateManager() {
  const { currentVersion } = useUpdateStore();
  const [version, setVersion] = useState('');
  const [changes, setChanges] = useState<string[]>(['']);
  const [mandatory, setMandatory] = useState(false);
  const [minVersion, setMinVersion] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddChange = () => {
    setChanges([...changes, '']);
  };

  const handleChangeUpdate = (index: number, value: string) => {
    const newChanges = [...changes];
    newChanges[index] = value;
    setChanges(newChanges);
  };

  const handleRemoveChange = (index: number) => {
    const newChanges = changes.filter((_, i) => i !== index);
    setChanges(newChanges);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/zip') {
      setSelectedFile(file);
    } else {
      setToast({
        type: 'error',
        message: 'Veuillez sélectionner un fichier ZIP'
      });
    }
  };

  const handlePublish = async () => {
    if (!version || changes.some(change => !change.trim())) {
      setToast({
        type: 'error',
        message: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    if (!selectedFile) {
      setToast({
        type: 'error',
        message: 'Veuillez sélectionner un fichier de mise à jour'
      });
      return;
    }

    setPublishing(true);
    try {
      // Upload du fichier de mise à jour
      const downloadUrl = await uploadUpdateFile(selectedFile, version);

      // Publication de la mise à jour
      await publishUpdate({
        version,
        mandatory,
        changes: changes.filter(change => change.trim()),
        minVersion: mandatory ? (minVersion || version) : undefined,
        downloadUrl
      });

      setToast({
        type: 'success',
        message: 'Mise à jour publiée avec succès'
      });

      // Réinitialiser le formulaire
      setVersion('');
      setChanges(['']);
      setMandatory(false);
      setMinVersion('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur lors de la publication'
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            Gestionnaire de mises à jour
          </h2>
          <p className="text-sm text-gray-500">
            Version actuelle : {currentVersion}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Version */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nouvelle version
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="ex: 1.1.0"
            className="input"
          />
          <p className="mt-1 text-xs text-gray-500">
            Utilisez le format semver (X.Y.Z)
          </p>
        </div>

        {/* Fichier de mise à jour */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fichier de mise à jour
          </label>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FileUp className="w-4 h-4" />
              {selectedFile ? 'Changer le fichier' : 'Sélectionner le fichier'}
            </button>
            {selectedFile && (
              <span className="text-sm text-gray-600">
                {selectedFile.name}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Le fichier doit être au format ZIP et contenir tous les fichiers de l'application
          </p>
        </div>

        {/* Liste des changements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Changements
          </label>
          <div className="space-y-2">
            {changes.map((change, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={change}
                  onChange={(e) => handleChangeUpdate(index, e.target.value)}
                  placeholder="Description du changement"
                  className="input flex-1"
                />
                {changes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveChange(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddChange}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            + Ajouter un changement
          </button>
        </div>

        {/* Options de mise à jour */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Mise à jour obligatoire</p>
              <p className="text-sm text-gray-500">
                Forcer la mise à jour pour tous les utilisateurs
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={mandatory}
                onChange={(e) => setMandatory(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {mandatory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version minimale requise
              </label>
              <input
                type="text"
                value={minVersion}
                onChange={(e) => setMinVersion(e.target.value)}
                placeholder={version}
                className="input w-48"
              />
              <p className="mt-1 text-xs text-gray-500">
                Les utilisateurs en dessous de cette version devront obligatoirement mettre à jour
              </p>
            </div>
          )}
        </div>

        {/* Avertissement */}
        {mandatory && (
          <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Attention</p>
              <p>
                Une mise à jour obligatoire forcera tous les utilisateurs à mettre à jour 
                leur application. Utilisez cette option avec précaution.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handlePublish}
            disabled={publishing || !selectedFile}
            className="btn btn-primary flex items-center gap-2"
          >
            {publishing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Publier la mise à jour
              </>
            )}
          </button>
        </div>
      </div>

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