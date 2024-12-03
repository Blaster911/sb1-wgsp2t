import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Clipboard, ListTodo, Lightbulb, Edit, Trash2, Tag, Clock } from 'lucide-react';
import { Note } from '../../types/note';

interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

const categoryIcons = {
  note: FileText,
  specs: Clipboard,
  task: ListTodo,
  idea: Lightbulb
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800'
};

const statusLabels = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  completed: 'Terminé',
  archived: 'Archivé'
};

const priorityColors = {
  low: 'bg-gray-100',
  medium: 'bg-yellow-100',
  high: 'bg-red-100'
};

export function NoteList({ notes, onEdit, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune note</h3>
        <p className="text-gray-500">Commencez par créer une nouvelle note</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {notes.map((note) => {
        const Icon = categoryIcons[note.category];
        
        return (
          <div
            key={note.id}
            onClick={() => onEdit(note)}
            className="p-4 hover:bg-gray-50 transition-colors group cursor-pointer"
          >
            <div className="flex items-start gap-4">
              {/* Icône de catégorie */}
              <div className={`
                p-2 rounded-lg flex-shrink-0
                ${note.category === 'note' ? 'bg-blue-50 text-blue-600' :
                  note.category === 'specs' ? 'bg-purple-50 text-purple-600' :
                  note.category === 'task' ? 'bg-green-50 text-green-600' :
                  'bg-amber-50 text-amber-600'}
              `}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Contenu principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 truncate">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {format(new Date(note.updatedAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(note.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Aperçu du contenu */}
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {note.content}
                </p>

                {/* Tags et statut */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {/* Priorité */}
                  {note.priority && (
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${priorityColors[note.priority]}
                    `}>
                      {note.priority === 'high' ? 'Priorité haute' :
                       note.priority === 'medium' ? 'Priorité moyenne' :
                       'Priorité basse'}
                    </span>
                  )}

                  {/* Statut */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[note.status]}`}>
                    {statusLabels[note.status]}
                  </span>

                  {/* Tags */}
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}

                  {/* Date d'échéance */}
                  {note.dueDate && (
                    <span className="text-xs text-gray-500">
                      Échéance : {format(new Date(note.dueDate), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}