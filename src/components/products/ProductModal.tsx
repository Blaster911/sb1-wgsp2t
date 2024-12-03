import React from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Product } from '../../stores/productStore';

interface ProductModalProps {
  product?: Product;
  onSubmit: (data: Omit<Product, 'id'>) => void;
  onClose: () => void;
}

const categories = [
  'Pièces détachées',
  'Batteries',
  'Écrans',
  'Connecteurs',
  'Outils',
  'Accessoires'
];

export function ProductModal({ product, onSubmit, onClose }: ProductModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product || {
      name: '',
      reference: '',
      category: '',
      price: 0,
      stock: 0,
      minStock: 0,
      supplier: '',
      description: ''
    }
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {product ? 'Modifier l\'article' : 'Nouvel article'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom de l'article
              </label>
              <input
                type="text"
                className="input mt-1"
                {...register('name', { required: 'Le nom est requis' })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Référence
              </label>
              <input
                type="text"
                className="input mt-1"
                {...register('reference', { required: 'La référence est requise' })}
              />
              {errors.reference && (
                <p className="text-red-500 text-sm mt-1">{errors.reference.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Catégorie
              </label>
              <select
                className="input mt-1"
                {...register('category', { required: 'La catégorie est requise' })}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prix (€)
              </label>
              <input
                type="number"
                step="0.01"
                className="input mt-1"
                {...register('price', {
                  required: 'Le prix est requis',
                  min: { value: 0, message: 'Le prix doit être positif' }
                })}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock actuel
              </label>
              <input
                type="number"
                className="input mt-1"
                {...register('stock', {
                  required: 'Le stock est requis',
                  min: { value: 0, message: 'Le stock doit être positif' }
                })}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock minimum
              </label>
              <input
                type="number"
                className="input mt-1"
                {...register('minStock', {
                  required: 'Le stock minimum est requis',
                  min: { value: 0, message: 'Le stock minimum doit être positif' }
                })}
              />
              {errors.minStock && (
                <p className="text-red-500 text-sm mt-1">{errors.minStock.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fournisseur
              </label>
              <input
                type="text"
                className="input mt-1"
                {...register('supplier')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="input mt-1"
                rows={3}
                {...register('description')}
              />
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
              className="btn btn-primary"
            >
              {product ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}