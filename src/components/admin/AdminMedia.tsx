import React, { useState, useEffect } from 'react';
import { MediaItem } from '../../types';
import { fetchMediaLibrary, uploadMediaFile, deleteMediaFile } from '../../services/api';
import { Image, UploadCloud, Trash2, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

export default function AdminMedia() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await fetchMediaLibrary();
      setMedia(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar ficheiros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    try {
      await uploadMediaFile(file);
      setSuccessMsg('Ficheiro carregado com sucesso!');
      await loadMedia();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar ficheiro.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Eliminar este ficheiro da biblioteca?')) return;
    try {
      await deleteMediaFile(id);
      setSuccessMsg('Ficheiro eliminado.');
      setMedia((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao eliminar.');
    }
  };

  const copyToClipboard = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Image className="text-acite-blue" size={28} />
            Biblioteca de Mídia e Ficheiros
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Faça upload de fotos do campus, capas de livros, logótipos e documentos para utilizar nos cursos e notícias.
          </p>
        </div>

        <label className="px-4 py-2.5 bg-acite-blue text-white rounded-lg font-semibold text-sm hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer">
          <UploadCloud size={18} />
          {uploading ? 'A carregar...' : 'Carregar Ficheiro'}
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
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

      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acite-blue mx-auto mb-2"></div>
          A carregar galeria...
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <Image size={48} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-base font-bold text-gray-700">Nenhum ficheiro carregado</h4>
          <p className="text-xs mt-1">Carregue imagens do seu computador para utilizar no portal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <img src={item.url} alt={item.original_name} className="w-full h-full object-cover" />
              </div>
              <div className="p-2.5">
                <p className="text-[11px] font-semibold text-gray-900 truncate" title={item.original_name}>
                  {item.original_name}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => copyToClipboard(item.url, item.id)}
                    className="text-[10px] font-semibold text-acite-blue hover:text-acite-gold flex items-center gap-1"
                    title="Copiar URL"
                  >
                    {copiedId === item.id ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    {copiedId === item.id ? 'Copiado!' : 'URL'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Eliminar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
