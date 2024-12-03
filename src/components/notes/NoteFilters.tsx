import React from 'react';
import { Circle } from 'lucide-react';
import { NoteStatus } from '../../types/note';

interface NoteFiltersProps {
  selectedStatus: NoteStatus | undefined;
  onStatusChange: (status: NoteStatus | undefined) => void;
}

export function NoteFilters({ selectedStatus, onStatusChange }: NoteFiltersProps) {
  const statuses: { id: NoteStatus; label: string; color: string }[] = [
    { id: 'draft', label: 'Brouillons', color: 'text-gray-400' },
    { id: 'in_progress', label: 'En cours', color: 'text-blue-400' },
    { id: 'completed', label: 'Terminés', color: 'text-green-400' },
    { id: 'archived', label: 'Archivés', color: 'text-yellow-400' }
  ];

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Statut</h3>
      <div className="space-y-1">
        {statuses.map(({ id, label, color }) => (
          <button
            key={id}
            onClick={() => onStatusChange(selectedStatus === id ? undefined : id)}
            className={`
              flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors
              ${selectedStatus === id 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <Circle className={`w-3 h-3 mr-2 ${color} fill-current`} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}