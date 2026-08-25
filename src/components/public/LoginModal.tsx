import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, User, AlertCircle, X, Check } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      await login(username, password);
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetUser = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-scaleUp relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        {/* Logo / Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-acite-blue text-acite-gold rounded-2xl flex items-center justify-center mx-auto shadow-md mb-3">
            <Shield size={28} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Acesso Restrito</h3>
          <p className="text-xs text-gray-500 mt-1">
            Painel de Administração e Gestão de Conteúdos da ACITE
          </p>
        </div>

        {/* Default Credential Notice */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 mb-5 text-xs text-blue-950">
          <p className="font-bold text-[11px] uppercase tracking-wider text-acite-blue mb-1.5 flex items-center gap-1">
            <Shield size={13} className="text-acite-gold" /> Utilizadores Padrão Configurados:
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => handleSetUser('admin', '123')}
              className="p-2 bg-white border border-blue-200 hover:border-acite-blue rounded-lg text-left transition-all hover:shadow-xs group cursor-pointer"
            >
              <div className="text-[11px] font-bold text-gray-900 group-hover:text-acite-blue">admin</div>
              <div className="text-[10px] text-gray-500">Palavra-passe: <strong className="text-gray-800">123</strong></div>
            </button>

            <button
              type="button"
              onClick={() => handleSetUser('fox', '123')}
              className="p-2 bg-white border border-blue-200 hover:border-acite-blue rounded-lg text-left transition-all hover:shadow-xs group cursor-pointer"
            >
              <div className="text-[11px] font-bold text-gray-900 group-hover:text-acite-blue">fox</div>
              <div className="text-[10px] text-gray-500">Palavra-passe: <strong className="text-gray-800">123</strong></div>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Utilizador ou E-mail
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Palavra-passe
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-gold py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer mt-2"
          >
            {isLoading ? 'A autenticar...' : 'Entrar no Painel'}
          </button>
        </form>
      </div>
    </div>
  );
}
