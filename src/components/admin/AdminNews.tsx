import React, { useState } from 'react';
import { NewsItem } from '../../types';
import { saveNews, deleteNews } from '../../services/api';
import { Newspaper, Plus, Edit, Trash2, CheckCircle2, AlertCircle, Calendar, User, Eye, X } from 'lucide-react';

interface AdminNewsProps {
  news: NewsItem[];
  onNewsUpdated: () => void;
}

export default function AdminNews({ news, onNewsUpdated }: AdminNewsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNews, setCurrentNews] = useState<Partial<NewsItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories = ['Notícias', 'Eventos Científicos', 'Institucional', 'Cooperação', 'Investigação'];

  const handleOpenAdd = () => {
    setCurrentNews({
      title: '',
      category: 'Notícias',
      excerpt: '',
      content: '',
      image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
      author: 'Redacção ACITE',
      published_at: new Date().toISOString().split('T')[0],
      is_published: 1,
    });
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NewsItem) => {
    setCurrentNews({ ...item });
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Tem a certeza que deseja eliminar a notícia "${title}"?`)) return;
    try {
      await deleteNews(id);
      setSuccessMsg('Notícia eliminada com sucesso!');
      onNewsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao eliminar notícia.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNews.title) {
      setErrorMsg('O título da notícia é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await saveNews(currentNews);
      setSuccessMsg('Notícia guardada com sucesso!');
      setIsModalOpen(false);
      onNewsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao guardar notícia.');
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
            <Newspaper className="text-acite-blue" size={28} />
            Gestão de Notícias e Publicações
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Publique comunicados, novidades académicas e eventos científicos no portal da ACITE.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-acite-blue text-white rounded-lg font-semibold text-sm hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus size={18} /> Nova Notícia
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

      {/* Grid of news */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div>
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-acite-blue text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  {item.category}
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded shadow ${
                      item.is_published ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                    }`}
                  >
                    {item.is_published ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {item.published_at}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={12} /> {item.author || 'ACITE'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {item.views || 0}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-3">{item.excerpt}</p>
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

      {news.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <Newspaper size={48} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-base font-bold text-gray-700">Nenhuma notícia registada</h4>
          <p className="text-xs mt-1">Clique em "Nova Notícia" para publicar o primeiro artigo.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Newspaper className="text-acite-blue" size={22} />
                {currentNews.id ? 'Editar Notícia' : 'Criar Nova Notícia'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Título da Notícia *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentNews.title || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Ex: Cerimónia de Graduação dos Novos Mestres"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    value={currentNews.category || 'Notícias'}
                    onChange={(e) => setCurrentNews({ ...currentNews, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Autor / Fonte
                  </label>
                  <input
                    type="text"
                    value={currentNews.author || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Redacção ACITE"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Data de Publicação
                  </label>
                  <input
                    type="date"
                    value={currentNews.published_at || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, published_at: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    URL da Imagem de Destaque
                  </label>
                  <input
                    type="text"
                    value={currentNews.image_url || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, image_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Excerto / Resumo Curto
                  </label>
                  <textarea
                    rows={2}
                    value={currentNews.excerpt || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, excerpt: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Breve resumo que aparece na página inicial..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Conteúdo Completo do Artigo
                  </label>
                  <textarea
                    rows={8}
                    value={currentNews.content || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none font-sans"
                    placeholder="Escreva aqui o texto completo da notícia..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={currentNews.is_published !== 0}
                      onChange={(e) => setCurrentNews({ ...currentNews, is_published: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 text-acite-blue rounded"
                    />
                    Publicar Imediatamente no Portal Público
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-acite-blue text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'A guardar...' : 'Guardar Notícia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
