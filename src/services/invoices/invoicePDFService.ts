import { jsPDF } from 'jspdf';
import { Invoice } from '../../types/invoice';
import { Settings } from '../../types/settings';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { invoiceTemplateService } from './invoiceTemplateService';

export async function generateInvoicePDF(invoice: Invoice, settings: Settings): Promise<void> {
  try {
    // Récupérer le template par défaut
    const template = invoiceTemplateService.getDefaultTemplate(settings);
    
    // Créer un nouveau document PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = template.layout.margins;
    const contentWidth = pageWidth - (margin.left + margin.right);

    // En-tête
    doc.setFillColor(...hexToRgb(template.styles.primaryColor));
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Informations de l'entreprise
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(template.styles.fontFamily, 'bold');
    doc.text(settings.companyName, margin.left, 15);

    // Numéro de facture et date
    doc.setFontSize(12);
    doc.text('FACTURE', pageWidth - margin.right - 50, 15);
    doc.text(invoice.number, pageWidth - margin.right - 50, 23);

    // Informations client
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('FACTURER À :', margin.left, 50);
    doc.setFont(template.styles.fontFamily, 'normal');
    doc.text([
      invoice.clientName,
      invoice.clientEmail,
      invoice.clientAddress || ''
    ], margin.left, 58);

    // Tableau des articles
    let y = 90;
    
    // En-tête du tableau
    doc.setFillColor(...hexToRgb(template.styles.primaryColor));
    doc.rect(margin.left, y, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(template.styles.fontFamily, 'bold');
    
    // Colonnes
    const columns = [
      { header: 'Description', x: margin.left + 3, width: contentWidth * 0.4 },
      { header: 'Qté', x: margin.left + contentWidth * 0.4 + 3, width: contentWidth * 0.1 },
      { header: 'Prix unit. HT', x: margin.left + contentWidth * 0.5 + 3, width: contentWidth * 0.2 },
      { header: 'Total HT', x: margin.left + contentWidth * 0.7 + 3, width: contentWidth * 0.3 }
    ];

    columns.forEach(col => {
      doc.text(col.header, col.x, y + 6);
    });

    // Articles
    y += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFont(template.styles.fontFamily, 'normal');

    invoice.items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin.left, y - 3, contentWidth, 8, 'F');
      }

      doc.text(item.description, columns[0].x, y);
      doc.text(item.quantity.toString(), columns[1].x, y);
      doc.text(
        item.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €',
        columns[2].x, y
      );
      doc.text(
        (item.quantity * item.unitPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €',
        columns[3].x, y
      );

      y += 8;
    });

    // Totaux
    y += 10;
    const totalsWidth = 70;
    const totalsX = pageWidth - margin.right - totalsWidth;

    doc.text('Sous-total HT:', totalsX, y);
    doc.text(
      invoice.subtotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €',
      pageWidth - margin.right, y, { align: 'right' }
    );

    y += 6;
    doc.text(`TVA (${invoice.vatRate}%)`, totalsX, y);
    doc.text(
      invoice.vatAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €',
      pageWidth - margin.right, y, { align: 'right' }
    );

    y += 8;
    doc.setFont(template.styles.fontFamily, 'bold');
    doc.text('Total TTC:', totalsX, y);
    doc.text(
      invoice.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €',
      pageWidth - margin.right, y, { align: 'right' }
    );

    // Pied de page
    if (template.layout.footer.customText) {
      doc.setFont(template.styles.fontFamily, 'normal');
      doc.setFontSize(8);
      doc.text(
        template.layout.footer.customText,
        pageWidth / 2,
        pageHeight - margin.bottom,
        { align: 'center' }
      );
    }

    // Ouvrir le PDF dans un nouvel onglet
    const pdfOutput = doc.output('bloburl');
    window.open(pdfOutput, '_blank');

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Erreur lors de la génération du PDF');
  }
}

function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}