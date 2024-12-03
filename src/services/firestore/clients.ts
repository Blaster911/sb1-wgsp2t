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
import { Client } from '../../types/client';

const COLLECTION = 'clients';

export const clientsService = {
  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Client[];
  },

  async search(term: string) {
    const q = query(
      collection(db, COLLECTION),
      where('name', '>=', term),
      where('name', '<=', term + '\uf8ff'),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Client[];
  },

  async add(client: Omit<Client, 'id'>) {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...client,
      createdAt: new Date().toISOString()
    });
    return {
      id: docRef.id,
      ...client
    };
  },

  async update(id: string, updates: Partial<Client>) {
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