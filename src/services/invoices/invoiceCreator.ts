import { Settings } from '../../types/settings';
import { Invoice } from '../../types/invoice';
import { generateInvoiceNumber } from './invoiceNumberGenerator';
import { db } from '../../lib/firebase';
import { collection, doc, runTransaction } from 'firebase/firestore';

export async function createInvoice(data: Omit<Invoice, 'id' | 'number'>, settings: Settings): Promise<Invoice> {
  try {
    if (!settings?.billing?.invoicing) {
      console.error('Paramètres de facturation manquants:', settings);
      throw new Error('Les paramètres de facturation ne sont pas disponibles');
    }

    // Log des paramètres reçus pour déboguer
    console.log('Création de facture - Paramètres reçus:', {
      format: settings.billing.invoicing.numberingFormat,
      prefix: settings.billing.invoicing.prefix
    });

    return await runTransaction(db, async (transaction) => {
      const {
        defaultDueDate = 30,
        defaultPaymentTerms = 'Paiement à 30 jours',
        defaultNotes = '',
        autoNumbering = true
      } = settings.billing.invoicing;

      // Générer le numéro de facture
      console.log('Appel de generateInvoiceNumber avec les paramètres:', settings);
      const { number } = await generateInvoiceNumber(settings);
      console.log('Numéro de facture généré:', number);

      // Calculer la date d'échéance
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + defaultDueDate);

      // S'assurer que le taux de TVA vient des settings
      const vatRate = settings.vatRate;
      const subtotal = data.subtotal;
      const vatAmount = (subtotal * vatRate) / 100;
      const total = subtotal + vatAmount;

      // Préparer les données de la facture
      const invoiceData = {
        ...data,
        number,
        date: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        vatRate,
        vatAmount,
        total,
        paymentTerms: data.paymentTerms || defaultPaymentTerms,
        notes: data.notes || defaultNotes,
        status: 'pending',
        paidAmount: 0,
        remainingAmount: total,
        payments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Données de la facture à créer:', invoiceData);

      // Créer la facture
      const docRef = doc(collection(db, 'invoices'));
      transaction.set(docRef, invoiceData);

      // Mettre à jour le compteur si nécessaire
      if (settings.billing.invoicing.numberingFormat === 'increment' && autoNumbering) {
        const settingsRef = doc(db, 'settings', 'global');
        const newNextNumber = settings.billing.invoicing.nextNumber + 1;
        console.log('Mise à jour du compteur:', newNextNumber);
        transaction.update(settingsRef, {
          'billing.invoicing.nextNumber': newNextNumber
        });
      }

      return {
        id: docRef.id,
        ...invoiceData
      } as Invoice;
    });
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    throw error;
  }
}