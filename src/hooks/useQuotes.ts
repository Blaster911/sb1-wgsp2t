import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Quote {
  id: string;
  number: string;
  date: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
  validUntil: string;
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'quotes'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const quotesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quote[];
      
      setQuotes(quotesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addQuote = async (quoteData: Omit<Quote, 'id'>) => {
    const number = `DEV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    await addDoc(collection(db, 'quotes'), {
      ...quoteData,
      number,
      date: new Date().toISOString()
    });
  };

  const updateQuote = async (id: string, data: Partial<Quote>) => {
    const quoteRef = doc(db, 'quotes', id);
    await updateDoc(quoteRef, data);
  };

  const deleteQuote = async (id: string) => {
    const quoteRef = doc(db, 'quotes', id);
    await deleteDoc(quoteRef);
  };

  return {
    quotes,
    loading,
    addQuote,
    updateQuote,
    deleteQuote
  };
}