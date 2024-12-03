import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { Invoice } from '../../types/invoice';
import { Settings } from '../../types/settings';
import { generateInvoiceNumber } from './invoiceNumberGenerator';

export const invoiceService = {
  async getAll() {
    const q = query(collection(db, 'invoices'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Invoice[];
  },

  async getById(id: string) {
    const docRef = doc(db, 'invoices', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Facture non trouvée');
    }
    return { id: docSnap.id, ...docSnap.data() } as Invoice;
  },

  async getByClient(clientId: string) {
    const q = query(
      collection(db, 'invoices'),
      where('clientId', '==', clientId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Invoice[];
  },

  async getNextNumber(settings: Settings) {
    return generateInvoiceNumber(settings);
  }
};