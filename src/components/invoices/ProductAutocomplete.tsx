import React, { useState, useEffect, useRef } from 'react';
import { useProductStore } from '../../stores/productStore';

interface ProductAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (product: any) => void;
  placeholder: string;
  className?: string;
}

export function ProductAutocomplete({ value, onChange, onSelect, placeholder, className = '' }: ProductAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const { products, loading, error, fetchProducts } = useProductStore();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Current products:', products); // Débogage
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchTerm: string) => {
    onChange(searchTerm);
    console.log('Searching for:', searchTerm); // Débogage

    if (searchTerm.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const referenceMatch = product.reference.toLowerCase().includes(searchLower);
      console.log(`Product ${product.name}: nameMatch=${nameMatch}, referenceMatch=${referenceMatch}`); // Débogage
      return nameMatch || referenceMatch;
    });

    console.log('Filtered products:', filtered); // Débogage
    setSuggestions(filtered);
    setShowSuggestions(true);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[highlightedIndex]) {
          onSelect(suggestions[highlightedIndex]);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => handleSearch(value)}
        className={`input ${className}`}
        placeholder={placeholder}
      />

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              Chargement...
            </div>
          ) : error ? (
            <div className="p-3 text-center text-red-500">
              {error}
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((product, index) => (
              <div
                key={product.id}
                className={`
                  p-3 cursor-pointer border-b last:border-b-0
                  ${index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}
                `}
                onClick={() => {
                  onSelect(product);
                  setShowSuggestions(false);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">Réf: {product.reference}</div>
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </div>
                </div>
                {product.stock !== undefined && (
                  <div className={`text-sm mt-1 ${
                    product.stock <= 0 ? 'text-red-600' :
                    product.stock <= (product.minStock || 0) ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    Stock: {product.stock} unité{product.stock > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500">
              Aucun article trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
}