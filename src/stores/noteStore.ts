import { create } from 'zustand';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Note, NoteCategory, NoteStatus } from '../types/note';

interface NoteStore {
  notes: Note[];
  loading: boolean;
  error: string | null;
  selectedNote: Note | null;
  fetchNotes: () => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setSelectedNote: (note: Note | null) => void;
  filterNotes: (category?: NoteCategory, status?: NoteStatus, searchTerm?: string) => Note[];
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  loading: false,
  error: null,
  selectedNote: null,

  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Note[];
          set({ notes, loading: false });
        },
        (error) => {
          console.error('Error fetching notes:', error);
          set({ error: 'Erreur lors du chargement des notes', loading: false });
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up notes listener:', error);
      set({ error: 'Erreur lors de la configuration du listener', loading: false });
    }
  },

  addNote: async (noteData) => {
    set({ loading: true, error: null });
    try {
      const now = Timestamp.now().toDate().toISOString();
      const newNote = {
        ...noteData,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, 'notes'), newNote);
      return docRef.id;
    } catch (error) {
      console.error('Error adding note:', error);
      set({ error: 'Erreur lors de la création de la note' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateNote: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: Timestamp.now().toDate().toISOString()
      });
    } catch (error) {
      console.error('Error updating note:', error);
      set({ error: 'Erreur lors de la mise à jour de la note' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteNote: async (id) => {
    set({ loading: true, error: null });
    try {
      const noteRef = doc(db, 'notes', id);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error('Error deleting note:', error);
      set({ error: 'Erreur lors de la suppression de la note' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setSelectedNote: (note) => {
    set({ selectedNote: note });
  },

  filterNotes: (category, status, searchTerm) => {
    const { notes } = get();
    return notes.filter(note => {
      const matchesCategory = !category || note.category === category;
      const matchesStatus = !status || note.status === status;
      const matchesSearch = !searchTerm || 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }
}));