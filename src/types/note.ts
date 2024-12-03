export type NoteCategory = 'note' | 'specs' | 'task' | 'idea';
export type NoteStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  status: NoteStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}