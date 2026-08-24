import React, { useState } from 'react';
import { HeroSlide } from '../../types';
import { saveHeroSlide, deleteHeroSlide } from '../../services/api';
import { Layers, Plus, Edit, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface AdminHeroProps {
  slides: HeroSlide[];
  onSlidesUpdated: () => void;
}

export default function AdminHero({ slides, onSlidesUpdated }: AdminHeroProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<Partial<HeroSlide>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setCurrentSlide({
      badge: 'BEM-VINDO À ACITE',
      title: '',
      subtitle: '',
      image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920',
      primary_btn_text: 'Ver Cursos',
      primary_btn_link: '#cursos',
      secondary_btn_text: 'Fazer Inscrição',
      secondary_btn_link: '#inscricao',
      order_index: slides.length + 1,
      is_active: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slide: HeroSlide) => {
    setCurrentSlide({ ...slide });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Eliminar este slide do banner principal?')) return;
    try {
      await deleteHeroSlide(id);
      setSuccessMsg('Slide eliminado com sucesso.');
      onSlidesUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao eliminar slide.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSlide.title || !currentSlide.image_url) {
      setErrorMsg('Título e imagem de fundo são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveHeroSlide(currentSlide);
      setSuccessMsg('Banner guardado com sucesso!');
      setIsModalOpen(false);
      onSlidesUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao guardar banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="text-acite-blue" size={28} />
            Banners e Slides da Página Inicial
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Personalize os títulos de impacto, imagens e botões de chamada para acção (CTA) do cabeçalho.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-acite-blue text-white rounded-lg font-semibold text-sm hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus size={18} /> Novo Slide
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((slide) => (
          <div key={slide.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative h-56 bg-gray-900">
                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                  {slide.badge && (
                    <span className="bg-acite-gold text-white text-[10px] font-bold px-2 py-0.5 rounded w-max mb-1.5 shadow">
                      {slide.badge}
                    </span>
                  )}
                  <h3 className="font-bold text-lg leading-tight drop-shadow">{slide.title}</h3>
                  {slide.subtitle && <p className="text-xs text-gray-200 mt-1 line-clamp-2">{slide.subtitle}</p>}
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex items-center gap-2 text-xs text-gray-600">
                <span className="font-semibold">Botão 1:</span> {slide.primary_btn_text || 'N/A'} • <span className="font-semibold">Botão 2:</span> {slide.secondary_btn_text || 'N/A'}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => handleOpenEdit(slide)} className="text-xs font-semibold text-acite-blue hover:text-acite-gold flex items-center gap-1 cursor-pointer">
                <Edit size={14} /> Editar
              </button>
              <button onClick={() => handleDelete(slide.id)} className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer">
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Layers className="text-acite-blue" size={22} />
                {currentSlide.id ? 'Editar Banner' : 'Novo Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Badge Superior</label>
                <input
                  type="text"
                  value={currentSlide.badge || ''}
                  onChange={(e) => setCurrentSlide({ ...currentSlide, badge: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  placeholder="BEM-VINDO À ACITE"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Título Principal *</label>
                <input
                  type="text"
                  required
                  value={currentSlide.title || ''}
                  onChange={(e) => setCurrentSlide({ ...currentSlide, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  placeholder="Excelência no Ensino e Investigação..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Subtítulo Explicativo</label>
                <textarea
                  rows={3}
                  value={currentSlide.subtitle || ''}
                  onChange={(e) => setCurrentSlide({ ...currentSlide, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">URL da Imagem de Fundo (1920x1080) *</label>
                <input
                  type="text"
                  required
                  value={currentSlide.image_url || ''}
                  onChange={(e) => setCurrentSlide({ ...currentSlide, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Texto do Botão 1</label>
                  <input
                    type="text"
                    value={currentSlide.primary_btn_text || ''}
                    onChange={(e) => setCurrentSlide({ ...currentSlide, primary_btn_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Link do Botão 1</label>
                  <input
                    type="text"
                    value={currentSlide.primary_btn_link || ''}
                    onChange={(e) => setCurrentSlide({ ...currentSlide, primary_btn_link: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-acite-blue text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50">
                  {isSubmitting ? 'A guardar...' : 'Guardar Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
