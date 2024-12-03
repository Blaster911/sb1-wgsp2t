import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { Invoice } from '../../types/invoice';
import { useInvoiceStore } from '../../stores/invoiceStore';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSettingsStore } from '../../stores/settingsStore';
import { ProductAutocomplete } from './ProductAutocomplete';
import { ClientSearch } from '../clients/ClientSearch';
import { Toast } from '../ui/Toast';
import { Client } from '../../types/client';

interface EditInvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export function EditInvoiceModal({ invoice, onClose }: EditInvoiceModalProps) {
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { updateInvoice } = useInvoiceStore();
  const { settings } = useSettingsStore();
  const [selectedClient, setSelectedClient] = useState<Client>({
    id: invoice.clientId,
    name: invoice.clientName,
    email: invoice.clientEmail,
    address: invoice.clientAddress || '',
    phone: '',
    joinDate: '',
    totalSpent: 0,
    totalTickets: 0,
    activeTickets: 0
  });
  
  const { register, handleSubmit, setValue, watch, control, getValues } = useForm({
    defaultValues: {
      ...invoice,
      items: invoice.items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
      }))
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const items = watch('items');
  
  const updateTotals = () => {
    if (!settings) {
      console.warn('Settings not available for tax calculation');
      return;
    }

    const currentItems = getValues('items');
    const subtotal = currentItems.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0);
    const vatRate = settings.vatRate;
    const vatAmount = (subtotal * vatRate) / 100;
    const total = subtotal + vatAmount;
    const paidAmount = invoice.paidAmount || 0;

    setValue('subtotal', subtotal);
    setValue('vatAmount', vatAmount);
    setValue('total', total);
    setValue('remainingAmount', total - paidAmount);
    setValue('vatRate', vatRate);
  };

  useEffect(() => {
    if (settings) {
      updateTotals();
    }
  }, [items, settings]);

  const handleQuantityChange = (index: number, value: string) => {
    const quantity = parseInt(value) || 0;
    const unitPrice = getValues(`items.${index}.unitPrice`) || 0;
    const total = quantity * unitPrice;
    
    setValue(`items.${index}.quantity`, quantity);
    setValue(`items.${index}.total`, total);
    updateTotals();
  };

  const handleUnitPriceChange = (index: number, value: string) => {
    const unitPrice = parseFloat(value) || 0;
    const quantity = getValues(`items.${index}.quantity`) || 0;
    const total = quantity * unitPrice;
    
    setValue(`items.${index}.unitPrice`, unitPrice);
    setValue(`items.${index}.total`, total);
    updateTotals();
  };

  const handleProductSelect = (product: any, index: number) => {
    setValue(`items.${index}.description`, product.name);
    setValue(`items.${index}.reference`, product.reference);
    setValue(`items.${index}.unitPrice`, product.price);
    
    const quantity = getValues(`items.${index}.quantity`) || 1;
    setValue(`items.${index}.total`, quantity * product.price);
    
    updateTotals();
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setValue('clientId', client.id);
    setValue('clientName', client.name);
    setValue('clientEmail', client.email);
    setValue('clientAddress', client.address);
  };

  const onSubmit = async (data: any) => {
    try {
      await updateInvoice(invoice.id, {
        ...data,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientEmail: selectedClient.email,
        clientAddress: selectedClient.address,
        updatedAt: new Date().toISOString()
      });
      
      setToast({
        type: 'success',
        message: 'Facture mise à jour avec succès'
      });
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la facture'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Modifier la facture {invoice.number}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Client Section */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">Client</h3>
              <ClientSearch
                onClientSelect={handleClientSelect}
                selectedClient={selectedClient}
                onNewClient={() => {}}
              />
            </div>

            {/* Items Section */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Articles</h3>
                <button
                  type="button"
                  onClick={() => {
                    append({
                      id: crypto.randomUUID(),
                      description: '',
                      reference: '',
                      quantity: 1,
                      unitPrice: 0,
                      total: 0
                    });
                  }}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une ligne
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <ProductAutocomplete
                        value={watch(`items.${index}.description`)}
                        onChange={(value) => setValue(`items.${index}.description`, value)}
                        onSelect={(product) => handleProductSelect(product, index)}
                        placeholder="Description"
                        className="mb-2"
                      />
                      <input
                        {...register(`items.${index}.reference`)}
                        placeholder="Référence"
                        className="input text-sm"
                        readOnly
                      />
                    </div>

                    <input
                      type="number"
                      {...register(`items.${index}.quantity`)}
                      className="input w-24"
                      min="1"
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                    />

                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unitPrice`)}
                      className="input w-32"
                      onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                    />

                    <div className="w-32 px-4 py-2 bg-gray-50 rounded-lg text-right">
                      {(getValues(`items.${index}.total`) || 0).toLocaleString('fr-FR', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="mt-6 border-t pt-4">
                <div className="w-72 ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total HT</span>
                    <span className="font-medium">
                      {watch('subtotal')?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA ({settings?.vatRate || 0}%)</span>
                    <span className="font-medium">
                      {watch('vatAmount')?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-medium border-t pt-2">
                    <span>Total TTC</span>
                    <span>
                      {watch('total')?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  {invoice.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Déjà payé</span>
                        <span>
                          {invoice.paidAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-blue-600 font-medium">
                        <span>Reste à payer</span>
                        <span>
                          {watch('remainingAmount')?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Notes et conditions */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="input"
                  placeholder="Notes ou conditions particulières..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conditions de paiement
                </label>
                <input
                  type="text"
                  {...register('paymentTerms')}
                  className="input"
                  placeholder={settings?.billing?.invoicing?.defaultPaymentTerms || 'Conditions de paiement...'}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Enregistrer les modifications
            </button>
          </div>
        </form>

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}