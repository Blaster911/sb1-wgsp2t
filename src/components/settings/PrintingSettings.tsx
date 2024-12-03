import React from 'react';
import { Printer, FileText, Settings2 } from 'lucide-react';
import { SaveButton } from '../ui/SaveButton';

interface PrintingSettings {
  defaultPrinter: string;
  paperSize: 'A4' | 'A5' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header: {
    enabled: boolean;
    height: number;
    includeCompanyLogo: boolean;
    includeCompanyInfo: boolean;
  };
  footer: {
    enabled: boolean;
    height: number;
    includePageNumber: boolean;
    customText: string;
  };
}

interface PrintingSettingsProps {
  settings: PrintingSettings;
  onSubmit: (data: PrintingSettings) => Promise<void>;
  isSaving: boolean;
}

export function PrintingSettings({ settings, onSubmit, isSaving }: PrintingSettingsProps) {
  const [formData, setFormData] = React.useState(settings);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMarginChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      margins: {
        ...prev.margins,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Printer className="w-5 h-5 text-blue-500" />
          Paramètres d'impression
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imprimante par défaut
            </label>
            <select
              className="input"
              value={formData.defaultPrinter}
              onChange={(e) => handleChange('defaultPrinter', e.target.value)}
            >
              <option value="printer1">Imprimante 1</option>
              <option value="printer2">Imprimante 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format de papier
            </label>
            <select
              className="input"
              value={formData.paperSize}
              onChange={(e) => handleChange('paperSize', e.target.value)}
            >
              <option value="A4">A4</option>
              <option value="A5">A5</option>
              <option value="Letter">Letter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orientation
            </label>
            <select
              className="input"
              value={formData.orientation}
              onChange={(e) => handleChange('orientation', e.target.value)}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Paysage</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Marges (mm)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(formData.margins).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1 capitalize">
                  {key}
                </label>
                <input
                  type="number"
                  className="input"
                  value={value}
                  onChange={(e) => handleMarginChange(key, parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          En-tête et pied de page
        </h2>

        <div className="space-y-6">
          {/* En-tête */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">En-tête</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.header.enabled}
                  onChange={(e) => handleChange('header', {
                    ...formData.header,
                    enabled: e.target.checked
                  })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {formData.header.enabled && (
              <div className="space-y-4 pl-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Hauteur (mm)
                  </label>
                  <input
                    type="number"
                    className="input w-32"
                    value={formData.header.height}
                    onChange={(e) => handleChange('header', {
                      ...formData.header,
                      height: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.header.includeCompanyLogo}
                      onChange={(e) => handleChange('header', {
                        ...formData.header,
                        includeCompanyLogo: e.target.checked
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Inclure le logo</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.header.includeCompanyInfo}
                      onChange={(e) => handleChange('header', {
                        ...formData.header,
                        includeCompanyInfo: e.target.checked
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Inclure les informations de l'entreprise</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Pied de page */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Pied de page</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.footer.enabled}
                  onChange={(e) => handleChange('footer', {
                    ...formData.footer,
                    enabled: e.target.checked
                  })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue- blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {formData.footer.enabled && (
              <div className="space-y-4 pl-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Hauteur (mm)
                  </label>
                  <input
                    type="number"
                    className="input w-32"
                    value={formData.footer.height}
                    onChange={(e) => handleChange('footer', {
                      ...formData.footer,
                      height: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.footer.includePageNumber}
                      onChange={(e) => handleChange('footer', {
                        ...formData.footer,
                        includePageNumber: e.target.checked
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Inclure la numérotation des pages</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Texte personnalisé
                  </label>
                  <textarea
                    className="input"
                    value={formData.footer.customText}
                    onChange={(e) => handleChange('footer', {
                      ...formData.footer,
                      customText: e.target.value
                    })}
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
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