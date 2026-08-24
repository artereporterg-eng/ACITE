import React, { useState } from 'react';
import { EventItem } from '../../types';
import { saveEvent, deleteEvent } from '../../services/api';
import { Calendar, Plus, Edit, Trash2, CheckCircle2, AlertCircle, MapPin, Clock, X } from 'lucide-react';

interface AdminEventsProps {
  events: EventItem[];
  onEventsUpdated: () => void;
}

export default function AdminEvents({ events, onEventsUpdated }: AdminEventsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<EventItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setCurrentEvent({
      title: '',
      event_date: new Date().toISOString().split('T')[0],
      event_time: '09:00 - 13:00',
      location: 'Auditório Nobre ACITE, Luanda',
      description: '',
      category: 'Conferência',
      registration_url: '#',
      image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop',
      is_active: 1,
    });
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EventItem) => {
    setCurrentEvent({ ...item });
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Eliminar o evento "${title}"?`)) return;
    try {
      await deleteEvent(id);
      setSuccessMsg('Evento eliminado com sucesso.');
      onEventsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao eliminar evento.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent.title || !currentEvent.event_date) {
      setErrorMsg('Título e data do evento são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await saveEvent(currentEvent);
      setSuccessMsg('Evento guardado com sucesso!');
      setIsModalOpen(false);
      onEventsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao guardar evento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-acite-blue" size={28} />
            Gestão de Eventos & Calendário Científico
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Divulgue colóquios, seminários, fóruns nacionais e workshops da comunidade académica.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-acite-blue text-white rounded-lg font-semibold text-sm hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus size={18} /> Novo Evento
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div>
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-acite-gold text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  {item.category || 'Evento'}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-acite-blue mb-1">
                  <Calendar size={14} /> {item.event_date} {item.event_time ? `• ${item.event_time}` : ''}
                </div>
                <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
                  {item.title}
                </h3>
                {item.location && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    <MapPin size={12} className="shrink-0 text-acite-gold" /> {item.location}
                  </p>
                )}
                <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <button
                onClick={() => handleOpenEdit(item)}
                className="text-xs font-semibold text-acite-blue hover:text-acite-gold flex items-center gap-1 cursor-pointer"
              >
                <Edit size={14} /> Editar
              </button>
              <button
                onClick={() => handleDelete(item.id, item.title)}
                className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-base font-bold text-gray-700">Nenhum evento agendado</h4>
          <p className="text-xs mt-1">Adicione conferências ou seminários para exibir no portal.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Calendar className="text-acite-blue" size={22} />
                {currentEvent.id ? 'Editar Evento' : 'Criar Novo Evento'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Nome do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={currentEvent.title || ''}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  placeholder="Ex: Fórum Nacional de Ciências Sociais"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Data do Evento *
                  </label>
                  <input
                    type="date"
                    required
                    value={currentEvent.event_date || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, event_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Horário
                  </label>
                  <input
                    type="text"
                    value={currentEvent.event_time || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, event_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="09:00 - 13:00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={currentEvent.location || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Auditório Nobre ACITE"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={currentEvent.category || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Conferência / Workshop"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  URL da Imagem
                </label>
                <input
                  type="text"
                  value={currentEvent.image_url || ''}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Descrição do Evento
                </label>
                <textarea
                  rows={4}
                  value={currentEvent.description || ''}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-acite-blue text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'A guardar...' : 'Guardar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
