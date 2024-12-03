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
import { Quote } from '../../stores/quoteStore';

const COLLECTION = 'quotes';

export const quotesService = {
  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Quote[];
  },

  async getByStatus(status: 'pending' | 'accepted' | 'rejected') {
    const q = query(
      collection(db, COLLECTION),
      where('status', '==', status),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Quote[];
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
    })) as Quote[];
  },

  async add(quote: Omit<Quote, 'id' | 'number'>) {
    const number = await this.generateQuoteNumber();
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...quote,
      number,
      createdAt: new Date().toISOString()
    });
    return {
      id: docRef.id,
      number,
      ...quote
    };
  },

  async update(id: string, updates: Partial<Quote>) {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  },

  async delete(id: string) {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  },

  async generateQuoteNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get all quotes from current month to determine next number
    const q = query(
      collection(db, COLLECTION),
      where('number', '>=', `DEV-${year}${month}-`),
      where('number', '<=', `DEV-${year}${month}-999`),
      orderBy('number', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    const lastQuote = querySnapshot.docs[0]?.data() as Quote | undefined;
    
    let sequence = 1;
    if (lastQuote) {
      const lastSequence = parseInt(lastQuote.number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    return `DEV-${year}${month}-${String(sequence).padStart(3, '0')}`;
  }
};