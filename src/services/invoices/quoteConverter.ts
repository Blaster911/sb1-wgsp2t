import { Quote } from '../../stores/quoteStore';
import { Settings } from '../../types/settings';
import { createInvoice } from './invoiceCreator';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function convertQuoteToInvoice(quote: Quote, settings: Settings) {
  try {
    console.log('Conversion du devis en facture avec les paramètres:', {
      settings: settings,
      billingSettings: settings?.billing?.invoicing,
      quoteId: quote.id
    });

    if (!settings?.billing?.invoicing) {
      console.error('Paramètres de facturation manquants lors de la conversion:', settings);
      throw new Error('Les paramètres de facturation ne sont pas disponibles');
    }

    // Créer la facture à partir du devis en utilisant les paramètres de facturation
    const invoiceData = {
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + (settings.billing?.invoicing?.defaultDueDate || 30) * 24 * 60 * 60 * 1000).toISOString(),
      clientId: quote.clientId,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      clientAddress: quote.clientAddress,
      items: quote.items,
      subtotal: quote.subtotal,
      vatAmount: quote.tax,
      vatRate: settings.vatRate,
      total: quote.total,
      paidAmount: 0,
      remainingAmount: quote.total,
      status: 'pending',
      payments: [],
      notes: quote.notes,
      paymentTerms: settings.billing?.invoicing?.defaultPaymentTerms || 'Paiement à 30 jours',
      quoteId: quote.id
    };

    console.log('Données de la facture à créer depuis le devis:', invoiceData);

    // Créer la facture
    const invoice = await createInvoice(invoiceData, settings);

    // Mettre à jour le statut du devis
    const quoteRef = doc(db, 'quotes', quote.id);
    await updateDoc(quoteRef, {
      status: 'accepted',
      updatedAt: new Date().toISOString()
    });

    console.log('Facture créée depuis le devis:', invoice);
    return invoice;
  } catch (error) {
    console.error('Erreur lors de la conversion du devis en facture:', error);
    throw error;
  }
}