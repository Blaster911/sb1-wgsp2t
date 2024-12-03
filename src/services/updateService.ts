import { db } from '../lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { create } from 'zustand';

interface AppVersion {
  version: string;
  releaseDate: string;
  mandatory: boolean;
  changes: string[];
  minVersion: string;
}

interface UpdateStore {
  currentVersion: string;
  latestVersion: AppVersion | null;
  updateAvailable: boolean;
  loading: boolean;
  error: string | null;
  checkForUpdates: () => Promise<void>;
}

// Version actuelle de l'application
const CURRENT_VERSION = '1.0.0';

export const useUpdateStore = create<UpdateStore>((set) => ({
  currentVersion: CURRENT_VERSION,
  latestVersion: null,
  updateAvailable: false,
  loading: false,
  error: null,

  checkForUpdates: async () => {
    set({ loading: true, error: null });
    try {
      // Écouter les changements de version en temps réel
      const unsubscribe = onSnapshot(
        doc(db, 'system', 'version'),
        (doc) => {
          if (doc.exists()) {
            const latestVersion = doc.data() as AppVersion;
            const updateAvailable = latestVersion.version !== CURRENT_VERSION;
            
            set({
              latestVersion,
              updateAvailable,
              loading: false
            });

            // Si la mise à jour est obligatoire et que la version actuelle est inférieure à la version minimale
            if (latestVersion.mandatory && CURRENT_VERSION < latestVersion.minVersion) {
              window.location.reload();
            }
          }
        },
        (error) => {
          console.error('Error checking for updates:', error);
          set({ 
            error: 'Erreur lors de la vérification des mises à jour',
            loading: false 
          });
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up update listener:', error);
      set({ 
        error: 'Erreur lors de la configuration du listener de mise à jour',
        loading: false 
      });
    }
  }
}));