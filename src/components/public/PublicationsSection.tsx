import { useState } from 'react';
import { PublicationItem } from '../../types';
import { BookOpen, Download, Search, X, Check } from 'lucide-react';

interface PublicationsSectionProps {
  publications: PublicationItem[];
}

export default function PublicationsSection({ publications }: PublicationsSectionProps) {
  const [search, setSearch] = useState('');
  const [selectedPub, setSelectedPub] = useState<PublicationItem | null>(null);
  const [downloadedId, setDownloadedId] = useState<number | null>(null);

  const filtered = publications.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authors.toLowerCase().includes(search.toLowerCase()) ||
      (p.publication_type && p.publication_type.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDownload = (p: PublicationItem) => {
    setDownloadedId(p.id);
    setTimeout(() => setDownloadedId(null), 2500);
  };

  return (
    <section id="publicacoes" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-acite-gold font-bold tracking-widest uppercase text-xs">
              Produção Científica & Editorial
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-acite-dark mt-1">
              Obras e Repositório Institucional
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por título, autor ou ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-acite-blue outline-none"
            />
          </div>
        </div>

        {/* Books and Publications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pub) => (
            <div
              key={pub.id}
              className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex gap-4 group"
            >
              {/* Book Cover */}
              <div
                onClick={() => setSelectedPub(pub)}
                className="w-28 h-40 bg-gray-100 rounded-xl overflow-hidden shadow-md shrink-0 cursor-pointer group-hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={pub.cover_url || '/multimedia/book-manual.svg'}
                  alt={pub.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/multimedia/book-manual.svg';
                  }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-bold bg-acite-blue/10 text-acite-blue px-2 py-0.5 rounded">
                      {pub.publication_type || 'Livro'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-semibold">{pub.year}</span>
                  </div>

                  <h3
                    onClick={() => setSelectedPub(pub)}
                    className="font-bold text-gray-900 text-sm leading-snug group-hover:text-acite-blue transition-colors line-clamp-2 cursor-pointer"
                  >
                    {pub.title}
                  </h3>

                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">{pub.authors}</p>

                  {pub.isbn && (
                    <p className="text-[10px] text-gray-400 font-mono mt-1">ISBN: {pub.isbn}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-2">
                  <button
                    onClick={() => setSelectedPub(pub)}
                    className="text-xs font-semibold text-acite-blue hover:text-acite-gold transition-colors cursor-pointer"
                  >
                    Sinopse
                  </button>

                  <button
                    onClick={() => handleDownload(pub)}
                    className="p-1.5 text-acite-gold hover:bg-amber-50 rounded-md transition-colors"
                    title="Descarregar Ficha / Obra"
                  >
                    {downloadedId === pub.id ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Download size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-gray-200">
            <BookOpen size={40} className="mx-auto mb-2 opacity-50 text-gray-300" />
            <p className="text-sm">Nenhuma publicação encontrada para os critérios seleccionados.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-scaleUp relative">
            <button
              onClick={() => setSelectedPub(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            <div className="flex gap-5">
              <div className="w-32 h-44 bg-gray-100 rounded-xl overflow-hidden shadow-md shrink-0">
                <img
                  src={selectedPub.cover_url}
                  alt={selectedPub.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1">
                <span className="text-xs font-bold bg-acite-blue/10 text-acite-blue px-2.5 py-1 rounded">
                  {selectedPub.publication_type} • {selectedPub.year}
                </span>
                <h3 className="font-bold text-lg text-gray-900 mt-2 leading-snug">
                  {selectedPub.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1 font-medium">Autores: {selectedPub.authors}</p>
                {selectedPub.isbn && (
                  <p className="text-xs text-gray-400 font-mono mt-0.5">ISBN: {selectedPub.isbn}</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Resumo / Sinopse da Obra
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed max-h-48 overflow-y-auto">
                {selectedPub.abstract || 'Obra e colectânea de investigação científica desenvolvida sob a chancela editorial da Academia de Ciências Sociais e Tecnologias.'}
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedPub(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200"
              >
                Fechar
              </button>
              <button
                onClick={() => handleDownload(selectedPub)}
                className="btn-gold px-5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Download size={14} />
                <span>{downloadedId === selectedPub.id ? 'Ficha Descarregada' : 'Aceder à Obra / PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
