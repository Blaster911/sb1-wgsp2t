import { Settings } from '../types/settings';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

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
      invoiceNumber = `${prefix}-${year}${month}${day}-${String(nextNumber).padStart(3, '0')}`;
      finalNextNumber = nextNumber + 1;
      break;
    case 'datetime':
      invoiceNumber = `${prefix}-${year}${month}${day}${hours}${minutes}${seconds}`;
      break;
    case 'increment':
      invoiceNumber = `${prefix}-${String(nextNumber).padStart(6, '0')}`;
      finalNextNumber = nextNumber + 1;
      break;
    default:
      invoiceNumber = `${prefix}-${Date.now()}`;
  }

  const exists = await checkInvoiceNumberExists(invoiceNumber);
  if (exists) {
    return generateUniqueNumber(prefix, format, finalNextNumber, retryCount + 1);
  }

  return {
    number: invoiceNumber,
    nextNumber: finalNextNumber
  };
}

export async function generateInvoiceNumber(settings: Settings): Promise<{ number: string; nextNumber: number }> {
  const { prefix = 'FAC', numberingFormat = 'increment', nextNumber = 1 } = settings.billing?.invoicing || {};

  try {
    const result = await generateUniqueNumber(
      prefix,
      numberingFormat,
      nextNumber
    );

    return result;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    throw error;
  }
}