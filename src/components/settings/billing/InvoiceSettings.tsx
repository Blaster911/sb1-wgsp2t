import React from 'react';
import { Receipt } from 'lucide-react';
import { SaveButton } from '../../ui/SaveButton';

interface InvoiceSettingsProps {
  settings: {
    autoNumbering: boolean;
    prefix: string;
    numberingFormat: 'date' | 'datetime' | 'increment';
    nextNumber: number;
    defaultDueDate: number;
    defaultPaymentTerms: string;
    defaultNotes: string;
    allowPartialPayments: boolean;
    allowDeposits: boolean;
    minDepositPercentage: number;
  };
  onSubmit: (data: any) => Promise<void>;
  isSaving: boolean;
}

export function InvoiceSettings({ settings, onSubmit, isSaving }: InvoiceSettingsProps) {
  const [formData, setFormData] = React.useState(settings);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium flex items-center gap-2">
          <Receipt className="w-4 h-4 text-gray-400" />
          Numérotation des factures
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Préfixe des factures
          </label>
          <input
            type="text"
            value={formData.prefix}
            onChange={(e) => handleChange('prefix', e.target.value)}
            className="input"
            placeholder="ex: FAC"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Format de numérotation
          </label>
          <select
            value={formData.numberingFormat}
            onChange={(e) => handleChange('numberingFormat', e.target.value)}
            className="input"
          >
            <option value="increment">Incrémental (FAC-000001)</option>
            <option value="date">Date (FAC-20240315-001)</option>
            <option value="datetime">Date et heure (FAC-20240315143022)</option>
          </select>
        </div>

        {formData.numberingFormat === 'increment' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prochain numéro
            </label>
            <input
              type="number"
              value={formData.nextNumber}
              onChange={(e) => handleChange('nextNumber', parseInt(e.target.value))}
              className="input"
              min="1"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Délai de paiement par défaut (jours)
          </label>
          <input
            type="number"
            value={formData.defaultDueDate}
            onChange={(e) => handleChange('defaultDueDate', parseInt(e.target.value))}
            className="input"
            min="0"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conditions de paiement par défaut
          </label>
          <input
            type="text"
            value={formData.defaultPaymentTerms}
            onChange={(e) => handleChange('defaultPaymentTerms', e.target.value)}
            className="input"
            placeholder="ex: Paiement à 30 jours"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes par défaut
          </label>
          <textarea
            value={formData.defaultNotes}
            onChange={(e) => handleChange('defaultNotes', e.target.value)}
            className="input"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Paiements partiels</p>
            <p className="text-sm text-gray-500">Autoriser les paiements partiels sur les factures</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.allowPartialPayments}
              onChange={(e) => handleChange('allowPartialPayments', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Acomptes</p>
            <p className="text-sm text-gray-500">Autoriser les acomptes sur les factures</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.allowDeposits}
              onChange={(e) => handleChange('allowDeposits', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {formData.allowDeposits && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pourcentage minimum d'acompte
            </label>
            <input
              type="number"
              value={formData.minDepositPercentage}
              onChange={(e) => handleChange('minDepositPercentage', parseInt(e.target.value))}
              className="input w-32"
              min="0"
              max="100"
            />
          </div>
        )}
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