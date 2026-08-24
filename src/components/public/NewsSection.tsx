import { useState } from 'react';
import { NewsItem } from '../../types';
import { Newspaper, Calendar, User, Eye, ChevronRight, X } from 'lucide-react';

interface NewsSectionProps {
  news: NewsItem[];
}

export default function NewsSection({ news }: NewsSectionProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const publishedNews = news.filter((n) => n.is_published !== 0);

  return (
    <section id="noticias" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-acite-gold font-bold tracking-widest uppercase text-xs">
              Actualidade e Comunicação
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-acite-dark mt-1">
              Últimas Notícias da ACITE
            </h2>
          </div>
          <p className="text-xs text-gray-500 max-w-xs">
            Acompanhe as actividades académicas, descobertas científicas e comunicados oficiais da instituição.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedNews.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelectedArticle(item)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-acite-blue text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                    {item.category || 'Notícias'}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar size={12} className="text-acite-gold" /> {item.published_at}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} /> {item.author || 'ACITE'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg leading-snug mb-3 group-hover:text-acite-blue transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                    {item.excerpt || item.content}
                  </p>
                </div>
              </div>

              {/* Bottom read more */}
              <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs font-bold text-acite-blue group-hover:text-acite-gold transition-colors">
                <span>Ler Artigo Completo</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>

        {publishedNews.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Newspaper size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum artigo publicado no momento.</p>
          </div>
        )}
      </div>

      {/* Full Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp overflow-hidden">
            {/* Header Image & Close Button */}
            <div className="relative h-64 bg-gray-900 shrink-0">
              <img
                src={selectedArticle.image_url}
                alt={selectedArticle.title}
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="bg-acite-gold text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block">
                  {selectedArticle.category}
                </span>
                <h3 className="text-2xl font-bold leading-tight">{selectedArticle.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-300 mt-2">
                  <span>Data: {selectedArticle.published_at}</span>
                  <span>Autor: {selectedArticle.author || 'ACITE'}</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-4">
              {selectedArticle.excerpt && (
                <p className="font-semibold text-gray-900 text-base border-l-4 border-acite-gold pl-4 py-1 italic bg-amber-50/50 rounded-r-lg">
                  {selectedArticle.excerpt}
                </p>
              )}
              <div className="whitespace-pre-line text-gray-700 leading-relaxed font-sans">
                {selectedArticle.content || selectedArticle.excerpt}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-8 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="btn-gold px-6 py-2 text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
