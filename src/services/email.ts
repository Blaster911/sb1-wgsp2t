import { functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const sendEmailFunction = httpsCallable(functions, 'sendEmail');
    const result = await sendEmailFunction({ to, subject, html });
    return result.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};