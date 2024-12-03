import React, { useState, useEffect, useRef } from 'react';

interface DeviceAutocompleteProps {
  type: 'deviceType' | 'deviceBrand' | 'deviceModel';
  value: string;
  onChange: (value: string) => void;
  dependsOn?: {
    deviceType?: string;
    deviceBrand?: string;
  };
}

const deviceData = {
  types: ['PC fixe', 'PC portable', 'Smartphone', 'Tablette'],
  brands: {
    'PC fixe': ['HP', 'Dell', 'Lenovo', 'Asus'],
    'PC portable': ['HP', 'Dell', 'Lenovo', 'Asus', 'Apple'],
    'Smartphone': ['Apple', 'Samsung', 'Huawei', 'Xiaomi'],
    'Tablette': ['Apple', 'Samsung', 'Huawei', 'Lenovo']
  },
  models: {
    'Apple': {
      'Smartphone': ['iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15'],
      'Tablette': ['iPad Pro', 'iPad Air', 'iPad mini'],
      'PC portable': ['MacBook Pro', 'MacBook Air']
    },
    'Samsung': {
      'Smartphone': ['Galaxy S21', 'Galaxy S22', 'Galaxy S23', 'Galaxy A53'],
      'Tablette': ['Galaxy Tab S7', 'Galaxy Tab S8', 'Galaxy Tab A8']
    }
  }
};

export function DeviceAutocomplete({ type, value, onChange, dependsOn }: DeviceAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let filteredSuggestions: string[] = [];

    switch (type) {
      case 'deviceType':
        filteredSuggestions = deviceData.types;
        break;
      case 'deviceBrand':
        if (dependsOn?.deviceType) {
          filteredSuggestions = deviceData.brands[dependsOn.deviceType] || [];
        }
        break;
      case 'deviceModel':
        if (dependsOn?.deviceBrand && dependsOn?.deviceType) {
          const brandModels = deviceData.models[dependsOn.deviceBrand];
          if (brandModels) {
            filteredSuggestions = brandModels[dependsOn.deviceType] || [];
          }
        }
        break;
    }

    setSuggestions(filteredSuggestions.filter(s => 
      s.toLowerCase().includes(inputValue.toLowerCase())
    ));
  }, [type, inputValue, dependsOn]);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        className="input w-full"
        placeholder={`Sélectionner ${type === 'deviceType' ? 'un type' : 
          type === 'deviceBrand' ? 'une marque' : 'un modèle'}`}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setInputValue(suggestion);
                onChange(suggestion);
                setShowSuggestions(false);
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}