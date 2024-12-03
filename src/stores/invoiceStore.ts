import { create } from 'zustand';
import { Invoice, InvoiceStatus } from '../types/invoice';
import { createInvoice } from '../services/invoices/invoiceCreator';
import { convertQuoteToInvoice } from '../services/invoices/quoteConverter';
import { useSettingsStore } from './settingsStore';
import { db } from '../lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  where,
  getDocs,
  runTransaction,
  increment,
  Timestamp,
  getDoc
} from 'firebase/firestore';

interface InvoiceStore {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
  refreshInvoice: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'number'>) => Promise<string>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getInvoicesByClient: (clientId: string) => Promise<Invoice[]>;
  convertFromQuote: (quoteId: string) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],
  loading: false,
  error: null,

  fetchInvoices: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, 'invoices'), orderBy('date', 'desc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const invoices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Invoice[];
          set({ invoices, loading: false });
        },
        (error) => {
          console.error('Error fetching invoices:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des factures',
            loading: false 
          });
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up invoices listener:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la configuration du listener',
        loading: false 
      });
    }
  },

  refreshInvoice: async (id) => {
    try {
      const docRef = doc(db, 'invoices', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const invoiceData = { id: docSnap.id, ...docSnap.data() } as Invoice;
        set(state => ({
          invoices: state.invoices.map(invoice => 
            invoice.id === id ? invoiceData : invoice
          )
        }));
      }
    } catch (error) {
      console.error('Error refreshing invoice:', error);
      throw error;
    }
  },

  addInvoice: async (invoiceData) => {
    set({ loading: true, error: null });
    try {
      const { settings } = useSettingsStore.getState();
      if (!settings) {
        throw new Error('Les paramètres ne sont pas disponibles');
      }

      // Créer la facture avec les paramètres actuels
      const invoice = await createInvoice(invoiceData, settings);
      
      // Mettre à jour la liste des factures
      set(state => ({
        invoices: [invoice, ...state.invoices]
      }));

      return invoice.id;
    } catch (error) {
      console.error('Error adding invoice:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création de la facture',
        loading: false 
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateInvoice: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await runTransaction(db, async (transaction) => {
        const invoiceRef = doc(db, 'invoices', id);
        const invoiceDoc = await transaction.get(invoiceRef);
        
        if (!invoiceDoc.exists()) {
          throw new Error('Facture non trouvée');
        }

        const currentInvoice = invoiceDoc.data() as Invoice;
        const currentPaidAmount = currentInvoice.paidAmount || 0;

        // Calculer les nouveaux montants si les articles sont mis à jour
        let newUpdates = { ...updates };
        if (updates.items) {
          // Récupérer les settings
          const { settings } = useSettingsStore.getState();
          if (!settings) {
            throw new Error('Les paramètres ne sont pas disponibles');
          }
        
          const subtotal = updates.items.reduce((sum, item) => 
            sum + (item.quantity * item.unitPrice), 0);
          const vatRate = settings.vatRate; // Utiliser le taux des settings
          const vatAmount = (subtotal * vatRate) / 100;
          const total = subtotal + vatAmount;
        
          newUpdates = {
            ...updates,
            subtotal,
            vatRate, // Ajouter le taux de TVA aux updates
            vatAmount,
            total,
            remainingAmount: total - currentPaidAmount
          };
        }

        // Mettre à jour le montant restant si le montant payé change
        if (updates.paidAmount !== undefined) {
          const total = newUpdates.total || currentInvoice.total;
          newUpdates.remainingAmount = total - updates.paidAmount;
          
          // Mettre à jour le statut en fonction du paiement
          if (updates.paidAmount >= total) {
            newUpdates.status = 'paid';
          } else if (updates.paidAmount > 0) {
            newUpdates.status = 'partial';
          }
        }

        // Mettre à jour la facture
        transaction.update(invoiceRef, {
          ...newUpdates,
          updatedAt: new Date().toISOString()
        });

        // Mettre à jour le total dépensé du client si le montant payé change
        if (updates.paidAmount !== undefined) {
          const clientRef = doc(db, 'clients', currentInvoice.clientId);
          const paymentDifference = updates.paidAmount - currentPaidAmount;
          if (paymentDifference !== 0) {
            transaction.update(clientRef, {
              totalSpent: increment(paymentDifference)
            });
          }
        }
      });

      // Rafraîchir la facture
      await get().refreshInvoice(id);

      set({ loading: false, error: null });
    } catch (error) {
      console.error('Error updating invoice:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la facture',
        loading: false 
      });
      throw error;
    }
  },

  deleteInvoice: async (id) => {
    set({ loading: true, error: null });
    try {
      await runTransaction(db, async (transaction) => {
        const invoiceRef = doc(db, 'invoices', id);
        const invoiceDoc = await transaction.get(invoiceRef);
        
        if (!invoiceDoc.exists()) {
          throw new Error('Facture non trouvée');
        }

        const invoice = invoiceDoc.data() as Invoice;

        // Mettre à jour le total dépensé du client si la facture était payée
        if (invoice.paidAmount > 0) {
          const clientRef = doc(db, 'clients', invoice.clientId);
          transaction.update(clientRef, {
            totalSpent: increment(-invoice.paidAmount)
          });
        }

        // Supprimer la facture
        transaction.delete(invoiceRef);
      });

      // Mettre à jour la liste des factures
      set(state => ({
        invoices: state.invoices.filter(invoice => invoice.id !== id)
      }));

      set({ loading: false, error: null });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la facture',
        loading: false 
      });
      throw error;
    }
  },

  getInvoicesByClient: async (clientId) => {
    try {
      const q = query(
        collection(db, 'invoices'),
        where('clientId', '==', clientId),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invoice[];
    } catch (error) {
      console.error('Error getting invoices by client:', error);
      throw error;
    }
  },

  convertFromQuote: async (quoteId) => {
    set({ loading: true, error: null });
    try {
      const { settings } = useSettingsStore.getState();
      if (!settings) {
        throw new Error('Les paramètres ne sont pas disponibles');
      }

      // Récupérer le devis
      const quoteRef = doc(db, 'quotes', quoteId);
      const quoteDoc = await getDoc(quoteRef);
      
      if (!quoteDoc.exists()) {
        throw new Error('Devis non trouvé');
      }

      const quote = { id: quoteDoc.id, ...quoteDoc.data() };
      
      // Convertir le devis en facture
      const invoice = await convertQuoteToInvoice(quote, settings);
      
      // Mettre à jour la liste des factures
      set(state => ({
        invoices: [invoice, ...state.invoices]
      }));

      set({ loading: false, error: null });
    } catch (error) {
      console.error('Error converting quote to invoice:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la conversion du devis en facture',
        loading: false 
      });
      throw error;
    }
  }
}));