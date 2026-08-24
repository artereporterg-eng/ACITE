import React, { useState, useEffect } from 'react';
import { FeatureItem, InstitutionalPage } from '../../types';
import { saveFeature, deleteFeature, savePage } from '../../services/api';
import { CheckCircle2, AlertCircle, Sparkles, FileText, Edit, Plus, Trash2, X, Save } from 'lucide-react';

interface AdminFeaturesProps {
  features: FeatureItem[];
  pages: InstitutionalPage[];
  onDataUpdated: () => void;
}

export function AdminFeatures({ features, onDataUpdated }: { features: FeatureItem[]; onDataUpdated: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeat, setCurrentFeat] = useState<Partial<FeatureItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setCurrentFeat({
      step_number: String(features.length + 1).padStart(2, '0'),
      title: '',
      description: '',
      order_index: features.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: FeatureItem) => {
    setCurrentFeat({ ...f });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Eliminar este diferencial?')) return;
    try {
      await deleteFeature(id);
      setSuccessMsg('Item eliminado com sucesso.');
      onDataUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao eliminar item.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveFeature(currentFeat);
      setSuccessMsg('Diferencial guardado com sucesso!');
      setIsModalOpen(false);
      onDataUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao guardar item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-acite-gold" size={28} />
            Seção "Porquê escolher a ACITE?"
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure os 4 pontos de destaque e diferenciais institucionais exibidos na página inicial.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="px-4 py-2.5 bg-acite-blue text-white rounded-lg font-semibold text-sm hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-sm cursor-pointer">
          <Plus size={18} /> Novo Ponto
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((f, idx) => (
          <div key={f.id ?? `feat-${idx}`} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <span className="w-10 h-10 rounded-full border border-acite-gold flex items-center justify-center font-bold text-acite-gold shrink-0">
                {f.step_number}
              </span>
              <div>
                <h4 className="font-bold text-gray-900 text-base">{f.title}</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{f.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleOpenEdit(f)} className="p-1.5 text-acite-blue hover:bg-blue-50 rounded">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDelete(f.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
              <h3 className="font-bold text-lg text-gray-900">Editar Ponto Institucional</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Número / Índice (ex: 01, 02)</label>
                <input
                  type="text"
                  required
                  value={currentFeat.step_number || ''}
                  onChange={(e) => setCurrentFeat({ ...currentFeat, step_number: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Título do Diferencial *</label>
                <input
                  type="text"
                  required
                  value={currentFeat.title || ''}
                  onChange={(e) => setCurrentFeat({ ...currentFeat, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Descrição Detalhada *</label>
                <textarea
                  rows={3}
                  required
                  value={currentFeat.description || ''}
                  onChange={(e) => setCurrentFeat({ ...currentFeat, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-acite-blue text-white font-semibold rounded-lg text-sm">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminPages({ pages, onDataUpdated }: { pages: InstitutionalPage[]; onDataUpdated: () => void }) {
  const [selectedPage, setSelectedPage] = useState<InstitutionalPage | null>(pages[0] || null);
  const [title, setTitle] = useState(pages[0]?.title || '');
  const [content, setContent] = useState(pages[0]?.content || '');
  const [metaDesc, setMetaDesc] = useState(pages[0]?.meta_description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (pages.length > 0) {
      if (!selectedPage || !pages.some((p) => p.id === selectedPage.id || p.slug === selectedPage.slug)) {
        handleSelectPage(pages[0]);
      } else {
        const current = pages.find((p) => p.id === selectedPage.id || p.slug === selectedPage.slug);
        if (current) {
          setSelectedPage(current);
          setTitle(current.title);
          setContent(current.content);
          setMetaDesc(current.meta_description || '');
        }
      }
    }
  }, [pages]);

  const handleSelectPage = (p: InstitutionalPage) => {
    setSelectedPage(p);
    setTitle(p.title);
    setContent(p.content);
    setMetaDesc(p.meta_description || '');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;
    setIsSaving(true);
    try {
      await savePage({
        id: selectedPage.id,
        slug: selectedPage.slug,
        title,
        content,
        meta_description: metaDesc,
      });
      setSuccessMsg('Página institucional actualizada com sucesso!');
      onDataUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao guardar página.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-acite-blue" size={28} />
          Páginas Institucionais (Sobre Nós, Missão e Visão)
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Edite o conteúdo estático que é apresentado nos menus institucionais e modais informativos.
        </p>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Páginas Disponíveis</h3>
          {pages.map((p, idx) => (
            <button
              key={p.id ?? p.slug ?? `page-${idx}`}
              onClick={() => handleSelectPage(p)}
              className={`w-full text-left p-3 rounded-xl border text-sm font-semibold transition-all ${
                selectedPage?.id === p.id || (p.slug && selectedPage?.slug === p.slug)
                  ? 'bg-acite-blue text-white border-acite-blue shadow'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Título da Página</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Texto e Conteúdo Completo</label>
              <textarea
                rows={10}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none font-sans leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Resumo / Meta Descrição (SEO)</label>
              <input
                type="text"
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-acite-blue text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2"
              >
                <Save size={16} /> {isSaving ? 'A guardar...' : 'Guardar Alterações da Página'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
