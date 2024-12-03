import { create } from 'zustand';
import { 
  collection, 
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  or,
  and,
  increment,
  getDoc,
  setDoc,
  Timestamp,
  DocumentReference,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Client } from '../types/client';

interface ClientStore {
  clients: Client[];
  loading: boolean;
  error: string | null;
  initializeClients: () => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => Promise<DocumentReference>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<{ success: boolean; error?: string }>;
  hasActiveTickets: (clientId: string) => Promise<boolean>;
  getClientStats: (clientId: string) => Promise<ClientStats>;
  incrementTicketCount: (clientId: string) => Promise<void>;
  decrementTicketCount: (clientId: string) => Promise<void>;
}

interface ClientStats {
  totalTickets: number;
  activeTickets: number;
  totalSpent: number;
}

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  initializeClients: async () => {
    set({ loading: true, error: null });
    try {
      const clientsRef = collection(db, 'clients');
      const unsubscribe = onSnapshot(
        clientsRef,
        async (snapshot) => {
          try {
            const clientsPromises = snapshot.docs.map(async (doc) => {
              try {
                const stats = await get().getClientStats(doc.id);
                const data = doc.data();
                return {
                  id: doc.id,
                  name: data.name || '',
                  email: data.email || '',
                  phone: data.phone || '',
                  address: data.address || '',
                  joinDate: data.joinDate || new Date().toISOString(),
                  totalSpent: stats.totalSpent || 0,
                  totalTickets: stats.totalTickets || 0,
                  activeTickets: stats.activeTickets || 0
                } as Client;
              } catch (error) {
                console.error(`Error processing client ${doc.id}:`, error);
                return null;
              }
            });

            const clientsData = (await Promise.all(clientsPromises)).filter((client): client is Client => client !== null);
            set({ clients: clientsData, loading: false, error: null });
          } catch (error) {
            console.error('Error processing clients:', error);
            set({ error: 'Erreur lors du traitement des clients', loading: false });
          }
        },
        (error) => {
          console.error('Error in clients snapshot:', error);
          set({ error: 'Erreur lors de la surveillance des clients', loading: false });
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error initializing clients:', error);
      set({ error: 'Erreur lors de l\'initialisation des clients', loading: false });
    }
  },

  getClientStats: async (clientId: string): Promise<ClientStats> => {
    try {
      const clientRef = doc(db, 'clients', clientId);
      const clientDoc = await getDoc(clientRef);
      
      if (!clientDoc.exists()) {
        throw new Error('Client non trouvé');
      }

      const data = clientDoc.data();
      return {
        totalTickets: data.totalTickets || 0,
        activeTickets: data.activeTickets || 0,
        totalSpent: data.totalSpent || 0
      };
    } catch (error) {
      console.error('Error getting client stats:', error);
      return {
        totalTickets: 0,
        activeTickets: 0,
        totalSpent: 0
      };
    }
  },

  addClient: async (clientData) => {
    try {
      const docRef = await addDoc(collection(db, 'clients'), {
        ...clientData,
        totalTickets: 0,
        activeTickets: 0,
        totalSpent: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return docRef;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  },

  updateClient: async (id, updates) => {
    try {
      const clientRef = doc(db, 'clients', id);
      await updateDoc(clientRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  hasActiveTickets: async (clientId: string) => {
    try {
      const ticketsQuery = query(
        collection(db, 'tickets'),
        and(
          where('client.id', '==', clientId),
          or(
            where('status', '==', 'reception'),
            where('status', '==', 'diagnostic'),
            where('status', '==', 'waiting_client'),
            where('status', '==', 'waiting_parts')
          )
        )
      );
      
      const snapshot = await getDocs(ticketsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking active tickets:', error);
      return false;
    }
  },

  deleteClient: async (id) => {
    try {
      const hasTickets = await get().hasActiveTickets(id);
      
      if (hasTickets) {
        return {
          success: false,
          error: 'Ce client ne peut pas être supprimé car il a des tickets en cours'
        };
      }

      const clientRef = doc(db, 'clients', id);
      await deleteDoc(clientRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting client:', error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la suppression du client"
      };
    }
  },

  incrementTicketCount: async (clientId: string) => {
    try {
      const clientRef = doc(db, 'clients', clientId);
      await updateDoc(clientRef, {
        totalTickets: increment(1),
        activeTickets: increment(1),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error incrementing ticket count:', error);
      throw error;
    }
  },

  decrementTicketCount: async (clientId: string) => {
    try {
      const clientRef = doc(db, 'clients', clientId);
      await updateDoc(clientRef, {
        activeTickets: increment(-1),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error decrementing ticket count:', error);
      throw error;
    }
  }
}));