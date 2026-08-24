import { useState } from 'react';
import { EventItem } from '../../types';
import { Calendar, MapPin, Clock, ArrowRight, X } from 'lucide-react';

interface EventsSectionProps {
  events: EventItem[];
  onOpenInscriptions: () => void;
}

export default function EventsSection({ events, onOpenInscriptions }: EventsSectionProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const activeEvents = events.filter((e) => e.is_active !== 0);

  return (
    <section id="eventos" className="py-20 bg-gray-50/70 border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-acite-gold font-bold tracking-widest uppercase text-xs">
              Agenda e Extensão Universitária
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-acite-dark mt-1">
              Eventos & Conferências Científicas
            </h2>
          </div>
          <p className="text-xs text-gray-500 max-w-xs">
            Participe nos principais fóruns, colóquios e encontros de partilha de conhecimento da ACITE.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className="bg-white rounded-2xl border border-gray-200/70 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  <img
                    src={evt.image_url || '/multimedia/default-academic.svg'}
                    alt={evt.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/multimedia/default-academic.svg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 bg-acite-gold text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                    {evt.category || 'Conferência'}
                  </div>
                </div>

                <div className="p-6">
                  {/* Date Badge */}
                  <div className="flex items-center gap-2 text-xs font-bold text-acite-blue mb-2">
                    <Calendar size={14} className="text-acite-gold" />
                    <span>{evt.event_date}</span>
                    {evt.event_time && <span className="text-gray-400 font-normal">| {evt.event_time}</span>}
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg leading-snug mb-3 group-hover:text-acite-blue transition-colors line-clamp-2">
                    {evt.title}
                  </h3>

                  {evt.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                      <MapPin size={13} className="text-acite-gold shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </p>
                  )}

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{evt.description}</p>
                </div>
              </div>

              <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs font-bold text-acite-blue group-hover:text-acite-gold transition-colors">
                <span>Ver Informações do Evento</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {activeEvents.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-200">
            <Calendar size={40} className="mx-auto mb-2 opacity-50 text-gray-300" />
            <p className="text-sm">Nenhum evento futuro agendado no momento.</p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scaleUp">
            <div className="relative h-48 bg-gray-900">
              <img
                src={selectedEvent.image_url}
                alt={selectedEvent.title}
                className="w-full h-full object-cover opacity-75"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-3 right-3 bg-black/60 text-white p-1 rounded-full hover:bg-black"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="bg-acite-gold text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1 inline-block">
                  {selectedEvent.category}
                </span>
                <h3 className="text-xl font-bold leading-tight drop-shadow">{selectedEvent.title}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 font-bold uppercase block">Data</span>
                  <span className="font-semibold text-gray-900">{selectedEvent.event_date}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase block">Horário</span>
                  <span className="font-semibold text-gray-900">{selectedEvent.event_time || 'A anunciar'}</span>
                </div>
                <div className="col-span-2 pt-1">
                  <span className="text-gray-400 font-bold uppercase block">Local</span>
                  <span className="font-semibold text-gray-900">{selectedEvent.location || 'Campus ACITE, Luanda'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 text-xs uppercase mb-1">Sobre o Evento</h4>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    onOpenInscriptions();
                  }}
                  className="btn-gold px-5 py-2 text-xs font-bold shadow-sm"
                >
                  Registar Presença / Inscrição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
