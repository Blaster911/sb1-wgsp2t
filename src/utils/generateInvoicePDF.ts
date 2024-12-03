import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Invoice } from '../types/invoice';
import { Settings } from '../types/settings';

// Define template styles
const TEMPLATES = {
  modern: {
    colors: {
      primary: { rgb: [30, 64, 175] },
      accent: { rgb: [59, 130, 246] },
      text: { rgb: [31, 41, 55] },
      light: { rgb: [243, 244, 246] },
      white: { rgb: [255, 255, 255] },
      success: { rgb: [16, 185, 129] },
      divider: { rgb: [209, 213, 219] }
    },
    fonts: {
      primary: 'helvetica',
      secondary: 'helvetica'
    }
  },
  classic: {
    colors: {
      primary: { rgb: [51, 65, 85] },
      accent: { rgb: [71, 85, 105] },
      text: { rgb: [15, 23, 42] },
      light: { rgb: [241, 245, 249] },
      white: { rgb: [255, 255, 255] },
      success: { rgb: [20, 184, 166] },
      divider: { rgb: [226, 232, 240] }
    },
    fonts: {
      primary: 'times',
      secondary: 'helvetica'
    }
  }
};

const formatNumber = (num: number): string => {
  return num.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  });
};

export async function generateInvoicePDF(
  invoice: Invoice, 
  settings: Settings, 
  templateStyle: 'modern' | 'classic' = 'modern'
): Promise<void> {
  try {
    const template = TEMPLATES[templateStyle];
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = templateStyle === 'modern' ? 15 : 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // Header style based on template
    if (templateStyle === 'modern') {
      // Modern header with gradient
      doc.setFillColor(...template.colors.primary.rgb);
      doc.rect(0, 0, pageWidth, 35, 'F');

      y = 15;
      doc.setTextColor(...template.colors.white.rgb);
      doc.setFontSize(20);
      doc.setFont(template.fonts.primary, 'bold');
      doc.text(settings.companyName, margin, y);

      doc.setFontSize(8);
      doc.setFont(template.fonts.primary, 'normal');
      doc.text([
        `${settings.address} | Tél: ${settings.phone} | Email: ${settings.email} | SIRET: ${settings.siret}`
      ], margin, y + 8);

      doc.setFontSize(16);
      doc.text('FACTURE', pageWidth - margin - 50, y);
      doc.setFontSize(12);
      doc.text(invoice.number, pageWidth - margin - 50, y + 8);
    } else {
      // Classic header
      doc.setTextColor(...template.colors.primary.rgb);
      doc.setFontSize(24);
      doc.setFont(template.fonts.primary, 'bold');
      doc.text(settings.companyName, margin, y);

      y += 15;
      doc.setFontSize(10);
      doc.setFont(template.fonts.secondary, 'normal');
      doc.setTextColor(...template.colors.text.rgb);
      doc.text([
        settings.address,
        `Tél: ${settings.phone}`,
        `Email: ${settings.email}`,
        `SIRET: ${settings.siret}`
      ], margin, y);

      // Invoice title and number
      doc.setFontSize(18);
      doc.setFont(template.fonts.primary, 'bold');
      doc.text('FACTURE', pageWidth - margin - 60, y - 5);
      doc.setFontSize(12);
      doc.text(invoice.number, pageWidth - margin - 60, y + 5);
    }

    // Client section
    y = templateStyle === 'modern' ? 45 : 70;
    doc.setTextColor(...template.colors.text.rgb);
    doc.setFontSize(9);
    doc.setFont(template.fonts.primary, 'bold');
    doc.text('FACTURER À :', margin, y);
    
    doc.setFont(template.fonts.secondary, 'normal');
    const clientInfo = [invoice.clientName, invoice.clientEmail, invoice.clientAddress || ''].join(' | ');
    doc.text(clientInfo, margin, y + 7);

    // Dates
    const dateFormat = 'dd/MM/yyyy';
    const dateText = `Émission : ${format(new Date(invoice.date), dateFormat, { locale: fr })}`;
    const dueText = invoice.dueDate ? ` | Échéance : ${format(new Date(invoice.dueDate), dateFormat, { locale: fr })}` : '';
    doc.text(dateText + dueText, pageWidth - margin, y + 7, { align: 'right' });

    // Items table
    y += 20;
    
    if (templateStyle === 'modern') {
      doc.setFillColor(...template.colors.primary.rgb);
    } else {
      doc.setFillColor(...template.colors.accent.rgb);
    }
    doc.rect(margin, y, contentWidth, 10, 'F');

    const columns = [
      { header: 'Description', x: margin + 3, width: contentWidth * 0.45 },
      { header: 'Réf.', x: margin + 3 + (contentWidth * 0.45), width: contentWidth * 0.15 },
      { header: 'Qté', x: margin + 3 + (contentWidth * 0.6), width: contentWidth * 0.1 },
      { header: 'P.U. HT', x: margin + 3 + (contentWidth * 0.7), width: contentWidth * 0.15 },
      { header: 'Total HT', x: margin + 3 + (contentWidth * 0.85), width: contentWidth * 0.15 }
    ];

    doc.setTextColor(...template.colors.white.rgb);
    doc.setFontSize(8);
    doc.setFont(template.fonts.primary, 'bold');
    columns.forEach(col => {
      doc.text(col.header, col.x, y + 6);
    });

    // Items
    y += 12;
    doc.setTextColor(...template.colors.text.rgb);
    doc.setFont(template.fonts.secondary, 'normal');

    invoice.items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(...template.colors.light.rgb);
        doc.rect(margin, y - 3, contentWidth, 7, 'F');
      }

      doc.text(item.description, columns[0].x, y);
      doc.text(item.reference || '-', columns[1].x, y);
      doc.text(item.quantity.toString(), columns[2].x, y);
      doc.text(`${formatNumber(item.unitPrice)} €`, columns[3].x, y);
      doc.text(`${formatNumber(item.quantity * item.unitPrice)} €`, columns[4].x, y);

      y += 7;
    });

    // Totals section
    y += 5;
    const totalsWidth = 150;
    const totalsX = pageWidth - margin - totalsWidth;

    // Subtotal and VAT
    doc.setFont(template.fonts.secondary, 'normal');
    doc.text('Sous-total HT:', totalsX, y);
    doc.text(`${formatNumber(invoice.subtotal)} €`, pageWidth - margin, y, { align: 'right' });

    y += 6;
    doc.text(`TVA (${invoice.vatRate || settings.vatRate}%)`, totalsX, y);
    doc.text(`${formatNumber(invoice.vatAmount)} €`, pageWidth - margin, y, { align: 'right' });

    // Total TTC
    y += 8;
    if (templateStyle === 'modern') {
      doc.setFillColor(...template.colors.primary.rgb);
    } else {
      doc.setFillColor(...template.colors.accent.rgb);
    }
    doc.rect(totalsX - 5, y - 4, totalsWidth + 5, 10, 'F');
    doc.setTextColor(...template.colors.white.rgb);
    doc.setFont(template.fonts.primary, 'bold');
    doc.text('Total TTC:', totalsX, y + 2);
    doc.text(`${formatNumber(invoice.total)} €`, pageWidth - margin, y + 2, { align: 'right' });

    // Payment amounts if applicable
    if (invoice.paidAmount > 0) {
      y += 12;
      doc.setTextColor(...template.colors.text.rgb);
      doc.setFont(template.fonts.secondary, 'normal');
      doc.text('Déjà payé:', totalsX, y);
      doc.text(`${formatNumber(invoice.paidAmount)} €`, pageWidth - margin, y, { align: 'right' });

      y += 6;
      doc.setTextColor(...template.colors.accent.rgb);
      doc.setFont(template.fonts.primary, 'bold');
      const remainingAmount = invoice.total - invoice.paidAmount;
      doc.text('Reste à payer:', totalsX, y);
      doc.text(`${formatNumber(remainingAmount)} €`, pageWidth - margin, y, { align: 'right' });
    }

    // Payment history
    if (invoice.payments && invoice.payments.length > 0) {
      y += 20;
      doc.setTextColor(...template.colors.text.rgb);
      doc.setFontSize(8);
      doc.setFont(template.fonts.primary, 'bold');
      doc.text('Historique des paiements', margin, y);
      
      y += 5;
      doc.setFillColor(...template.colors.light.rgb);
      doc.rect(margin, y, contentWidth, 8, 'F');
      
      const paymentColumns = [
        { header: 'Date', x: margin + 3, width: contentWidth * 0.25 },
        { header: 'Méthode', x: margin + 3 + (contentWidth * 0.25), width: contentWidth * 0.25 },
        { header: 'Référence', x: margin + 3 + (contentWidth * 0.5), width: contentWidth * 0.25 },
        { header: 'Montant', x: margin + 3 + (contentWidth * 0.75), width: contentWidth * 0.25 }
      ];

      paymentColumns.forEach(col => {
        doc.text(col.header, col.x, y + 5);
      });

      y += 10;
      doc.setFont(template.fonts.secondary, 'normal');

      invoice.payments.forEach((payment, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(...template.colors.light.rgb);
          doc.rect(margin, y - 3, contentWidth, 7, 'F');
        }

        doc.text(format(new Date(payment.date), dateFormat, { locale: fr }), paymentColumns[0].x, y);
        doc.text(
          payment.method === 'card' ? 'Carte bancaire' :
          payment.method === 'cash' ? 'Espèces' : 'Virement',
          paymentColumns[1].x, y
        );
        doc.text(payment.reference, paymentColumns[2].x, y);
        doc.text(
          formatNumber(payment.amount) + ' €',
          paymentColumns[3].x + paymentColumns[3].width - 5, y,
          { align: 'right' }
        );

        y += 7;
      });
    }

    // Footer
    const footerY = pageHeight - 12;
    if (templateStyle === 'modern') {
      doc.setFillColor(...template.colors.primary.rgb);
    } else {
      doc.setFillColor(...template.colors.accent.rgb);
    }
    doc.rect(0, footerY, pageWidth, 12, 'F');

    doc.setTextColor(...template.colors.white.rgb);
    doc.setFontSize(7);
    doc.setFont(template.fonts.secondary, 'normal');
    const footerText = [
      settings.companyName,
      `SIRET: ${settings.siret}`,
      settings.vatRate > 0 ? `TVA: FR${settings.siret.substring(0, 9)}` : 'TVA non applicable, art. 293B du CGI'
    ].join(' | ');
    
    doc.text(footerText, pageWidth / 2, footerY + 8, { align: 'center' });

    // Open PDF in new tab
    const pdfOutput = doc.output('bloburl');
    window.open(pdfOutput, '_blank');

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Erreur lors de la génération du PDF');
  }
}