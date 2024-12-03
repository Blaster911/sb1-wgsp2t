export interface Settings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  vatRate: number;
  siret: string;
  updatedAt: string;
  billing: {
    paymentMethods: {
      card: boolean;
      cash: boolean;
      transfer: boolean;
    };
    invoicing: {
      autoNumbering: boolean;
      prefix: string;
      numberingFormat: 'date' | 'datetime' | 'increment';
      nextNumber: number;
      defaultDueDate: number;
      defaultPaymentTerms: string;
      defaultNotes: string;
      allowPartialPayments: boolean;
      allowDeposits: boolean;
      minDepositPercentage: number;
    };
    bankAccount: {
      name: string;
      iban: string;
      bic: string;
    };
    invoiceTemplates: {
      defaultTemplate: 'modern' | 'classic';
      primaryColor: string;
      accentColor: string;
      showLogo: boolean;
      showWatermark: boolean;
      showPaymentQR: boolean;
      customHeader?: string;
      customFooter?: string;
    };
  };
  profile?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string;
    theme: 'light' | 'dark' | 'system';
    language: 'fr' | 'en';
  };
}