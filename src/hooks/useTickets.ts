import { useState, useEffect } from 'react';
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
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ticket } from '../types/ticket';

// Type pour un nouveau ticket
export type NewTicketData = Omit<
  Ticket,
  'id' | 'ticketNumber' | 'createdAt'
> & {
  updatedAt: string;
  diagnosticNote?: string;
};

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ticketsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            diagnosticNote: data.diagnosticNote || '',
          };
        }) as Ticket[];

        setTickets(ticketsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching tickets:', err);
        setError('Erreur lors du chargement des tickets');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `#REP${year}${month}${day}-${random}`;
  };

  const addTicket = async (ticketData: NewTicketData) => {
    try {
      const now = Timestamp.now().toDate().toISOString();
      const newTicket = {
        ...ticketData,
        ticketNumber: generateTicketNumber(),
        diagnosticNote: ticketData.diagnosticNote || '',
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'tickets'), newTicket);
      return docRef.id;
    } catch (err) {
      console.error('Error adding ticket:', err);
      throw new Error('Erreur lors de la création du ticket');
    }
  };

  const updateTicket = async (
    id: string,
    data: Partial<Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt'>>
  ) => {
    try {
      const ticketRef = doc(db, 'tickets', id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now().toDate().toISOString(),
      };

      await updateDoc(ticketRef, updateData);
    } catch (err) {
      console.error('Error updating ticket:', err);
      throw new Error('Erreur lors de la mise à jour du ticket');
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      const ticketRef = doc(db, 'tickets', id);
      await deleteDoc(ticketRef);
    } catch (err) {
      console.error('Error deleting ticket:', err);
      throw new Error('Erreur lors de la suppression du ticket');
    }
  };

  return {
    tickets,
    loading,
    error,
    addTicket,
    updateTicket,
    deleteTicket,
  };
}
