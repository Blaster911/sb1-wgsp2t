import { Settings } from '../../types/settings';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, runTransaction, doc } from 'firebase/firestore';

async function checkInvoiceNumberExists(number: string): Promise<boolean> {
  const q = query(collection(db, 'invoices'), where('number', '==', number));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

async function generateUniqueNumber(
  prefix: string,
  format: string,
  nextNumber: number,
  retryCount = 0
): Promise<{ number: string; nextNumber: number }> {
  if (retryCount > 100) {
    throw new Error('Impossible de générer un numéro unique après plusieurs tentatives');
  }

  console.log('Génération d\'un numéro unique avec les paramètres:', {
    prefix,
    format,
    nextNumber,
    retryCount
  });

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  let invoiceNumber: string;
  let finalNextNumber = nextNumber;

  switch (format) {
    case 'date':
      // Format: FAC-YYYYMMDD-XXX
      invoiceNumber = `${prefix}-${year}${month}${day}-${String(nextNumber).padStart(3, '0')}`;
      finalNextNumber = nextNumber + 1;
      break;

    case 'datetime':
      // Format: FAC-YYYYMMDDHHmmss
      invoiceNumber = `${prefix}-${year}${month}${day}${hours}${minutes}${seconds}`;
      break;

    case 'increment':
      // Format: FAC-XXXXXX (six chiffres fixes)
      invoiceNumber = `${prefix}-${String(nextNumber).padStart(6, '0')}`;
      finalNextNumber = nextNumber + 1;
      break;

    default:
      // Format par défaut timestamp
      invoiceNumber = `${prefix}-${Date.now()}`;
  }

  console.log('Numéro généré:', {
    invoiceNumber,
    finalNextNumber
  });

  const exists = await checkInvoiceNumberExists(invoiceNumber);
  if (exists) {
    console.log('Le numéro existe déjà, tentative avec le suivant');
    return generateUniqueNumber(prefix, format, finalNextNumber, retryCount + 1);
  }

  return {
    number: invoiceNumber,
    nextNumber: finalNextNumber
  };
}

export async function generateInvoiceNumber(settings: Settings): Promise<{ number: string }> {
  if (!settings?.billing?.invoicing) {
    throw new Error('Les paramètres de facturation ne sont pas disponibles');
  }

  console.log('Paramètres actuels pour la génération du numéro:', {
    settings: settings,
    billingSettings: settings.billing.invoicing
  });

  const { 
    prefix = 'FAC', 
    numberingFormat = 'datetime', 
    nextNumber: initialNextNumber = 1000,
    autoNumbering = true 
  } = settings.billing.invoicing;

  console.log('Paramètres extraits:', {
    prefix,
    numberingFormat,
    initialNextNumber,
    autoNumbering
  });

  try {
    return await runTransaction(db, async (transaction) => {
      // Pour le format incrémental, vérifier le dernier numéro utilisé
      if (numberingFormat === 'increment' && autoNumbering) {
        // Chercher uniquement les numéros au format incrémental (6 chiffres)
        const q = query(
          collection(db, 'invoices'),
          where('number', '>=', `${prefix}-000000`),
          where('number', '<=', `${prefix}-999999`),
          orderBy('number', 'desc'),
          limit(1)
        );

        const snapshot = await getDocs(q);
        let currentNumber = initialNextNumber;

        if (!snapshot.empty) {
          const lastInvoice = snapshot.docs[0].data();
          // Vérifier si le numéro suit le format incrémental (XXXXXX)
          const match = lastInvoice.number.match(new RegExp(`^${prefix}-(\\d{6})$`));
          if (match) {
            const lastNumber = parseInt(match[1]);
            if (!isNaN(lastNumber)) {
              currentNumber = Math.max(lastNumber + 1, initialNextNumber);
            }
          } else {
            // Si le dernier numéro n'est pas au format incrémental,
            // utiliser le numéro initial des paramètres
            currentNumber = initialNextNumber;
          }
        }

        console.log('Dernier numéro trouvé:', {
          currentNumber,
          lastInvoice: snapshot.empty ? null : snapshot.docs[0].data()
        });

        const result = await generateUniqueNumber(prefix, numberingFormat, currentNumber);
        
        // Mettre à jour le compteur dans les paramètres
        if (autoNumbering) {
          const settingsRef = doc(db, 'settings', 'global');
          transaction.update(settingsRef, {
            'billing.invoicing.nextNumber': result.nextNumber
          });
        }

        console.log('Résultat final:', result);
        return { number: result.number };
      }

      // Pour le format date, vérifier le dernier numéro du jour
      if (numberingFormat === 'date' && autoNumbering) {
        const today = new Date();
        const datePrefix = `${prefix}-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        
        const q = query(
          collection(db, 'invoices'),
          where('number', '>=', `${datePrefix}-000`),
          where('number', '<=', `${datePrefix}-999`),
          orderBy('number', 'desc'),
          limit(1)
        );

        const snapshot = await getDocs(q);
        let currentNumber = 1;

        if (!snapshot.empty) {
          const lastInvoice = snapshot.docs[0].data();
          const match = lastInvoice.number.match(/-(\d{3})$/);
          if (match) {
            const lastNumber = parseInt(match[1]);
            if (!isNaN(lastNumber)) {
              currentNumber = lastNumber + 1;
            }
          }
        }

        const result = await generateUniqueNumber(prefix, numberingFormat, currentNumber);
        console.log('Résultat final (format date):', result);
        return { number: result.number };
      }

      // Pour le format datetime ou autres
      const result = await generateUniqueNumber(prefix, numberingFormat, initialNextNumber);
      console.log('Résultat final (format non-incrémental):', result);
      return { number: result.number };
    });
  } catch (error) {
    console.error('Erreur lors de la génération du numéro de facture:', error);
    throw error;
  }
}