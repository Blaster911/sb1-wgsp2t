import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Wrench,
  Clock,
  AlertCircle,
  X,
  FileText,
  Printer,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BarChart,
  Trash,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Ticket } from '../../types/ticket';
import { DeviceAutocomplete } from './DeviceAutocomplete';
import { TicketProgressBar } from './TicketProgressBar';
import { generateTicketPDF } from '../../utils/generateTicketPDF';
import { Toast } from '../ui/Toast';
import { SaveButton } from '../ui/SaveButton';
import { EmailTemplateSelector } from '../email/EmailTemplateSelector';
import { emailService } from '../../services/email/emailService';

interface TicketDetailsProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Ticket>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  diagnosticNote?: string;
}

interface EmailTemplate {
  subject: string;
  body: string;
}

const statusColors = {
  reception: 'bg-blue-100 text-blue-800 border-blue-200',
  diagnostic: 'bg-purple-100 text-purple-800 border-purple-200',
  waiting_client: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  waiting_parts: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
} as const;

const statusLabels = {
  reception: 'Réceptionné',
  diagnostic: 'Diagnostic',
  waiting_client: 'Attente client',
  waiting_parts: 'Attente pièces',
  completed: 'Terminé',
} as const;

export function TicketDetails({
  ticket,
  onClose,
  onUpdate,
  onDelete,
}: TicketDetailsProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    clientName: ticket.client.name,
    clientEmail: ticket.client.email,
    clientPhone: ticket.client.phone,
    clientAddress: ticket.client.address,
    deviceType: ticket.deviceType,
    deviceBrand: ticket.deviceBrand,
    deviceModel: ticket.deviceModel,
    devicePassword: ticket.devicePassword || '',
    problem: ticket.problem,
    status: ticket.status,
    priority: ticket.priority,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !event.composedPath().includes(modalRef.current)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Fonction de sauvegarde principale
  const handleSave = async () => {
    if (!hasUnsavedChanges) return;

    setSaving(true);
    try {
      await onUpdate(ticket.id, {
        client: {
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone,
          address: formData.clientAddress,
          id: ticket.client.id,
        },
        deviceType: formData.deviceType,
        deviceBrand: formData.deviceBrand,
        deviceModel: formData.deviceModel,
        devicePassword: formData.devicePassword,
        problem: formData.problem,
        status: formData.status,
        priority: formData.priority,
      });

      setSaved(true);
      setHasUnsavedChanges(false);
      setToast({
        type: 'success',
        message: 'Modifications enregistrées avec succès',
      });

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving ticket:', error);
      setToast({
        type: 'error',
        message: "Erreur lors de l'enregistrement des modifications",
      });
    } finally {
      setSaving(false);
    }
  };

  // Gestionnaire d'envoi d'email
  const handleSendEmail = async () => {
    try {
      await emailService.sendEmail({
        to: formData.clientEmail,
        toName: formData.clientName,
        subject: emailSubject,
        body: emailBody,
        ticketId: ticket.id,
        deviceType: formData.deviceType,
        deviceBrand: formData.deviceBrand,
        deviceModel: formData.deviceModel,
        status: formData.status,
        problem: formData.problem,
        diagnosticNote: ticket.diagnosticNote, // Si disponible
      });

      setShowEmailModal(false);
      setToast({
        type: 'success',
        message: 'Email envoyé avec succès',
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setToast({
        type: 'error',
        message: "Erreur lors de l'envoi de l'email",
      });
    }
  };

  // Gestionnaire de sélection de template
  const handleTemplateSelect = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    setEmailBody(template.body);
    setShowTemplateSelector(false);
  };

  // Gestionnaire de changement de statut
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value as any,
    }));
    setHasUnsavedChanges(true);
  };

  // Gestionnaire de changement de priorité
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      priority: e.target.value as any,
    }));
    setHasUnsavedChanges(true);
  };

  // Gestionnaire d'ajout de note
  const handleAddNote = async () => {
    if (newNote.trim()) {
      setSaving(true);
      try {
        const updatedNotes = [...ticket.notes, newNote.trim()];
        await onUpdate(ticket.id, { notes: updatedNotes });
        setNewNote('');
        setToast({
          type: 'success',
          message: 'Note ajoutée avec succès',
        });
      } catch (error) {
        console.error('Error adding note:', error);
        setToast({
          type: 'error',
          message: "Erreur lors de l'ajout de la note",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  // Gestionnaire de génération de PDF
  const handleGeneratePDF = async () => {
    try {
      const ticketData = {
        ...ticket,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        clientAddress: formData.clientAddress,
        deviceType: formData.deviceType,
        deviceBrand: formData.deviceBrand,
        deviceModel: formData.deviceModel,
        devicePassword: formData.devicePassword,
        problem: formData.problem,
        status: formData.status,
        priority: formData.priority,
      };
      await generateTicketPDF(ticketData);
      setToast({
        type: 'success',
        message: 'PDF généré avec succès',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToast({
        type: 'error',
        message: 'Erreur lors de la génération du PDF',
      });
    }
  };

  // Fonction de suppression
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(ticket.id);
      setToast({
        type: 'success',
        message: 'Ticket supprimé avec succès',
      });
      onClose();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setToast({
        type: 'error',
        message: 'Erreur lors de la suppression du ticket',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-gray-50/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">
                  Ticket #{ticket.id.slice(0, 8)}
                </h2>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium border ${
                    statusColors[formData.status]
                  }`}
                >
                  {statusLabels[formData.status]}
                </span>
              </div>
              <div className="flex items-center gap-4 text-blue-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(ticket.createdAt), 'PPP', { locale: fr })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {format(new Date(ticket.createdAt), 'p', { locale: fr })}
                </div>
                {formData.priority === 'high' && (
                  <span className="inline-flex items-center gap-1 text-sm bg-red-500 text-white px-3 py-1 rounded-full">
                    <AlertCircle className="w-4 h-4" />
                    Priorité haute
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-100 rounded-lg transition-colors"
              >
                <Trash className="w-4 h-4" />
                Supprimer
              </button>
              <button
                onClick={handleGeneratePDF}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer le ticket #
                {ticket.id.slice(0, 8)} ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={isDeleting}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <span className="animate-spin">⚠</span>
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash className="w-4 h-4" />
                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'envoi d'email */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Envoyer un email au client
                </h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {showTemplateSelector ? (
                <>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Choisir un modèle
                  </h4>
                  <EmailTemplateSelector
                    onSelect={handleTemplateSelect}
                    ticketData={{
                      id: ticket.id,
                      clientName: formData.clientName,
                      deviceBrand: formData.deviceBrand,
                      deviceModel: formData.deviceModel,
                      problem: formData.problem,
                    }}
                  />
                  <button
                    onClick={() => setShowTemplateSelector(false)}
                    className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Retour à l'édition
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Objet
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Objet de l'email..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Contenu de l'email..."
                    />
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => setShowTemplateSelector(true)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Utiliser un modèle
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowEmailModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSendEmail}
                        disabled={!emailSubject.trim() || !emailBody.trim()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        Envoyer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Progress Bar */}
        <div className="bg-white shadow-sm px-8 py-4">
          <TicketProgressBar currentStatus={formData.status} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Colonne Client */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Client
                  </h3>
                  <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                    ID: {ticket.client.id}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {formData.clientName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a
                      href={`mailto:${formData.clientEmail}`}
                      className="text-sm hover:text-blue-600"
                    >
                      {formData.clientEmail}
                    </a>
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      Envoyer un email
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a
                      href={`tel:${formData.clientPhone}`}
                      className="text-sm hover:text-blue-600"
                    >
                      {formData.clientPhone}
                    </a>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 mt-1" />
                    <span className="text-sm">{formData.clientAddress}</span>
                  </div>
                </div>
              </div>

              {/* Section Appareil */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                  <Wrench className="w-5 h-5 text-blue-500" />
                  Appareil
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <DeviceAutocomplete
                      type="deviceType"
                      value={formData.deviceType}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          deviceType: value,
                          deviceBrand: '',
                          deviceModel: '',
                        }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Marque
                    </label>
                    <DeviceAutocomplete
                      type="deviceBrand"
                      value={formData.deviceBrand}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          deviceBrand: value,
                          deviceModel: '',
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      dependsOn={{ deviceType: formData.deviceType }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Modèle
                    </label>
                    <DeviceAutocomplete
                      type="deviceModel"
                      value={formData.deviceModel}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          deviceModel: value,
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      dependsOn={{
                        deviceType: formData.deviceType,
                        deviceBrand: formData.deviceBrand,
                      }}
                    />
                  </div>
                  {formData.devicePassword && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Mot de passe
                      </label>
                      <input
                        type="text"
                        value={formData.devicePassword}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            devicePassword: e.target.value,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Colonne Status et Problème */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                  <BarChart className="w-5 h-5 text-blue-500" />
                  État du ticket
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={handleStatusChange}
                      onBlur={handleSave}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="reception">Réceptionné</option>
                      <option value="diagnostic">Diagnostic</option>
                      <option value="waiting_client">Attente client</option>
                      <option value="waiting_parts">Attente pièces</option>
                      <option value="completed">Terminé</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Priorité
                    </label>
                    <select
                      value={formData.priority}
                      onChange={handlePriorityChange}
                      onBlur={handleSave}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">
                  Description du problème
                </h3>
                <textarea
                  value={formData.problem}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      problem: e.target.value,
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  onBlur={handleSave}
                  rows={6}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Description détaillée du problème..."
                />
              </div>
            </div>

            {/* Colonne Notes */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Notes
                </h3>
                <div className="space-y-4">
                  <div className="max-h-[400px] overflow-y-auto space-y-3">
                    {ticket.notes && ticket.notes.length > 0 ? (
                      ticket.notes.map((note, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              Note #{ticket.notes.length - index}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{note}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          Aucune note pour le moment
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      placeholder="Ajouter une nouvelle note..."
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Ajouter la note
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="border-t bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Dernière mise à jour :{' '}
              {format(new Date(ticket.updatedAt), 'PPP à p', { locale: fr })}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Fermer
              </button>
              <SaveButton
                onClick={handleSave}
                saving={saving}
                saved={saved}
                disabled={!hasUnsavedChanges}
              />
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

export default TicketDetails;
