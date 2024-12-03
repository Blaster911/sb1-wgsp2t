import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Quote } from '../stores/quoteStore';
import { Settings } from '../types/settings';

export async function generateQuotePDF(quote: Quote, settings: Settings): Promise<void> {
  try {
    // Créer un nouveau document PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // Couleurs
    const primaryColor = [41, 128, 185];     // Bleu moderne
    const secondaryColor = [236, 240, 241];  // Gris très clair
    const accentColor = [52, 73, 94];        // Gris bleuté
    const textColor = [44, 62, 80];          // Gris foncé

    // Formatage des nombres
    const formatNumber = (num: number): string => {
      return num.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
      }).replace(/\s/g, ' ');
    };

    // Fonctions de calcul
    const calculateItemTotal = (item: { quantity: number; unitPrice: number }) => item.quantity * item.unitPrice;
    const calculateSubtotal = (items: Array<{ quantity: number; unitPrice: number }>) => 
      items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const calculateVAT = (subtotal: number, vatRate: number) => 
      (subtotal * vatRate) / 100;

    // Calculs des totaux
    const subtotal = calculateSubtotal(quote.items);
    const vatAmount = calculateVAT(subtotal, settings.vatRate);
    const total = subtotal + vatAmount;

    // En-tête avec bande colorée
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 30, 'F');

    // Logo ou nom de l'entreprise
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.companyName, margin, 22);

    // Numéro de devis
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('DEVIS', pageWidth - margin - 40, 15);
    doc.setFontSize(12);
    doc.text(quote.number, pageWidth - margin - 40, 22);

    // Informations de l'entreprise
    y = 45;
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text([
      settings.address,
      `Tél: ${settings.phone}`,
      `Email: ${settings.email}`,
      `SIRET: ${settings.siret}`
    ], margin, y);

    // Dates
    const dateBoxWidth = 80;
    doc.setFillColor(...secondaryColor);
    doc.roundedRect(pageWidth - margin - dateBoxWidth, 45, dateBoxWidth, 40, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    y = 53;
    doc.text('Date d\'émission:', pageWidth - margin - 75, y);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(quote.date), 'dd/MM/yyyy', { locale: fr }), pageWidth - margin - 15, y, { align: 'right' });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Valable jusqu\'au:', pageWidth - margin - 75, y);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(quote.validUntil), 'dd/MM/yyyy', { locale: fr }), pageWidth - margin - 15, y, { align: 'right' });

    // Informations client
    y = 95;
    doc.setFillColor(...secondaryColor);
    doc.roundedRect(margin, y, contentWidth, 40, 5, 5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('CLIENT', margin + 15, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.text([
      quote.clientName,
      quote.clientEmail,
      quote.clientPhone || '',
      quote.clientAddress || ''
    ], margin + 15, y + 22);

    // Tableau des articles
    y = 140;

    // En-tête du tableau
    doc.setFillColor(...primaryColor);
    doc.rect(margin, y, contentWidth, 12, 'F');

    // Configuration des colonnes
    const columns = [
      { header: 'Description', x: margin + 5, width: contentWidth * 0.4 },
      { header: 'Référence', x: margin + 5 + (contentWidth * 0.4), width: contentWidth * 0.2 },
      { header: 'Qté', x: margin + 5 + (contentWidth * 0.6), width: contentWidth * 0.1 },
      { header: 'Prix unit. HT', x: margin + 5 + (contentWidth * 0.7), width: contentWidth * 0.15 },
      { header: 'Total HT', x: margin + 5 + (contentWidth * 0.85), width: contentWidth * 0.15 }
    ];

    // En-têtes des colonnes
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    columns.forEach(col => {
      doc.text(col.header, col.x, y + 8);
    });

    // Corps du tableau
    y += 17;
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');

    quote.items.forEach((item, index) => {
      const itemTotal = calculateItemTotal(item);

      if (index % 2 === 0) {
        doc.setFillColor(...secondaryColor);
        doc.rect(margin, y - 5, contentWidth, 10, 'F');
      }

      const descriptionLines = doc.splitTextToSize(item.description, columns[0].width - 5);
      doc.text(descriptionLines, columns[0].x, y);

      doc.text(item.reference || '-', columns[1].x, y);
      doc.text(item.quantity.toString(), columns[2].x, y);
      doc.text(`${formatNumber(item.unitPrice)} €`, columns[3].x, y);
      doc.text(`${formatNumber(itemTotal)} €`, columns[4].x, y);

      y += descriptionLines.length > 1 ? 10 * descriptionLines.length : 10;
    });

    // Totaux
    y += 10;
    const totalsWidth = 100;
    const totalsX = pageWidth - margin - totalsWidth - 20;

    doc.setFillColor(...secondaryColor);
    doc.roundedRect(totalsX - 10, y - 5, totalsWidth + 10, 45, 5, 5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text('Sous-total HT:', totalsX, y + 5);
    doc.text(`${formatNumber(subtotal)} €`, totalsX + totalsWidth, y + 5, { align: 'right' });

    y += 12;
    doc.text(`TVA (${settings.vatRate}%)`, totalsX, y);
    doc.text(`${formatNumber(vatAmount)} €`, totalsX + totalsWidth, y, { align: 'right' });

    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Total TTC:', totalsX, y);
    doc.text(`${formatNumber(total)} €`, totalsX + totalsWidth, y, { align: 'right' });

    // Conditions (à gauche)
    y += 30;
    const conditionsY = y;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('Conditions', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text([
      'Ce devis est valable 30 jours à compter de sa date d\'émission.',
      'Pour accepter ce devis, merci de le retourner signé avec la mention "Bon pour accord".'
    ], margin, y);

    // Notes (à droite)
    if (quote.notes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', pageWidth - margin - 100, conditionsY);
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(quote.notes, 100);
      doc.text(noteLines, pageWidth - margin - 100, conditionsY + 6);
    }

    // Pied de page
    const footerY = pageHeight - margin;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...accentColor);

    // Ligne de séparation
    doc.setDrawColor(...primaryColor);
    doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

    // Texte du pied de page avec mention TVA conditionnelle
    const footerParts = [
      `${settings.companyName}`,
      `SIRET: ${settings.siret}`
    ];

    if (settings.vatRate > 0) {
      footerParts.push(`TVA Intracom: FR${settings.siret.substring(0, 9)}`);
    } else {
      footerParts.push('TVA non applicable, article 293B du CGI');
    }

    footerParts.push(settings.address);

    const footerText = footerParts.join(' - ');
    doc.text(footerText, pageWidth / 2, footerY - 5, { align: 'center' });

    // Ouvrir le PDF dans un nouvel onglet
    const pdfOutput = doc.output('bloburl');
    window.open(pdfOutput, '_blank');

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Erreur lors de la génération du PDF: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
  }
}