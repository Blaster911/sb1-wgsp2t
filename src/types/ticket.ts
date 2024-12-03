// types/ticket.ts

export type TicketStatus =
  | 'reception'
  | 'diagnostic'
  | 'waiting_client'
  | 'waiting_parts'
  | 'completed';

export type TicketPriority = 'low' | 'medium' | 'high';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  client: Client;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  devicePassword?: string;
  problem: string;
  status: TicketStatus;
  priority: TicketPriority;
  notes: string[];
  diagnosticNote?: string;
  estimatedCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Type pour la création d'un nouveau ticket
export type NewTicket = Omit<Ticket, 'id' | 'createdAt'> & {
  createdAt: string;
  updatedAt: string;
  ticketNumber: string; // Ajoutez cette ligne pour inclure ticketNumber
  notes: string[];
  diagnosticNote: '';
};

// Type pour les mises à jour partielles de ticket
export type TicketUpdate = Partial<
  Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt'>
>;

// Type pour les données du formulaire de ticket
export interface TicketFormData {
  client: Client;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  devicePassword?: string;
  problem: string;
  priority: TicketPriority;
}

// Type pour le statut du traitement d'un ticket
export interface TicketProcessingStatus {
  estimatedCompletionDate?: string;
  diagnosticNote?: string;
  status: TicketStatus;
}

// Type pour les filtres de recherche de tickets
export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  clientId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}

// Type pour les statistiques de ticket
export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  averageCompletionTime: number;
}

// Constantes pour les statuts et priorités
export const TICKET_STATUSES: TicketStatus[] = [
  'reception',
  'diagnostic',
  'waiting_client',
  'waiting_parts',
  'completed',
];

export const TICKET_PRIORITIES: TicketPriority[] = ['low', 'medium', 'high'];

// Labels pour l'affichage
export const STATUS_LABELS: Record<TicketStatus, string> = {
  reception: 'Réceptionné',
  diagnostic: 'En diagnostic',
  waiting_client: 'En attente client',
  waiting_parts: 'En attente pièces',
  completed: 'Terminé',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

// Helper functions
export const getStatusLabel = (status: TicketStatus): string =>
  STATUS_LABELS[status];

export const getPriorityLabel = (priority: TicketPriority): string =>
  PRIORITY_LABELS[priority];