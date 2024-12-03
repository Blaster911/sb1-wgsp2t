import { create } from 'zustand';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  where,
  getDoc,
  getDocs,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber';
import { useSettingsStore } from './settingsStore';
import { isAfter, parseISO } from 'date-fns';

export interface QuoteItem {
  id: string;
  description: string;
  reference: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface QuoteStore {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
  fetchQuotes: () => Promise<void>;
  addQuote: (quote: Omit<Quote, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  getQuotesByClient: (clientId: string) => Promise<Quote[]>;
  convertToInvoice: (quoteId: string) => Promise<void>;
}

async function generateQuoteNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const baseNumber = `DEV-${year}${month}${day}`;
  const q = query(
    collection(db, 'quotes'),
    where('number', '>=', baseNumber),
    where('number', '<=', `${baseNumber}-9999`)
  );
  
  const snapshot = await getDocs(q);
  const existingNumbers = snapshot.docs.map(doc => {
    const num = doc.data().number;
    const sequence = parseInt(num.split('-')[3] || '0');
    return sequence;
  });

  let sequence = 1;
  if (existingNumbers.length > 0) {
    sequence = Math.max(...existingNumbers) + 1;
  }

  return `${baseNumber}-${String(sequence).padStart(4, '0')}`;
}

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  quotes: [],
  loading: false,
  error: null,

  fetchQuotes: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, 'quotes'), orderBy('date', 'desc'));
      
      const unsubscribe = onSnapshot(q, 
        async (snapshot) => {
          const quotes = snapshot.docs.map(doc => {
            const data = doc.data() as Quote;
            const isExpired = isAfter(new Date(), parseISO(data.validUntil));
            
            if (isExpired && data.status === 'pending') {
              updateDoc(doc.ref, {
                status: 'rejected',
                updatedAt: new Date().toISOString()
              }).catch(error => {
                console.error('Error updating expired quote:', error);
              });
              
              return {
                id: doc.id,
                ...data,
                status: 'rejected',
                updatedAt: new Date().toISOString()
              } as Quote;
            }
            
            return {
              id: doc.id,
              ...data
            } as Quote;
          });
          
          set({ quotes, loading: false });
        },
        (error) => {
          console.error('Error fetching quotes:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des devis',
            loading: false 
          });
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up quotes listener:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la configuration du listener',
        loading: false 
      });
    }
  },

  addQuote: async (quoteData) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      const number = await generateQuoteNumber();

      const newQuote = {
        ...quoteData,
        number,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, 'quotes'), newQuote);
      set({ loading: false, error: null });
      return docRef.id;
    } catch (error) {
      console.error('Error adding quote:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création du devis',
        loading: false 
      });
      throw error;
    }
  },

  updateQuote: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const quoteRef = doc(db, 'quotes', id);
      const quoteDoc = await getDoc(quoteRef);
      
      if (!quoteDoc.exists()) {
        throw new Error('Devis non trouvé');
      }

      await updateDoc(quoteRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      set({ loading: false, error: null });
    } catch (error) {
      console.error('Error updating quote:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du devis',
        loading: false 
      });
      throw error;
    }
  },

  deleteQuote: async (id) => {
    set({ loading: true, error: null });
    try {
      const quoteRef = doc(db, 'quotes', id);
      await deleteDoc(quoteRef);
      set({ loading: false, error: null });
    } catch (error) {
      console.error('Error deleting quote:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression du devis',
        loading: false 
      });
      throw error;
    }
  },

  getQuotesByClient: async (clientId) => {
    try {
      const q = query(
        collection(db, 'quotes'),
        where('clientId', '==', clientId),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quote[];
    } catch (error) {
      console.error('Error getting quotes by client:', error);
      throw error;
    }
  },

  convertToInvoice: async (quoteId) => {
    set({ loading: true, error: null });
    try {
      const { settings } = useSettingsStore.getState();
      if (!settings) {
        throw new Error('Les paramètres ne sont pas disponibles');
      }

      await runTransaction(db, async (transaction) => {
        const quoteRef = doc(db, 'quotes', quoteId);
        const quoteDoc = await transaction.get(quoteRef);
        
        if (!quoteDoc.exists()) {
          throw new Error('Devis non trouvé');
        }

        const quote = quoteDoc.data() as Quote;
        const { number: invoiceNumber } = await generateInvoiceNumber(settings);

        const subtotal = quote.subtotal;
        const vatRate = settings.vatRate;
        const vatAmount = (subtotal * vatRate) / 100;
        const total = subtotal + vatAmount;

        const invoiceData = {
          number: invoiceNumber,
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + (settings.billing?.invoicing?.defaultDueDate || 30) * 24 * 60 * 60 * 1000).toISOString(),
          clientId: quote.clientId,
          clientName: quote.clientName,
          clientEmail: quote.clientEmail,
          clientAddress: quote.clientAddress,
          items: quote.items.map(item => ({
            ...item,
            total: item.quantity * item.unitPrice
          })),
          subtotal,
          vatAmount,
          vatRate,
          total,
          paidAmount: 0,
          remainingAmount: total,
          status: 'pending',
          payments: [],
          notes: quote.notes,
          paymentTerms: settings.billing?.invoicing?.defaultPaymentTerms || 'Paiement à 30 jours',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          quoteId: quoteId
        };

        const invoiceRef = doc(collection(db, 'invoices'));
        transaction.set(invoiceRef, invoiceData);

        transaction.update(quoteRef, {
          status: 'accepted',
          updatedAt: new Date().toISOString()
        });

        if (settings.billing?.invoicing?.numberingFormat === 'increment' && settings.billing.invoicing.autoNumbering) {
          const settingsRef = doc(db, 'settings', 'global');
          const newNextNumber = (settings.billing.invoicing.nextNumber || 1000) + 1;
          
          transaction.update(settingsRef, {
            'billing.invoicing.nextNumber': newNextNumber
          });
        }
      });

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