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
import { Invoice, InvoiceStatus } from '../../types/invoice';

const COLLECTION = 'invoices';

export const invoicesService = {
  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Invoice[];
  },

  async getByStatus(status: InvoiceStatus) {
    const q = query(
      collection(db, COLLECTION),
      where('status', '==', status),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Invoice[];
  },

  async getByClient(clientId: string) {
    const q = query(
      collection(db, COLLECTION),
      where('clientId', '==', clientId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Invoice[];
  },

  async add(invoice: Omit<Invoice, 'id'>) {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...invoice,
      createdAt: new Date().toISOString()
    });
    return {
      id: docRef.id,
      ...invoice
    };
  },

  async update(id: string, updates: Partial<Invoice>) {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  },

  async delete(id: string) {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  }
};