import React from 'react';
import { CreditCard, Wallet, Banknote } from 'lucide-react';
import { SaveButton } from '../../ui/SaveButton';

interface PaymentMethodSettingsProps {
  settings: {
    card: boolean;
    cash: boolean;
    transfer: boolean;
  };
  onSubmit: (data: any) => Promise<void>;
  isSaving: boolean;
}

export function PaymentMethodSettings({ settings, onSubmit, isSaving }: PaymentMethodSettingsProps) {
  const [formData, setFormData] = React.useState(settings);

  const handleChange = (method: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      [method]: enabled
    }));
  };

  const paymentMethods = [
    { id: 'card', icon: CreditCard, label: 'Carte bancaire' },
    { id: 'cash', icon: Wallet, label: 'Espèces' },
    { id: 'transfer', icon: Banknote, label: 'Virement bancaire' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-base font-medium">Moyens de paiement acceptés</h3>

      <div className="space-y-4">
        {paymentMethods.map(({ id, icon: Icon, label }) => (
          <div key={id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-gray-400" />
              <span className="font-medium">{label}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData[id]}
                onChange={(e) => handleChange(id, e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <SaveButton
          onClick={() => onSubmit(formData)}
          saving={isSaving}
          saved={false}
        />
      </div>
    </div>
  );
}