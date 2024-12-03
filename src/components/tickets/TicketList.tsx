import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Ticket } from '../../types/ticket';
import { AlertCircle, Clock } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

const statusColors = {
  reception: 'bg-blue-100 text-blue-800',
  diagnostic: 'bg-purple-100 text-purple-800',
  waiting_client: 'bg-yellow-100 text-yellow-800',
  waiting_parts: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800'
};

const statusLabels = {
  reception: 'Réceptionné',
  diagnostic: 'Diagnostic',
  waiting_client: 'Attente client',
  waiting_parts: 'Attente pièces',
  completed: 'Terminé'
};

const priorityIcons = {
  low: '○',
  medium: '◐',
  high: '●'
};

export function TicketList({ tickets, onTicketClick }: TicketListProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onTicketClick(ticket)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-gray-500" title={`Priorité ${ticket.priority}`}>
                {priorityIcons[ticket.priority]}
              </span>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {ticket.clientName}
                </h3>
                <p className="text-sm text-gray-500">
                  {ticket.deviceBrand} {ticket.deviceModel}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${statusColors[ticket.status]}`}
              >
                {statusLabels[ticket.status]}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {format(new Date(ticket.createdAt), 'Pp', { locale: fr })}
              </span>
            </div>
          </div>
          {ticket.priority === 'high' && (
            <div className="mt-2 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              Priorité haute
            </div>
          )}
        </div>
      ))}
    </div>
  );
}