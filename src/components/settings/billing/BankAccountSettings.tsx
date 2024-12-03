import React from 'react';
import { Building2 } from 'lucide-react';
import { SaveButton } from '../../ui/SaveButton';

interface BankAccountSettingsProps {
  settings: {
    name: string;
    iban: string;
    bic: string;
  };
  onSubmit: (data: any) => Promise<void>;
  isSaving: boolean;
}

export function BankAccountSettings({ settings, onSubmit, isSaving }: BankAccountSettingsProps) {
  const [formData, setFormData] = React.useState(settings);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          Coordonnées bancaires
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titulaire du compte
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input"
            placeholder="Nom du titulaire"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IBAN
          </label>
          <input
            type="text"
            value={formData.iban}
            onChange={(e) => handleChange('iban', e.target.value.toUpperCase())}
            className="input"
            placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BIC/SWIFT
          </label>
          <input
            type="text"
            value={formData.bic}
            onChange={(e) => handleChange('bic', e.target.value.toUpperCase())}
            className="input"
            placeholder="XXXXXXXX"
          />
        </div>
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