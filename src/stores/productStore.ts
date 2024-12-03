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
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Product {
  id: string;
  name: string;
  reference: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  minStock?: number;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  searchProducts: (searchTerm: string) => Promise<Product[]>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductsByCategory: (category: string) => Promise<void>;
  getLowStockProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, 'products'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
          console.log('Fetched products:', products); // Débogage
          set({ products, loading: false });
        },
        (error) => {
          console.error('Error fetching products:', error);
          set({ error: 'Erreur lors du chargement des articles', loading: false });
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up products listener:', error);
      set({ error: 'Erreur lors de la configuration du listener', loading: false });
    }
  },

  searchProducts: async (searchTerm: string) => {
    try {
      const searchLower = searchTerm.toLowerCase().trim();
      const products = get().products;
      
      return products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.reference.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  addProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const now = Timestamp.now().toDate().toISOString();
      const newProduct = {
        ...productData,
        createdAt: now,
        updatedAt: now
      };

      await addDoc(collection(db, 'products'), newProduct);
      set({ loading: false });
    } catch (error) {
      console.error('Error adding product:', error);
      set({ error: 'Erreur lors de l\'ajout de l\'article', loading: false });
      throw error;
    }
  },

  updateProduct: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const productRef = doc(db, 'products', id);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }

      await updateDoc(productRef, {
        ...updates,
        updatedAt: Timestamp.now().toDate().toISOString()
      });

      set({ loading: false });
    } catch (error) {
      console.error('Error updating product:', error);
      set({ error: 'Erreur lors de la mise à jour de l\'article', loading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const productRef = doc(db, 'products', id);
      await deleteDoc(productRef);
      set({ loading: false });
    } catch (error) {
      console.error('Error deleting product:', error);
      set({ error: 'Erreur lors de la suppression de l\'article', loading: false });
      throw error;
    }
  },

  getProductsByCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'products'),
        where('category', '==', category)
      );

      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      set({ products, loading: false });
    } catch (error) {
      console.error('Error fetching products by category:', error);
      set({ error: 'Erreur lors du chargement des articles', loading: false });
    }
  },

  getLowStockProducts: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'products'),
        where('stock', '<=', 'minStock')
      );

      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      set({ products, loading: false });
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      set({ error: 'Erreur lors du chargement des articles', loading: false });
    }
  }
}));