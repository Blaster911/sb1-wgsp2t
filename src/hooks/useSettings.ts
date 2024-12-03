import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

export function useSettings() {
  const { settings, loading, error, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    vatRate: settings?.vatRate ?? 20 // Valeur par défaut de 20%
  };
}