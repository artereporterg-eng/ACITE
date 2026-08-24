import { InstitutionalPage } from '../../types';
import { BookOpen, X } from 'lucide-react';

interface InstitutionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  page?: InstitutionalPage;
}

export default function InstitutionalModal({ isOpen, onClose, page }: InstitutionalModalProps) {
  if (!isOpen || !page) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-scaleUp overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-acite-blue text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          <span className="bg-acite-gold text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
            Informação Institucional
          </span>
          <h3 className="text-2xl font-bold leading-tight">{page.title}</h3>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-4">
          <div className="whitespace-pre-line text-gray-700 leading-relaxed font-sans">
            {page.content}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="btn-gold px-6 py-2 text-xs font-bold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
