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
  Timestamp,
  getDoc,
  getDocs,
  runTransaction,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Payment } from '../types/payment';

interface PaymentStore {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  selectedPayment: Payment | null;
  fetchPayments: () => Promise<void>;
  addPayment: (paymentData: Omit<Payment, 'id' | 'status'>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  getPaymentsByInvoice: (invoiceId: string) => Promise<Payment[]>;
  getPaymentsByClient: (clientId: string) => Promise<Payment[]>;
  setSelectedPayment: (payment: Payment | null) => void;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  loading: false,
  error: null,
  selectedPayment: null,

  fetchPayments: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, 'payments'), orderBy('date', 'desc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const payments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Payment[];
          set({ payments, loading: false });
        },
        (error) => {
          console.error('Error fetching payments:', error);
          set({ error: 'Erreur lors du chargement des paiements', loading: false });
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up payments listener:', error);
      set({ error: 'Erreur lors de la configuration du listener', loading: false });
    }
  },

  addPayment: async (paymentData) => {
    set({ loading: true, error: null });
    try {
      await runTransaction(db, async (transaction) => {
        // Get the invoice reference
        const invoiceRef = doc(db, 'invoices', paymentData.invoiceId);
        const invoiceDoc = await transaction.get(invoiceRef);
        
        if (!invoiceDoc.exists()) {
          throw new Error('Facture non trouvée');
        }

        const invoice = invoiceDoc.data();
        
        // Calculate new amounts
        const currentPaidAmount = invoice.paidAmount || 0;
        const newPaidAmount = currentPaidAmount + paymentData.amount;
        const newRemainingAmount = invoice.total - newPaidAmount;

        // Determine new status
        let newStatus = invoice.status;
        if (newRemainingAmount <= 0) {
          newStatus = 'paid';
        } else if (newPaidAmount > 0) {
          newStatus = 'partial';
        }

        // Create payment document
        const paymentRef = doc(collection(db, 'payments'));
        transaction.set(paymentRef, {
          id: paymentRef.id,
          ...paymentData,
          status: 'completed',
          createdAt: Timestamp.now().toDate().toISOString()
        });

        // Update invoice
        transaction.update(invoiceRef, {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          updatedAt: Timestamp.now().toDate().toISOString()
        });

        // Update client total spent
        const clientRef = doc(db, 'clients', paymentData.clientId);
        transaction.update(clientRef, {
          totalSpent: increment(paymentData.amount)
        });
      });

      set({ loading: false, error: null });
    } catch (error) {
      console.error('Error adding payment:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du paiement',
        loading: false 
      });
      throw error;
    }
  },

  deletePayment: async (id) => {
    set({ loading: true, error: null });
    try {
      await runTransaction(db, async (transaction) => {
        const paymentRef = doc(db, 'payments', id);
        const paymentDoc = await transaction.get(paymentRef);
        
        if (!paymentDoc.exists()) {
          throw new Error('Paiement non trouvé');
        }

        const payment = paymentDoc.data() as Payment;
        
        // Get and update invoice if it exists
        const invoiceRef = doc(db, 'invoices', payment.invoiceId);
        const invoiceDoc = await transaction.get(invoiceRef);
        
        if (invoiceDoc.exists()) {
          const invoice = invoiceDoc.data();
          const newPaidAmount = (invoice.paidAmount || 0) - payment.amount;
          const newRemainingAmount = invoice.total - newPaidAmount;
          
          // Determine new status
          let newStatus = invoice.status;
          if (newPaidAmount <= 0) {
            newStatus = 'pending';
          } else if (newRemainingAmount > 0) {
            newStatus = 'partial';
          }

          // Update invoice
          transaction.update(invoiceRef, {
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            status: newStatus,
            updatedAt: Timestamp.now().toDate().toISOString()
          });
        }

        // Update client total spent
        const clientRef = doc(db, 'clients', payment.clientId);
        transaction.update(clientRef, {
          totalSpent: increment(-payment.amount)
        });

        // Delete payment
        transaction.delete(paymentRef);
      });

      set({ loading: false, error: null });
    } catch (error) {
      console.error('Error deleting payment:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression du paiement',
        loading: false 
      });
      throw error;
    }
  },

  getPaymentsByInvoice: async (invoiceId) => {
    try {
      const q = query(
        collection(db, 'payments'),
        where('invoiceId', '==', invoiceId),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
    } catch (error) {
      console.error('Error getting payments by invoice:', error);
      throw error;
    }
  },

  getPaymentsByClient: async (clientId) => {
    try {
      const q = query(
        collection(db, 'payments'),
        where('clientId', '==', clientId),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
    } catch (error) {
      console.error('Error getting payments by client:', error);
      throw error;
    }
  },

  setSelectedPayment: (payment) => {
    set({ selectedPayment: payment });
  }
}));