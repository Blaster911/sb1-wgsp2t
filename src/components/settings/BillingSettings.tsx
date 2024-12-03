import React from 'react';
import { CreditCard } from 'lucide-react';
import { InvoiceSettings } from './billing/InvoiceSettings';
import { PaymentMethodSettings } from './billing/PaymentMethodSettings';
import { BankAccountSettings } from './billing/BankAccountSettings';
import { InvoiceTemplateSettings } from './billing/InvoiceTemplateSettings';
import { Settings } from '../../types/settings';

interface BillingSettingsProps {
  settings: Settings;
  onSubmit: (data: Partial<Settings>) => Promise<void>;
  isSaving: boolean;
}

export function BillingSettings({ settings, onSubmit, isSaving }: BillingSettingsProps) {
  // Ensure settings and billing properties exist with default values
  const defaultBilling = {
    invoicing: {
      autoNumbering: true,
      prefix: 'FAC',
      numberingFormat: 'datetime',
      nextNumber: 100,
      defaultDueDate: 30,
      defaultPaymentTerms: 'Paiement à 30 jours',
      defaultNotes: '',
      allowPartialPayments: true,
      allowDeposits: true,
      minDepositPercentage: 30
    },
    paymentMethods: {
      card: true,
      cash: true,
      transfer: true
    },
    bankAccount: {
      name: '',
      iban: '',
      bic: ''
    },
    invoiceTemplates: {
      defaultTemplate: 'modern',
      primaryColor: '#000000',
      accentColor: '#455878',
      showLogo: true,
      showWatermark: false,
      showPaymentQR: false
    }
  };

  const billing = settings?.billing || defaultBilling;

  const handleInvoiceSettingsChange = async (invoicingData: any) => {
    await onSubmit({
      billing: {
        ...billing,
        invoicing: invoicingData
      }
    });
  };

  const handlePaymentMethodsChange = async (paymentMethodsData: any) => {
    await onSubmit({
      billing: {
        ...billing,
        paymentMethods: paymentMethodsData
      }
    });
  };

  const handleBankAccountChange = async (bankAccountData: any) => {
    await onSubmit({
      billing: {
        ...billing,
        bankAccount: bankAccountData
      }
    });
  };

  const handleTemplateSettingsChange = async (templateData: any) => {
    await onSubmit({
      billing: {
        ...billing,
        invoiceTemplates: templateData
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-500" />
          Paramètres de facturation
        </h2>

        <div className="space-y-8">
          <InvoiceSettings
            settings={billing.invoicing}
            onSubmit={handleInvoiceSettingsChange}
            isSaving={isSaving}
          />

          <InvoiceTemplateSettings
            settings={billing.invoiceTemplates}
            onSubmit={handleTemplateSettingsChange}
            isSaving={isSaving}
          />

          <PaymentMethodSettings
            settings={billing.paymentMethods}
            onSubmit={handlePaymentMethodsChange}
            isSaving={isSaving}
          />

          <BankAccountSettings
            settings={billing.bankAccount}
            onSubmit={handleBankAccountChange}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}