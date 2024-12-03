import React, { useEffect } from 'react';
import { Building2, User, Bell, Shield, Printer, CreditCard, Upload } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { Toast } from '../components/ui/Toast';
import { CompanySettings } from '../components/settings/CompanySettings';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { PrintingSettings } from '../components/settings/PrintingSettings';
import { BillingSettings } from '../components/settings/BillingSettings';
import { UpdateManager } from './Settings/UpdateManager';

function Settings() {
  const { settings, loading, error, fetchSettings, updateSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = React.useState('company');
  const [toast, setToast] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      await updateSettings(data);
      setToast({
        type: 'success',
        message: 'Paramètres mis à jour avec succès'
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Erreur lors de la mise à jour des paramètres'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">{error}</p>
        <button 
          onClick={() => fetchSettings()}
          className="text-blue-500 hover:text-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'company', icon: Building2, label: 'Entreprise' },
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Shield, label: 'Sécurité' },
    { id: 'printing', icon: Printer, label: 'Impression' },
    { id: 'billing', icon: CreditCard, label: 'Facturation' },
    { id: 'updates', icon: Upload, label: 'Mises à jour' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500">Gérez les paramètres de votre entreprise</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu de navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center w-full px-4 py-2 text-sm rounded-lg transition-colors
                  ${tab.id === activeTab 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          {activeTab === 'company' && (
            <CompanySettings
              settings={settings}
              onSubmit={handleSubmit}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileSettings
              settings={settings}
              onSubmit={handleSubmit}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationSettings
              settings={settings.notifications}
              onSubmit={(data) => handleSubmit({ notifications: data })}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'security' && (
            <SecuritySettings
              settings={settings.security}
              onSubmit={(data) => handleSubmit({ security: data })}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'printing' && (
            <PrintingSettings
              settings={settings.printing}
              onSubmit={(data) => handleSubmit({ printing: data })}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'billing' && (
            <BillingSettings
              settings={settings}
              onSubmit={handleSubmit}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'updates' && (
            <UpdateManager />
          )}
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

export default Settings;