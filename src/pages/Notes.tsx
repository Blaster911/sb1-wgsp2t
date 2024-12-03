import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Tag, FileText, Clipboard, Lightbulb, ListTodo } from 'lucide-react';
import { useNoteStore } from '../stores/noteStore';
import { NoteList } from '../components/notes/NoteList';
import { NoteEditor } from '../components/notes/NoteEditor';
import { NoteFilters } from '../components/notes/NoteFilters';
import { Note, NoteCategory, NoteStatus } from '../types/note';

export default function Notes() {
  const [showEditor, setShowEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<NoteStatus | undefined>();
  const { notes, loading, error, fetchNotes, addNote, updateNote, deleteNote, filterNotes } = useNoteStore();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleNewNote = () => {
    setSelectedNote(null);
    setShowEditor(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setShowEditor(true);
  };

  const handleSaveNote = async (data: Partial<Note>) => {
    try {
      if (selectedNote) {
        await updateNote(selectedNote.id, data);
      } else {
        await addNote(data as Omit<Note, 'id' | 'createdAt' | 'updatedAt'>);
      }
      setShowEditor(false);
      setSelectedNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setShowEditor(false);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const filteredNotes = filterNotes(selectedCategory, selectedStatus, searchTerm);

  const categories = [
    { id: 'note' as NoteCategory, icon: FileText, label: 'Notes' },
    { id: 'specs' as NoteCategory, icon: Clipboard, label: 'Cahiers des charges' },
    { id: 'task' as NoteCategory, icon: ListTodo, label: 'Tâches' },
    { id: 'idea' as NoteCategory, icon: Lightbulb, label: 'Idées' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">{error}</p>
        <button 
          onClick={() => fetchNotes()}
          className="text-blue-500 hover:text-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-500">Gérez vos notes et cahiers des charges</p>
        </div>
        <button 
          onClick={handleNewNote}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle note
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar avec filtres */}
        <div className="lg:w-64 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Catégories</h3>
            <div className="space-y-1">
              {categories.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(selectedCategory === id ? undefined : id)}
                  className={`
                    flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors
                    ${selectedCategory === id 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <NoteFilters
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1">
          {showEditor ? (
            <NoteEditor
              note={selectedNote}
              onSave={handleSaveNote}
              onCancel={() => {
                setShowEditor(false);
                setSelectedNote(null);
              }}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm">
              <NoteList
                notes={filteredNotes}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}