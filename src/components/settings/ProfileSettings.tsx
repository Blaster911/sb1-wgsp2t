import React from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Shield, Monitor, Globe } from 'lucide-react';
import { Settings } from '../../types/settings';

interface ProfileSettingsProps {
  settings: Settings;
  onSubmit: (data: Partial<Settings>) => Promise<void>;
  isSaving: boolean;
}

export function ProfileSettings({ settings, onSubmit, isSaving }: ProfileSettingsProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      profile: settings.profile || {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'admin',
        theme: 'system',
        language: 'fr'
      }
    }
  });

  const handleFormSubmit = (data: any) => {
    onSubmit({ profile: data.profile });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">Profil utilisateur</h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Prénom
              </div>
            </label>
            <input
              type="text"
              className="input"
              {...register('profile.firstName', { required: "Le prénom est requis" })}
            />
            {errors.profile?.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.profile.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Nom
              </div>
            </label>
            <input
              type="text"
              className="input"
              {...register('profile.lastName', { required: "Le nom est requis" })}
            />
            {errors.profile?.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.profile.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email
              </div>
            </label>
            <input
              type="email"
              className="input"
              {...register('profile.email', {
                required: "L'email est requis",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "L'adresse email est invalide"
                }
              })}
            />
            {errors.profile?.email && (
              <p className="mt-1 text-sm text-red-600">{errors.profile.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                Téléphone
              </div>
            </label>
            <input
              type="tel"
              className="input"
              {...register('profile.phone', { required: "Le téléphone est requis" })}
            />
            {errors.profile?.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.profile.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                Rôle
              </div>
            </label>
            <select
              className="input"
              {...register('profile.role', { required: "Le rôle est requis" })}
            >
              <option value="admin">Administrateur</option>
              <option value="manager">Manager</option>
              <option value="technician">Technicien</option>
            </select>
            {errors.profile?.role && (
              <p className="mt-1 text-sm text-red-600">{errors.profile.role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-gray-400" />
                Thème
              </div>
            </label>
            <select
              className="input"
              {...register('profile.theme')}
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="system">Système</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Langue
              </div>
            </label>
            <select
              className="input"
              {...register('profile.language')}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}