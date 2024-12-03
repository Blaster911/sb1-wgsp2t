import React from 'react';
import { Shield, Key, Smartphone, History, Lock } from 'lucide-react';
import { SaveButton } from '../ui/SaveButton';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordLastChanged: string;
  loginHistory: Array<{
    date: string;
    ip: string;
    device: string;
    location: string;
  }>;
  securityPreferences: {
    requirePasswordChange: number; // Nombre de jours
    sessionTimeout: number; // Minutes
    allowMultipleSessions: boolean;
    notifyUnusualLogin: boolean;
  };
}

interface SecuritySettingsProps {
  settings: SecuritySettings;
  onSubmit: (data: Partial<SecuritySettings>) => Promise<void>;
  isSaving: boolean;
}

export function SecuritySettings({ settings, onSubmit, isSaving }: SecuritySettingsProps) {
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [formData, setFormData] = React.useState(settings);

  const handlePreferenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      securityPreferences: {
        ...prev.securityPreferences,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          Sécurité du compte
        </h2>

        <div className="space-y-6">
          {/* Mot de passe */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Mot de passe</p>
                <p className="text-sm text-gray-500">
                  Dernière modification : {new Date(settings.passwordLastChanged).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              className="btn btn-secondary"
            >
              Modifier
            </button>
          </div>

          {/* Double authentification */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Double authentification</p>
                <p className="text-sm text-gray-500">
                  {settings.twoFactorEnabled ? 'Activée' : 'Désactivée'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.twoFactorEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Préférences de sécurité */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-500" />
          Préférences de sécurité
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Changement de mot de passe obligatoire
            </label>
            <select
              className="input"
              value={formData.securityPreferences.requirePasswordChange}
              onChange={(e) => handlePreferenceChange('requirePasswordChange', parseInt(e.target.value))}
            >
              <option value={30}>Tous les 30 jours</option>
              <option value={60}>Tous les 60 jours</option>
              <option value={90}>Tous les 90 jours</option>
              <option value={0}>Jamais</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration de session
            </label>
            <select
              className="input"
              value={formData.securityPreferences.sessionTimeout}
              onChange={(e) => handlePreferenceChange('sessionTimeout', parseInt(e.target.value))}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 heure</option>
              <option value={120}>2 heures</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Sessions multiples</p>
              <p className="text-sm text-gray-500">Autoriser plusieurs connexions simultanées</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.securityPreferences.allowMultipleSessions}
                onChange={(e) => handlePreferenceChange('allowMultipleSessions', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Historique de connexion */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-500" />
          Historique de connexion
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Appareil</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Localisation</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Adresse IP</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {settings.loginHistory.map((login, index) => (
                <tr key={index}>
                  <td className="py-3 text-sm">
                    {new Date(login.date).toLocaleString('fr-FR')}
                  </td>
                  <td className="py-3 text-sm">{login.device}</td>
                  <td className="py-3 text-sm">{login.location}</td>
                  <td className="py-3 text-sm">{login.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton
          onClick={() => onSubmit(formData)}
          saving={isSaving}
          saved={false}
        />
      </div>
    </div>
  );
}