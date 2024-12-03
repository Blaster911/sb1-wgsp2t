import React from 'react';
import { Palette, Image, QrCode, FileText } from 'lucide-react';
import { SaveButton } from '../../ui/SaveButton';

interface InvoiceTemplateSettings {
  defaultTemplate: 'modern' | 'classic';
  primaryColor: string;
  accentColor: string;
  showLogo: boolean;
  showWatermark: boolean;
  showPaymentQR: boolean;
  customHeader?: string;
  customFooter?: string;
}

interface InvoiceTemplateSettingsProps {
  settings: InvoiceTemplateSettings;
  onSubmit: (data: InvoiceTemplateSettings) => Promise<void>;
  isSaving: boolean;
}

export function InvoiceTemplateSettings({ settings, onSubmit, isSaving }: InvoiceTemplateSettingsProps) {
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
          <FileText className="w-4 h-4 text-gray-400" />
          Modèle de facture
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modèle par défaut
          </label>
          <select
            value={formData.defaultTemplate}
            onChange={(e) => handleChange('defaultTemplate', e.target.value)}
            className="input"
          >
            <option value="modern">Moderne</option>
            <option value="classic">Classique</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-400" />
                Couleur principale
              </div>
            </label>
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              className="h-10 w-20 rounded border border-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-400" />
                Couleur secondaire
              </div>
            </label>
            <input
              type="color"
              value={formData.accentColor}
              onChange={(e) => handleChange('accentColor', e.target.value)}
              className="h-10 w-20 rounded border border-gray-200"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium">Logo de l'entreprise</p>
              <p className="text-sm text-gray-500">Afficher le logo sur les factures</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.showLogo}
              onChange={(e) => handleChange('showLogo', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium">Filigrane</p>
              <p className="text-sm text-gray-500">Ajouter un filigrane sur les factures</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.showWatermark}
              onChange={(e) => handleChange('showWatermark', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <QrCode className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium">QR Code de paiement</p>
              <p className="text-sm text-gray-500">Ajouter un QR code pour faciliter le paiement</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.showPaymentQR}
              onChange={(e) => handleChange('showPaymentQR', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            En-tête personnalisé
          </label>
          <textarea
            value={formData.customHeader}
            onChange={(e) => handleChange('customHeader', e.target.value)}
            className="input"
            rows={3}
            placeholder="Texte à afficher dans l'en-tête des factures..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pied de page personnalisé
          </label>
          <textarea
            value={formData.customFooter}
            onChange={(e) => handleChange('customFooter', e.target.value)}
            className="input"
            rows={3}
            placeholder="Texte à afficher dans le pied de page des factures..."
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