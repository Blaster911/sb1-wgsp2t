import React, { useState, useEffect } from 'react';
import { X, Search, Package, Loader2, AlertCircle } from 'lucide-react';
import { useProductStore, Product } from '../../stores/productStore';

interface ProductSearchModalProps {
  onSelect: (productId: string) => void;
  onClose: () => void;
}

export function ProductSearchModal({ onSelect, onClose }: ProductSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { products, loading, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = products.filter(product => {
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.reference.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    });

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = (productId: string) => {
    onSelect(productId);
  };

  const getStockStatusColor = (product: Product) => {
    if (product.stock <= 0) return 'bg-red-100 text-red-800';
    if (product.stock <= (product.minStock || 0)) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-500" />
            Rechercher un article
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Barre de recherche */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, référence ou catégorie..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              value={searchTerm}
              onChange={handleSearchChange}
              autoFocus
            />
          </div>

          {/* Zone de résultats */}
          <div className="relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Chargement des articles...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <AlertCircle className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Aucun article trouvé</p>
                <p className="text-sm">Essayez avec d'autres termes de recherche</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product.id)}
                    className="flex items-start p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg mr-4">
                      <Package className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 mb-2">
                        Réf: {product.reference} • {product.category}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-blue-600">
                          {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </span>
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-medium
                          ${getStockStatusColor(product)}
                        `}>
                          {product.stock} en stock
                        </span>
                      </div>
                      {product.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}