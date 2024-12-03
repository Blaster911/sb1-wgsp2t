import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { ClientSearch } from '../clients/ClientSearch';
import { ProductAutocomplete } from './ProductAutocomplete';
import { Client } from '../../types/client';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Toast } from '../ui/Toast';
import { useSettingsStore } from '../../stores/settingsStore';

interface InvoiceFormData {
  items: Array<{
    id: string;
    description: string;
    reference: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  notes?: string;
  paymentTerms?: string;
  subtotal: number;
  vatAmount: number;
  total: number;
}

interface InvoiceFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function InvoiceForm({ onSubmit, onCancel }: InvoiceFormProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { settings, loading: settingsLoading } = useSettingsStore();
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, onCancel);

  const { register, control, handleSubmit, watch, setValue, getValues } = useForm<InvoiceFormData>({
    defaultValues: {
      items: [{
        id: crypto.randomUUID(),
        description: '',
        reference: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }],
      notes: '',
      paymentTerms: settings?.billing?.invoicing?.defaultPaymentTerms || '',
      subtotal: 0,
      vatAmount: 0,
      total: 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  // Observer les changements sur les items pour mettre à jour les totaux
  const items = watch('items');

const updateTotals = useCallback(() => {
  if (!settings) return;

  const currentItems = getValues('items');
  const subtotal = currentItems.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return sum + (quantity * unitPrice);
  }, 0);

  // Utiliser uniquement le taux des settings
  const vatRate = settings.vatRate;  // Supprimer le || 20
  const vatAmount = (subtotal * vatRate) / 100;
  const total = subtotal + vatAmount;

  setValue('subtotal', Number(subtotal.toFixed(2)));
  setValue('vatAmount', Number(vatAmount.toFixed(2)));
  setValue('total', Number(total.toFixed(2)));
}, [settings, setValue, getValues]);

  useEffect(() => {
    if (settings) {
      updateTotals();
    }
  }, [items, settings, updateTotals]);

  
  
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

  const handleFormSubmit = async (data: InvoiceFormData) => {
    if (!selectedClient) {
      setToast({
        type: 'error',
        message: 'Veuillez sélectionner un client'
      });
      return;
    }

    if (!settings) {
      setToast({
        type: 'error',
        message: 'Les paramètres ne sont pas disponibles'
      });
      return;
    }

    if (!data.items || data.items.length === 0) {
      setToast({
        type: 'error',
        message: 'Veuillez ajouter au moins un article'
      });
      return;
    }

     try {
    const invoiceData = {
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + (settings?.billing?.invoicing?.defaultDueDate || 30) * 24 * 60 * 60 * 1000).toISOString(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientEmail: selectedClient.email,
      clientAddress: selectedClient.address,
      items: data.items,
      subtotal: data.subtotal,
      vatAmount: data.vatAmount,
      vatRate: settings.vatRate,  // Supprimer le || 20
      total: data.total,
      notes: data.notes,
      paymentTerms: data.paymentTerms || settings?.billing?.invoicing?.defaultPaymentTerms
    };

      await onSubmit(invoiceData);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur lors de la création de la facture'
      });
    }
  };

  if (settingsLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Nouvelle facture</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Client Section */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">Client</h3>
              <ClientSearch
                onClientSelect={setSelectedClient}
                onNewClient={() => {}}
                selectedClient={selectedClient}
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
                      {watch('subtotal').toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA ({settings?.vatRate}%)</span>
                    <span className="font-medium">
                      {watch('vatAmount').toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-medium border-t pt-2">
                    <span>Total TTC</span>
                    <span>
                      {watch('total').toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
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
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Créer la facture
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