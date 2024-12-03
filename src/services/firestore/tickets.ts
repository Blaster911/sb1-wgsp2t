import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Ticket, TicketStatus } from '../../types/ticket';

const COLLECTION = 'tickets';

export const ticketsService = {
  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Ticket[];
  },

  async getByStatus(status: TicketStatus) {
    const q = query(
      collection(db, COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Ticket[];
  },

  async getByClient(clientId: string) {
    const q = query(
      collection(db, COLLECTION),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Ticket[];
  },

  async add(ticket: Omit<Ticket, 'id'>) {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...ticket,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return {
      id: docRef.id,
      ...ticket
    };
  },

  async update(id: string, updates: Partial<Ticket>) {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  },

  async addNote(id: string, note: string) {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      notes: [...(await this.getNotes(id)), note],
      updatedAt: new Date().toISOString()
    });
  },

  async getNotes(id: string) {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDocs(collection(docRef, 'notes'));
    return docSnap.docs.map(doc => doc.data().content);
  },

  async delete(id: string) {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  }
};