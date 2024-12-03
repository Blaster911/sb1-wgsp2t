import { Settings } from '../../types/settings';

export interface InvoiceTemplate {
  name: string;
  description: string;
  styles: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
    fontSize: string;
  };
  layout: {
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    header: {
      height: number;
      showLogo: boolean;
      showCompanyInfo: boolean;
    };
    footer: {
      height: number;
      showPageNumbers: boolean;
      customText?: string;
    };
  };
}

export const invoiceTemplateService = {
  getDefaultTemplate(settings: Settings): InvoiceTemplate {
    const { invoiceTemplates } = settings.billing;
    
    return {
      name: 'Default Template',
      description: 'Template par défaut',
      styles: {
        primaryColor: invoiceTemplates.primaryColor || '#1E40AF',
        accentColor: invoiceTemplates.accentColor || '#3B82F6',
        fontFamily: 'helvetica',
        fontSize: '10pt'
      },
      layout: {
        margins: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        },
        header: {
          height: 40,
          showLogo: invoiceTemplates.showLogo,
          showCompanyInfo: true
        },
        footer: {
          height: 30,
          showPageNumbers: true,
          customText: invoiceTemplates.customFooter
        }
      }
    };
  }
};