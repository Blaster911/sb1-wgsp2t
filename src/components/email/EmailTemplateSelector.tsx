import React from 'react';
import { useEffect, useState } from 'react';
import { emailService, EmailTemplate } from '../../services/email/emailService';

interface EmailTemplateSelectorProps {
  onSelect: (template: EmailTemplate) => void;
  ticketData: {
    id: string;
    clientName: string;
    deviceBrand: string;
    deviceModel: string;
    problem: string;
  };
}

export function EmailTemplateSelector({ onSelect, ticketData }: EmailTemplateSelectorProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const loadedTemplates = await emailService.getTemplates();
        setTemplates(loadedTemplates);
      } catch (error) {
        console.error('Error loading email templates:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  const handleTemplateSelect = (template: EmailTemplate) => {
    const variables = {
      ticketId: ticketData.id,
      clientName: ticketData.clientName,
      deviceBrand: ticketData.deviceBrand,
      deviceModel: ticketData.deviceModel,
      problem: ticketData.problem
    };

    const filledTemplate = emailService.fillTemplate(template, variables);
    onSelect({ ...template, subject: filledTemplate.subject, body: filledTemplate.body });
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des modèles...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 mb-4">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => handleTemplateSelect(template)}
          className="text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="font-medium text-gray-900">{template.name}</div>
          <div className="text-sm text-gray-500 mt-1">{template.subject}</div>
        </button>
      ))}
    </div>
  );
}