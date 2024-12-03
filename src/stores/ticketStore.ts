import { create } from 'zustand';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  QueryDocumentSnapshot,
  getDocs,
  where,
  increment,
  getDoc,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ticket, TicketStatus } from '../types/ticket';

interface TicketStore {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  selectedTicket: Ticket | null;
  fetchTickets: () => Promise<void>;
  fetchClientTickets: (clientId: string) => Promise<void>;
  addTicket: (ticket: Omit<Ticket, 'id'>) => Promise<string>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  updateStatus: (id: string, status: TicketStatus) => Promise<void>;
  addNote: (id: string, note: string) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  setSelectedTicket: (ticket: Ticket | null) => void;
}

const convertFirestoreDataToTicket = (doc: QueryDocumentSnapshot): Ticket => {
  const data = doc.data();
  return {
    id: doc.id,
    ticketNumber: data.ticketNumber,
    client: {
      id: data.client.id,
      name: data.client.name,
      email: data.client.email,
      phone: data.client.phone,
      address: data.client.address,
    },
    deviceType: data.deviceType,
    deviceBrand: data.deviceBrand,
    deviceModel: data.deviceModel,
    devicePassword: data.devicePassword || '',
    problem: data.problem,
    status: data.status as TicketStatus,
    priority: data.priority,
    notes: data.notes || [],
    diagnosticNote: data.diagnosticNote || '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  loading: false,
  error: null,
  selectedTicket: null,

  setSelectedTicket: (ticket) => {
    set({ selectedTicket: ticket });
  },

  fetchTickets: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const tickets = snapshot.docs.map(convertFirestoreDataToTicket);
          set({ tickets, loading: false, error: null });
        },
        (error) => {
          console.error('Error fetching tickets:', error);
          set({ 
            error: 'Erreur lors du chargement des tickets',
            loading: false 
          });
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up tickets listener:', error);
      set({ 
        error: 'Erreur lors de la configuration du listener de tickets',
        loading: false 
      });
    }
  },

  fetchClientTickets: async (clientId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'tickets'),
        where('client.id', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const tickets = snapshot.docs.map(convertFirestoreDataToTicket);
          set({ tickets, loading: false, error: null });
        },
        (error) => {
          console.error('Error fetching client tickets:', error);
          set({ 
            error: 'Erreur lors du chargement des tickets du client',
            loading: false 
          });
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up client tickets listener:', error);
      set({ 
        error: 'Erreur lors de la configuration du listener de tickets du client',
        loading: false 
      });
    }
  },

  addTicket: async (ticketData) => {
    set({ loading: true, error: null });
    try {
      const now = Timestamp.now().toDate().toISOString();
      const newTicketData = {
        ...ticketData,
        notes: [],
        ticketNumber: `TK-${Date.now()}`,
        diagnosticNote: '',
        createdAt: now,
        updatedAt: now,
        status: 'reception' as TicketStatus,
      };

      // Ajouter le ticket
      const docRef = await addDoc(collection(db, 'tickets'), newTicketData);

      // Mettre à jour les compteurs du client
      const clientRef = doc(db, 'clients', ticketData.client.id);
      await updateDoc(clientRef, {
        totalTickets: increment(1),
        activeTickets: increment(1)
      });

      set({ loading: false, error: null });
      return docRef.id;
    } catch (error) {
      console.error('Error adding ticket:', error);
      set({ 
        error: 'Erreur lors de la création du ticket',
        loading: false 
      });
      throw error;
    }
  },

  updateTicket: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await runTransaction(db, async (transaction) => {
        const ticketRef = doc(db, 'tickets', id);
        const ticketDoc = await transaction.get(ticketRef);
        
        if (!ticketDoc.exists()) {
          throw new Error('Ticket not found');
        }

        const currentData = ticketDoc.data();
        const updatedData = {
          ...updates,
          updatedAt: Timestamp.now().toDate().toISOString(),
        };

        transaction.update(ticketRef, updatedData);

        // Mettre à jour les compteurs du client si le statut change
        if (updates.status && updates.status !== currentData.status) {
          const clientRef = doc(db, 'clients', currentData.client.id);
          
          if (updates.status === 'completed' && currentData.status !== 'completed') {
            transaction.update(clientRef, {
              activeTickets: increment(-1)
            });
          } else if (currentData.status === 'completed' && updates.status !== 'completed') {
            transaction.update(clientRef, {
              activeTickets: increment(1)
            });
          }
        }
      });

      set({ loading: false, error: null });
    } catch (error) {
      console.error('Error updating ticket:', error);
      set({ 
        error: 'Erreur lors de la mise à jour du ticket',
        loading: false 
      });
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      await runTransaction(db, async (transaction) => {
        const ticketRef = doc(db, 'tickets', id);
        const ticketDoc = await transaction.get(ticketRef);
        
        if (!ticketDoc.exists()) {
          throw new Error('Ticket not found');
        }

        const currentData = ticketDoc.data();
        transaction.update(ticketRef, {
          status,
          updatedAt: Timestamp.now().toDate().toISOString(),
        });

        // Mettre à jour les compteurs du client
        const clientRef = doc(db, 'clients', currentData.client.id);
        if (status === 'completed' && currentData.status !== 'completed') {
          transaction.update(clientRef, {
            activeTickets: increment(-1)
          });
        } else if (currentData.status === 'completed' && status !== 'completed') {
          transaction.update(clientRef, {
            activeTickets: increment(1)
          });
        }
      });

      set({ loading: false, error: null });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      set({ 
        error: 'Erreur lors de la mise à jour du statut',
        loading: false 
      });
      throw error;
    }
  },

  addNote: async (id, note) => {
    set({ loading: true, error: null });
    try {
      const ticketRef = doc(db, 'tickets', id);
      const ticketDoc = await getDoc(ticketRef);
      
      if (!ticketDoc.exists()) {
        throw new Error('Ticket not found');
      }

      const currentNotes = ticketDoc.data().notes || [];
      await updateDoc(ticketRef, {
        notes: [...currentNotes, note],
        updatedAt: Timestamp.now().toDate().toISOString(),
      });

      set({ loading: false, error: null });
    } catch (error) {
      console.error('Error adding note:', error);
      set({ 
        error: 'Erreur lors de l\'ajout de la note',
        loading: false 
      });
      throw error;
    }
  },

  deleteTicket: async (id) => {
    set({ loading: true, error: null });
    try {
      await runTransaction(db, async (transaction) => {
        const ticketRef = doc(db, 'tickets', id);
        const ticketDoc = await transaction.get(ticketRef);
        
        if (!ticketDoc.exists()) {
          throw new Error('Ticket not found');
        }

        const ticketData = ticketDoc.data();
        
        // Supprimer le ticket
        transaction.delete(ticketRef);

        // Mettre à jour les compteurs du client
        const clientRef = doc(db, 'clients', ticketData.client.id);
        
        if (ticketData.status !== 'completed') {
          // Si le ticket n'était pas complété, décrémenter le compteur de tickets actifs
          transaction.update(clientRef, {
            activeTickets: increment(-1),
            totalTickets: increment(-1)
          });
        } else {
          // Si le ticket était complété, décrémenter uniquement le total
          transaction.update(clientRef, {
            totalTickets: increment(-1)
          });
        }
      });

      set({ loading: false, error: null });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      set({ 
        error: 'Erreur lors de la suppression du ticket',
        loading: false 
      });
      throw error;
    }
  },
}));