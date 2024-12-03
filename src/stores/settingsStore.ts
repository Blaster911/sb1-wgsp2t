import { create } from 'zustand';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Settings } from '../types/settings';

// Valeurs par défaut pour les paramètres
export const DEFAULT_SETTINGS: Settings = {
  companyName: 'Tech Repair Pro',
  email: 'contact@techrepairpro.fr',
  phone: '01 23 45 67 89',
  address: '123 Rue de la Réparation, 75000 Paris',
  vatRate: 20,
  siret: '12345678900000',
  updatedAt: new Date().toISOString(),
  billing: {
    paymentMethods: {
      card: true,
      cash: true,
      transfer: true
    },
    invoicing: {
      autoNumbering: true,
      prefix: 'FAC',
      numberingFormat: 'datetime',
      nextNumber: 100,
      defaultDueDate: 30,
      defaultPaymentTerms: 'Paiement à 30 jours',
      defaultNotes: '',
      allowPartialPayments: true,
      allowDeposits: true,
      minDepositPercentage: 30
    },
    bankAccount: {
      name: '',
      iban: '',
      bic: ''
    },
    invoiceTemplates: {
      defaultTemplate: 'modern',
      primaryColor: '#000000',
      accentColor: '#455878',
      showLogo: true,
      showWatermark: false,
      showPaymentQR: false
    }
  }
};

interface SettingsStore {
  settings: Settings;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<Settings>) => Promise<void>;
}

const SETTINGS_DOC_ID = 'global';

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,
  error: null,
  initialized: false,

  fetchSettings: async () => {
    if (get().initialized) return;

    set({ loading: true, error: null });
    try {
      console.log('Récupération des paramètres depuis Firebase...');
      const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Paramètres bruts récupérés:', data);

        // Fusion avec les valeurs par défaut
        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...data,
          billing: {
            ...DEFAULT_SETTINGS.billing,
            ...data.billing,
            invoicing: {
              ...DEFAULT_SETTINGS.billing.invoicing,
              ...data.billing?.invoicing
            },
            invoiceTemplates: {
              ...DEFAULT_SETTINGS.billing.invoiceTemplates,
              ...data.billing?.invoiceTemplates
            },
            paymentMethods: {
              ...DEFAULT_SETTINGS.billing.paymentMethods,
              ...data.billing?.paymentMethods
            },
            bankAccount: {
              ...DEFAULT_SETTINGS.billing.bankAccount,
              ...data.billing?.bankAccount
            }
          }
        };

        console.log('Paramètres finaux fusionnés:', mergedSettings);
        set({ 
          settings: mergedSettings,
          initialized: true,
          loading: false
        });
      } else {
        console.log('Aucun paramètre trouvé, création des paramètres par défaut');
        await setDoc(docRef, DEFAULT_SETTINGS);
        set({ 
          settings: DEFAULT_SETTINGS,
          initialized: true,
          loading: false
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      set({ 
        error: 'Erreur lors du chargement des paramètres',
        loading: false,
        settings: DEFAULT_SETTINGS // Utiliser les valeurs par défaut en cas d'erreur
      });
    }
  },

  updateSettings: async (data: Partial<Settings>) => {
    set({ loading: true, error: null });
    try {
      console.log('Mise à jour des paramètres:', data);
      const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
      
      const updateData = {
        ...data,
        updatedAt: Timestamp.now().toDate().toISOString()
      };

      await updateDoc(docRef, updateData);

      // Mettre à jour l'état local
      set(state => ({
        settings: {
          ...state.settings,
          ...updateData
        },
        loading: false
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      set({ error: 'Erreur lors de la mise à jour des paramètres', loading: false });
      throw error;
    }
  }
}));