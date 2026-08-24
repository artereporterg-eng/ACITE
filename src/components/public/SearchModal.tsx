import { useState } from 'react';
import { Course, NewsItem, EventItem, PublicationItem } from '../../types';
import { Search, X, GraduationCap, Newspaper, Calendar, BookOpen, ChevronRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  news: NewsItem[];
  events: EventItem[];
  publications: PublicationItem[];
  onSelectCourse: (c: Course) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  courses,
  news,
  events,
  publications,
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredCourses = courses.filter((c) =>
    query && (c.title.toLowerCase().includes(query.toLowerCase()) || c.description?.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredNews = news.filter((n) =>
    query && (n.title.toLowerCase().includes(query.toLowerCase()) || n.excerpt?.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredEvents = events.filter((e) =>
    query && (e.title.toLowerCase().includes(query.toLowerCase()) || e.location?.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredPubs = publications.filter((p) =>
    query && (p.title.toLowerCase().includes(query.toLowerCase()) || p.authors.toLowerCase().includes(query.toLowerCase()))
  );

  const totalResults = filteredCourses.length + filteredNews.length + filteredEvents.length + filteredPubs.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-scaleUp">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
          <Search size={20} className="text-acite-blue shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar cursos, notícias, teses, publicações ou eventos..."
            className="w-full bg-transparent border-none text-base text-gray-900 focus:outline-none placeholder-gray-400"
          />
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Results Container */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {!query ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              Escreva qualquer termo de pesquisa para localizar conteúdos no portal da ACITE.
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-10 text-gray-500 text-xs">
              Nenhum resultado encontrado para "{query}".
            </div>
          ) : (
            <>
              {/* Courses Results */}
              {filteredCourses.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GraduationCap size={14} /> Cursos ({filteredCourses.length})
                  </h4>
                  <div className="space-y-1.5">
                    {filteredCourses.map((c) => (
                      <a
                        key={c.id}
                        href="#cursos"
                        onClick={onClose}
                        className="block p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                      >
                        <p className="font-bold text-sm text-acite-dark">{c.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{c.description}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* News Results */}
              {filteredNews.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Newspaper size={14} /> Notícias ({filteredNews.length})
                  </h4>
                  <div className="space-y-1.5">
                    {filteredNews.map((n) => (
                      <a
                        key={n.id}
                        href="#noticias"
                        onClick={onClose}
                        className="block p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                      >
                        <p className="font-bold text-sm text-acite-dark">{n.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{n.excerpt}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Events Results */}
              {filteredEvents.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar size={14} /> Eventos ({filteredEvents.length})
                  </h4>
                  <div className="space-y-1.5">
                    {filteredEvents.map((e) => (
                      <a
                        key={e.id}
                        href="#eventos"
                        onClick={onClose}
                        className="block p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                      >
                        <p className="font-bold text-sm text-acite-dark">{e.title}</p>
                        <p className="text-xs text-gray-500">{e.event_date} {e.location ? `• ${e.location}` : ''}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Publications Results */}
              {filteredPubs.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen size={14} /> Publicações ({filteredPubs.length})
                  </h4>
                  <div className="space-y-1.5">
                    {filteredPubs.map((p) => (
                      <a
                        key={p.id}
                        href="#publicacoes"
                        onClick={onClose}
                        className="block p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                      >
                        <p className="font-bold text-sm text-acite-dark">{p.title}</p>
                        <p className="text-xs text-gray-500">{p.authors} ({p.year})</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
