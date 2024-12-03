import React from 'react';
import { Bell, Mail, MessageSquare, AlertTriangle } from 'lucide-react';
import { SaveButton } from '../ui/SaveButton';

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  browser: boolean;
  notificationTypes: {
    newTicket: boolean;
    ticketUpdate: boolean;
    ticketComplete: boolean;
    lowStock: boolean;
    paymentReceived: boolean;
  };
}

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onSubmit: (data: NotificationSettings) => Promise<void>;
  isSaving: boolean;
}

const defaultSettings: NotificationSettings = {
  email: true,
  sms: false,
  browser: true,
  notificationTypes: {
    newTicket: true,
    ticketUpdate: true,
    ticketComplete: true,
    lowStock: true,
    paymentReceived: true
  }
};

export function NotificationSettings({ settings = defaultSettings, onSubmit, isSaving }: NotificationSettingsProps) {
  const [formData, setFormData] = React.useState<NotificationSettings>({
    ...defaultSettings,
    ...settings
  });

  const handleChange = (field: keyof NotificationSettings, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationTypeChange = (field: keyof typeof formData.notificationTypes, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  const notificationTypes = {
    newTicket: 'Nouveau ticket',
    ticketUpdate: 'Mise à jour de ticket',
    ticketComplete: 'Ticket terminé',
    lowStock: 'Stock faible',
    paymentReceived: 'Paiement reçu'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          Canaux de notification
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Notifications par email</p>
                <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.email}
                onChange={(e) => handleChange('email', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Notifications SMS</p>
                <p className="text-sm text-gray-500">Recevoir les notifications par SMS</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.sms}
                onChange={(e) => handleChange('sms', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Notifications navigateur</p>
                <p className="text-sm text-gray-500">Recevoir les notifications dans le navigateur</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.browser}
                onChange={(e) => handleChange('browser', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-blue-500" />
          Types de notifications
        </h2>

        <div className="space-y-4">
          {Object.entries(notificationTypes).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{label}</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.notificationTypes[key as keyof typeof formData.notificationTypes]}
                  onChange={(e) => handleNotificationTypeChange(
                    key as keyof typeof formData.notificationTypes,
                    e.target.checked
                  )}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <SaveButton
            onClick={handleSubmit}
            saving={isSaving}
            saved={false}
          />
        </div>
      </div>
    </div>
  );
}