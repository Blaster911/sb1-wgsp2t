import React, { useState, useEffect } from 'react';
import { Save, X, Tag } from 'lucide-react';
import { Note, NoteCategory, NoteStatus } from '../../types/note';
import { specsTemplate, specsSections, SpecsSection } from './SpecsTemplate';

interface NoteEditorProps {
  note?: Note | null;
  onSave: (data: Partial<Note>) => Promise<void>;
  onCancel: () => void;
}

export function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [category, setCategory] = useState<NoteCategory>(note?.category || 'note');
  const [status, setStatus] = useState<NoteStatus>(note?.status || 'draft');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(note?.priority || 'low');
  const [dueDate, setDueDate] = useState(note?.dueDate || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  // Charger le template du cahier des charges quand la catégorie change
  useEffect(() => {
    if (category === 'specs' && !note && !content) {
      setContent(specsTemplate);
    }
  }, [category, note, content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await onSave({
        title,
        content,
        category,
        status,
        priority,
        dueDate: dueDate || undefined,
        tags,
        ...(note && { id: note.id })
      });
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {note ? 'Modifier la note' : 'Nouvelle note'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Titre */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-0 text-2xl font-medium border-0 border-b border-transparent bg-transparent focus:ring-0 focus:border-blue-500"
              placeholder={category === 'specs' ? "Nom du projet - Cahier des charges" : "Titre de la note"}
              required
            />
          </div>

          {/* Options rapides */}
          <div className="flex flex-wrap gap-4 py-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="note">📝 Note</option>
              <option value="specs">📋 Cahier des charges</option>
              <option value="task">✅ Tâche</option>
              <option value="idea">💡 Idée</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as NoteStatus)}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="draft">Brouillon</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="archived">Archivé</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">🔽 Priorité basse</option>
              <option value="medium">➡️ Priorité moyenne</option>
              <option value="high">🔼 Priorité haute</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Guide des sections pour le cahier des charges */}
          {category === 'specs' && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Sections du cahier des charges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specsSections.map((section) => (
                  <SpecsSection
                    key={section.id}
                    icon={section.icon}
                    title={section.title}
                    description={section.description}
                    isCompleted={content.includes(`## ${section.title}`)}
                    onClick={() => {
                      // Trouver la position de la section dans le contenu
                      const sectionIndex = content.indexOf(`## ${section.title}`);
                      if (sectionIndex !== -1) {
                        // Trouver la position de la prochaine section
                        const nextSectionIndex = content.indexOf('##', sectionIndex + 2);
                        // Extraire le contenu de la section
                        const sectionContent = nextSectionIndex !== -1
                          ? content.substring(sectionIndex, nextSectionIndex)
                          : content.substring(sectionIndex);
                        
                        // Mettre à jour le contenu avec la section modifiée
                        const updatedContent = content.substring(0, sectionIndex) +
                          sectionContent +
                          (nextSectionIndex !== -1 ? content.substring(nextSectionIndex) : '');
                        
                        setContent(updatedContent);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Contenu */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`
                w-full px-4 py-3 text-base bg-gray-50 border-0 rounded-lg focus:ring-0 
                min-h-[500px] resize-none font-mono
                ${category === 'specs' ? 'whitespace-pre-wrap' : ''}
              `}
              placeholder={
                category === 'specs' 
                  ? 'Le template du cahier des charges sera automatiquement chargé...'
                  : 'Commencez à écrire votre note...'
              }
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="p-0.5 hover:bg-blue-100 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ajouter un tag..."
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={saving}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}