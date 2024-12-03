import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Product } from '../../stores/productStore';

interface DeleteProductModalProps {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteProductModal({ product, onConfirm, onCancel }: DeleteProductModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Supprimer l'article
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer l'article suivant ?
          </p>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-gray-500">Référence: {product.reference}</p>
          </div>

          <p className="mt-4 text-sm text-red-600">
            Cette action est irréversible.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="btn bg-red-600 text-white hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}