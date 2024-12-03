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
import { Product } from '../../stores/productStore';

const COLLECTION = 'products';

export const productsService = {
  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  },

  async getByCategory(category: string) {
    const q = query(
      collection(db, COLLECTION),
      where('category', '==', category),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  },

  async getLowStock() {
    const q = query(
      collection(db, COLLECTION),
      where('stock', '<=', 'minStock')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  },

  async add(product: Omit<Product, 'id'>) {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...product,
      createdAt: new Date().toISOString()
    });
    return {
      id: docRef.id,
      ...product
    };
  },

  async update(id: string, updates: Partial<Product>) {
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