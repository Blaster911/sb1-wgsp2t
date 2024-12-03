import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Ticket } from '../types/ticket';

export function generateTicketPDF(ticket: Ticket): void {
  const doc = new jsPDF();
  
  // Configuration
  const margin = 20;
  let y = margin;
  const lineHeight = 7;
  
  // Fonctions utilitaires
  const addLine = (text: string) => {
    doc.text(text, margin, y);
    y += lineHeight;
  };
  
  const addSection = (title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
  };

  // En-tête
  doc.setFontSize(18);
  doc.text('Fiche d\'intervention', margin, y);
  y += lineHeight * 2;
  
  doc.setFontSize(12);
  addLine(`Ticket #${ticket.id.slice(0, 8)}`);
  addLine(`Date: ${format(new Date(ticket.createdAt), 'Pp', { locale: fr })}`);
  y += lineHeight;

  // Informations client
  addSection('Client');
  addLine(`Nom: ${ticket.clientName}`);
  addLine(`Email: ${ticket.clientEmail}`);
  addLine(`Téléphone: ${ticket.clientPhone}`);
  addLine(`Adresse: ${ticket.clientAddress}`);
  y += lineHeight;

  // Informations appareil
  addSection('Appareil');
  addLine(`Type: ${ticket.deviceType}`);
  addLine(`Marque: ${ticket.deviceBrand}`);
  addLine(`Modèle: ${ticket.deviceModel}`);
  if (ticket.devicePassword) {
    addLine(`Mot de passe: ${ticket.devicePassword}`);
  }
  y += lineHeight;

  // Problème et statut
  addSection('Détails de l\'intervention');
  addLine(`Priorité: ${ticket.priority === 'high' ? 'Haute' : ticket.priority === 'medium' ? 'Moyenne' : 'Basse'}`);
  addLine(`Statut: ${ticket.status}`);
  y += lineHeight;

  addSection('Description du problème');
  const problemLines = doc.splitTextToSize(ticket.problem, 170);
  problemLines.forEach((line: string) => {
    addLine(line);
  });
  y += lineHeight;

  // Notes
  if (ticket.notes.length > 0) {
    addSection('Notes');
    ticket.notes.forEach((note, index) => {
      const noteLines = doc.splitTextToSize(`${index + 1}. ${note}`, 170);
      noteLines.forEach((line: string) => {
        addLine(line);
      });
    });
  }

  // Zone de signature
  y = doc.internal.pageSize.height - 60;
  doc.line(margin, y, 90, y);
  doc.line(110, y, 190, y);
  y += 5;
  doc.text('Signature technicien', margin, y);
  doc.text('Signature client', 110, y);

  // Sauvegarde du PDF
  doc.save(`ticket-${ticket.id.slice(0, 8)}.pdf`);
}