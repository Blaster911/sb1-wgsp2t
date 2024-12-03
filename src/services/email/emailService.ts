import emailjs from '@emailjs/browser';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { config } from '../../config';

const EMAIL_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

// Interface étendue pour les données du template
interface EmailTemplateParams {
  to_email: string;
  to_name: string;
  subject?: string;
  message: string;
  ticket_id: string;
  device_type: string;
  device_brand: string;
  device_model: string;
  status: string;
  problem: string;
  diagnostic_note?: string;
  tracking_url?: string;
}

export interface EmailData {
  to: string;
  toName: string;
  subject: string;
  body: string;
  ticketId: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  status: string;
  problem: string;
  diagnosticNote?: string;
}

// Fonction pour convertir le statut en français
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    reception: 'Réceptionné',
    diagnostic: 'En diagnostic',
    waiting_client: 'En attente de votre réponse',
    waiting_parts: 'En attente de pièces',
    completed: 'Réparation terminée',
  };
  return statusMap[status] || status;
};

export const emailService = {
  init() {
    if (!EMAIL_CONFIG.PUBLIC_KEY) {
      throw new Error('EmailJS public key is not configured');
    }
    emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
  },

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!EMAIL_CONFIG.SERVICE_ID || !EMAIL_CONFIG.TEMPLATE_ID) {
        throw new Error('EmailJS service ID or template ID is not configured');
      }

      // Construction du tracking URL (à adapter selon votre application)
      const trackingUrl = `${window.location.origin}/tickets/${emailData.ticketId}`;

      // Préparation des paramètres pour le template
      const templateParams: EmailTemplateParams = {
        to_email: emailData.to,
        to_name: emailData.toName,
        message: emailData.body,
        ticket_id: emailData.ticketId,
        device_type: emailData.deviceType,
        device_brand: emailData.deviceBrand,
        device_model: emailData.deviceModel,
        status: getStatusLabel(emailData.status),
        problem: emailData.problem,
        diagnostic_note: emailData.diagnosticNote || '',
        tracking_url: trackingUrl,
      };

      // Envoi de l'email via EmailJS
      const response = await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID,
        templateParams
      );

      // Si l'envoi est réussi, enregistrer dans Firestore
      if (response.status === 200) {
        await addDoc(collection(db, 'emails'), {
          ...emailData,
          sentAt: new Date().toISOString(),
          status: 'sent',
        });
        return true;
      }

      throw new Error(`EmailJS response status: ${response.status}`);
    } catch (error) {
      console.error('Error sending email:', error);

      // Enregistrer l'échec dans Firestore
      await addDoc(collection(db, 'emails'), {
        ...emailData,
        sentAt: new Date().toISOString(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  },

  // Templates prédéfinis
  getEmailTemplate(
    type: 'reception' | 'diagnostic' | 'completion',
    data: {
      clientName: string;
      deviceBrand: string;
      deviceModel: string;
      problem: string;
      diagnosticNote?: string;
    }
  ): { subject: string; body: string } {
    switch (type) {
      case 'reception':
        return {
          subject: 'Confirmation de réception de votre appareil',
          body: `Nous avons bien réceptionné votre ${data.deviceBrand} ${data.deviceModel}. Notre équipe va procéder au diagnostic dans les plus brefs délais.`,
        };
      case 'diagnostic':
        return {
          subject: 'Diagnostic de votre appareil terminé',
          body: `Le diagnostic de votre ${data.deviceBrand} ${
            data.deviceModel
          } est terminé.\n\n${data.diagnosticNote || ''}`,
        };
      case 'completion':
        return {
          subject: 'Votre appareil est prêt',
          body: `La réparation de votre ${data.deviceBrand} ${data.deviceModel} est terminée. Vous pouvez venir le récupérer à notre atelier.`,
        };
      default:
        throw new Error('Type de template inconnu');
    }
  },
};

export default emailService;
