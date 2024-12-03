import React, { useState } from 'react';
import { X } from 'lucide-react';
import { emailService, EmailTemplate } from '../../services/email/emailService';
import { Ticket } from '../../types/ticket';

interface EmailModalProps {
  ticket: Ticket;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmailModal({ ticket, onClose, onSuccess }: EmailModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  React.useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const loadedTemplates = await emailService.getTemplates();
      setTemplates(loadedTemplates);
    } catch (err) {
      setError('Erreur lors du chargement des modèles');
    }
  };

  const handleSendEmail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let emailData;
      
      if (useCustom) {
        emailData = {
          to: ticket.client.email,
          subject: customSubject,
          body: customBody,
          ticketId: ticket.id,
          clientId: ticket.client.id
        };
      } else if (selectedTemplate) {
        const variables = {
          ticketId: ticket.id,
          clientName: ticket.client.name,
          deviceBrand: ticket.deviceBrand,
          deviceModel: ticket.deviceModel,
          problem: ticket.problem
        };
        
        const filled = emailService.fillTemplate(selectedTemplate, variables);
        emailData = {
          to: ticket.client.email,
          ...filled,
          ticketId: ticket.id,
          clientId: ticket.client.id
        };
      } else {
        throw new Error('Veuillez sélectionner un modèle ou utiliser un message personnalisé');
      }

      await emailService.sendEmail(emailData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Envoyer un email au client</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destinataire
              </label>
              <input
                type="email"
                value={ticket.client.email}
                disabled
                className="input bg-gray-50"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useCustom"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="useCustom" className="text-sm text-gray-700">
                Message personnalisé
              </label>
            </div>

            {!useCustom && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modèle d'email
                </label>
                <select
                  className="input"
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value);
                    setSelectedTemplate(template || null);
                  }}
                >
                  <option value="">Sélectionner un modèle</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {useCustom && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    rows={6}
                    className="input"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              onClick={handleSendEmail}
              disabled={loading || (!useCustom && !selectedTemplate)}
              className="btn btn-primary"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}