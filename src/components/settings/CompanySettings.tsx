import React from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Mail, Phone, MapPin, Receipt, Building } from 'lucide-react';
import { Settings } from '../../types/settings';
import { SaveButton } from '../ui/SaveButton';

interface CompanySettingsProps {
  settings: Settings;
  onSubmit: (data: Partial<Settings>) => Promise<void>;
  isSaving: boolean;
}

export function CompanySettings({ settings, onSubmit, isSaving }: CompanySettingsProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      companyName: settings.companyName,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      vatRate: settings.vatRate,
      siret: settings.siret
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-blue-500" />
        Informations de l'entreprise
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-400" />
              Nom de l'entreprise
            </label>
            <input
              type="text"
              className="input"
              {...register('companyName', { required: "Le nom de l'entreprise est requis" })}
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-gray-400" />
              Numéro SIRET
            </label>
            <input
              type="text"
              className="input"
              {...register('siret', { required: "Le numéro SIRET est requis" })}
            />
            {errors.siret && (
              <p className="mt-1 text-sm text-red-600">{errors.siret.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Email
            </label>
            <input
              type="email"
              className="input"
              {...register('email', {
                required: "L'email est requis",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "L'adresse email est invalide"
                }
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              Téléphone
            </label>
            <input
              type="tel"
              className="input"
              {...register('phone', { required: "Le téléphone est requis" })}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            Adresse
          </label>
          <input
            type="text"
            className="input"
            {...register('address', { required: "L'adresse est requise" })}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taux de TVA (%)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            className="input w-32"
            {...register('vatRate', {
              required: "Le taux de TVA est requis",
              min: {
                value: 0,
                message: "Le taux de TVA ne peut pas être négatif"
              },
              max: {
                value: 100,
                message: "Le taux de TVA ne peut pas dépasser 100%"
              }
            })}
          />
          {errors.vatRate && (
            <p className="mt-1 text-sm text-red-600">{errors.vatRate.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <SaveButton
            onClick={handleSubmit(onSubmit)}
            saving={isSaving}
            saved={false}
          />
        </div>
      </form>
    </div>
  );
}