import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiUpdateProfile } from '../../services/api';
import { Shield, KeyRound, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminProfile() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || 'Administrador Geral');
  const [username, setUsername] = useState(user?.username || 'admin');
  const [email, setEmail] = useState(user?.email || 'admin@acite.ao');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || 'Direcção Geral');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('A confirmação da nova palavra-passe não coincide.');
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setErrorMsg('A nova palavra-passe deve ter pelo menos 4 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim(),
      };

      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await apiUpdateProfile(payload);
      setSuccessMsg(res.message || 'Credenciais actualizadas com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshUser();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao actualizar credenciais.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="text-acite-blue" size={28} />
          Perfil e Segurança do Administrador
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Altere o nome de utilizador, o endereço de correio e a palavra-passe mestra do painel de administração da ACITE.
        </p>
      </div>

      {/* Default credentials notice */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
        <div className="flex items-start">
          <KeyRound className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-amber-800">Dica de Segurança</h3>
            <p className="text-xs text-amber-700 mt-1">
              As credenciais de base do sistema são <span className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">user: admin</span> e <span className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">senha: admin</span>. 
              Pode alterar para um utilizador e senha seguros no formulário abaixo a qualquer momento.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
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

      <form onSubmit={handleUpdateProfile} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Basic info section */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <UserCheck size={18} className="text-acite-blue" />
            Dados da Conta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Nome do Administrador
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue focus:border-transparent outline-none transition-all"
                placeholder="Ex: Administrador ACITE"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Nome de Utilizador (Login / Username)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono focus:bg-white focus:ring-2 focus:ring-acite-blue focus:border-transparent outline-none transition-all"
                placeholder="admin"
              />
              <p className="text-[11px] text-gray-500 mt-1">Este é o nome utilizado para aceder ao backend.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Endereço de E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue focus:border-transparent outline-none transition-all"
                placeholder="admin@acite.ao"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue focus:border-transparent outline-none transition-all"
                placeholder="+244 923 000 000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Departamento / Gabinete
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue focus:border-transparent outline-none transition-all"
                placeholder="Direcção Geral"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Categoria & Função Atribuída
              </label>
              <div className="px-3.5 py-2.5 bg-purple-50 border border-purple-200 rounded-lg text-xs font-bold text-purple-900 flex items-center justify-between">
                <span>{user?.category || 'Super Administrador'}</span>
                <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-mono">
                  {user?.role || 'admin'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change password section */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
            <KeyRound size={18} className="text-acite-gold" />
            Alterar Palavra-passe
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Deixe os campos de palavra-passe em branco caso pretenda apenas actualizar o nome ou e-mail.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Senha Actual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
              <p className="text-[10px] text-gray-400 mt-1">Padrão de fábrica: admin</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Nova Palavra-passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue focus:border-transparent outline-none transition-all"
                placeholder="Mínimo 4 caracteres"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue focus:border-transparent outline-none transition-all"
                placeholder="Repetir nova senha"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-acite-blue text-white rounded-lg font-medium text-sm hover:bg-opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'A guardar alterações...' : 'Guardar Alterações do Administrador'}
          </button>
        </div>
      </form>
    </div>
  );
}
