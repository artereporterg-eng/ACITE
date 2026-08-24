import React, { useState } from 'react';
import { PublicationItem } from '../../types';
import { savePublication, deletePublication } from '../../services/api';
import { BookOpen, Plus, Edit, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface AdminPublicationsProps {
  publications: PublicationItem[];
  onPublicationsUpdated: () => void;
}

export default function AdminPublications({ publications, onPublicationsUpdated }: AdminPublicationsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPub, setCurrentPub] = useState<Partial<PublicationItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setCurrentPub({
      title: '',
      authors: '',
      year: new Date().getFullYear(),
      publication_type: 'Livro Científico',
      abstract: '',
      download_url: '#',
      cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
      isbn: '',
    });
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PublicationItem) => {
    setCurrentPub({ ...item });
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Eliminar a obra "${title}"?`)) return;
    try {
      await deletePublication(id);
      setSuccessMsg('Publicação eliminada com sucesso.');
      onPublicationsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao eliminar publicação.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPub.title || !currentPub.authors) {
      setErrorMsg('Título e autores são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await savePublication(currentPub);
      setSuccessMsg('Publicação guardada com sucesso!');
      setIsModalOpen(false);
      onPublicationsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao guardar publicação.');
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
            <BookOpen className="text-acite-blue" size={28} />
            Obras e Publicações Científicas
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestão de livros, teses, manuais e artigos produzidos por docentes e investigadores da ACITE.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-acite-blue text-white rounded-lg font-semibold text-sm hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus size={18} /> Nova Publicação
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publications.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div className="flex p-5 gap-4">
              <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0 shadow">
                <img
                  src={item.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold bg-acite-blue/10 text-acite-blue px-2 py-0.5 rounded">
                  {item.publication_type || 'Livro'} • {item.year}
                </span>
                <h3 className="font-bold text-gray-900 text-sm leading-snug mt-1.5 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.authors}</p>
                {item.isbn && <p className="text-[10px] text-gray-400 mt-1">ISBN: {item.isbn}</p>}
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

      {publications.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-base font-bold text-gray-700">Nenhuma publicação cadastrada</h4>
          <p className="text-xs mt-1">Adicione manuais, livros ou artigos científicos.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <BookOpen className="text-acite-blue" size={22} />
                {currentPub.id ? 'Editar Publicação' : 'Nova Publicação'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Título da Obra *
                </label>
                <input
                  type="text"
                  required
                  value={currentPub.title || ''}
                  onChange={(e) => setCurrentPub({ ...currentPub, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  placeholder="Ex: Transformação Digital em Angola"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Autor(es) / Coordenadores *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentPub.authors || ''}
                    onChange={(e) => setCurrentPub({ ...currentPub, authors: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Prof. Doutor..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Tipo de Publicação
                  </label>
                  <input
                    type="text"
                    value={currentPub.publication_type || 'Livro Científico'}
                    onChange={(e) => setCurrentPub({ ...currentPub, publication_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Ano de Lançamento
                  </label>
                  <input
                    type="number"
                    value={currentPub.year || 2026}
                    onChange={(e) => setCurrentPub({ ...currentPub, year: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    ISBN / Registo
                  </label>
                  <input
                    type="text"
                    value={currentPub.isbn || ''}
                    onChange={(e) => setCurrentPub({ ...currentPub, isbn: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="978-..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  URL da Capa
                </label>
                <input
                  type="text"
                  value={currentPub.cover_url || ''}
                  onChange={(e) => setCurrentPub({ ...currentPub, cover_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Sinopse / Resumo
                </label>
                <textarea
                  rows={4}
                  value={currentPub.abstract || ''}
                  onChange={(e) => setCurrentPub({ ...currentPub, abstract: e.target.value })}
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
                  {isSubmitting ? 'A guardar...' : 'Guardar Publicação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
