import React, { useState, useEffect } from 'react';
import { updateSiteSettings } from '../../services/api';
import { SiteSettings } from '../../types';
import { Settings, Save, CheckCircle2, AlertCircle, Phone, Mail, MapPin, Share2, Award, Info } from 'lucide-react';

interface AdminSettingsProps {
  initialSettings: SiteSettings;
  onSettingsUpdated: () => void;
}

export default function AdminSettings({ initialSettings, onSettingsUpdated }: AdminSettingsProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings || {});
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await updateSiteSettings(settings as Record<string, string>);
      setSuccessMsg('Definições do portal guardadas com sucesso! As alterações já estão visíveis no frontend.');
      onSettingsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao guardar definições.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-acite-blue" size={28} />
            Definições Gerais do Portal
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Personalize a identidade institucional, contactos, redes sociais e avisos globais.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-acite-blue text-white rounded-lg font-semibold text-sm hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Save size={16} />
          {isSaving ? 'A guardar...' : 'Guardar Alterações'}
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Identity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
            <Info size={18} className="text-acite-blue" />
            Identidade da Instituição
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Sigla da Instituição
              </label>
              <input
                type="text"
                value={settings.site_name || 'ACITE'}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Nome Completo Oficial
              </label>
              <input
                type="text"
                value={settings.full_name || 'Academia de Ciências Sociais e Tecnologias'}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Slogan / Subtítulo Institucional
              </label>
              <input
                type="text"
                value={settings.tagline || 'Instituição de Ensino Superior Pública de Altos Estudos'}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Descrição Institucional (Rodapé e Metadados)
              </label>
              <textarea
                rows={3}
                value={settings.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Admissions and Inscriptions Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
            <Award size={18} className="text-acite-gold" />
            Estado das Candidaturas & Inscrições
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Texto do Botão / Badge Superior
              </label>
              <input
                type="text"
                value={settings.inscriptions_badge || 'Candidaturas 2026/2027 Abertas'}
                onChange={(e) => handleChange('inscriptions_badge', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Inscrições Online Abertas?
              </label>
              <select
                value={settings.inscriptions_open || 'true'}
                onChange={(e) => handleChange('inscriptions_open', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              >
                <option value="true">Sim (Formulário activo no portal)</option>
                <option value="false">Não (Temporariamente encerradas)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Contact information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
            <Phone size={18} className="text-acite-blue" />
            Contactos Oficiais & Localização
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Telefones de Contacto
              </label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                placeholder="+244 9XX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                E-mail Geral de Contacto
              </label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                placeholder="geral@acite.ao"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                E-mail das Inscrições / Admissões
              </label>
              <input
                type="email"
                value={settings.admissions_email || ''}
                onChange={(e) => handleChange('admissions_email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                placeholder="inscricoes@acite.ao"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Endereço Físico (Campus)
              </label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                placeholder="Luanda, Angola"
              />
            </div>
          </div>
        </div>

        {/* 4. Social Networks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
            <Share2 size={18} className="text-acite-blue" />
            Redes Sociais & Links Externos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Facebook URL</label>
              <input
                type="text"
                value={settings.facebook_url || ''}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Twitter / X URL</label>
              <input
                type="text"
                value={settings.twitter_url || ''}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Instagram URL</label>
              <input
                type="text"
                value={settings.instagram_url || ''}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">LinkedIn URL</label>
              <input
                type="text"
                value={settings.linkedin_url || ''}
                onChange={(e) => handleChange('linkedin_url', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>
          </div>
        </div>

        {/* 5. Statistics Counters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
            <Award size={18} className="text-acite-blue" />
            Contadores e Estatísticas em Destaque
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Estudantes Activos</label>
              <input
                type="text"
                value={settings.stat_active_students || '1.500+'}
                onChange={(e) => handleChange('stat_active_students', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">% Mestres e Doutores</label>
              <input
                type="text"
                value={settings.stat_masters_doctors || '85%'}
                onChange={(e) => handleChange('stat_masters_doctors', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Artigos Publicados</label>
              <input
                type="text"
                value={settings.stat_published_papers || '320+'}
                onChange={(e) => handleChange('stat_published_papers', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Parcerias Internacionais</label>
              <input
                type="text"
                value={settings.stat_partner_universities || '25+'}
                onChange={(e) => handleChange('stat_partner_universities', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-acite-blue text-white rounded-lg font-semibold text-sm hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            {isSaving ? 'A guardar...' : 'Guardar Todas as Definições'}
          </button>
        </div>
      </form>
    </div>
  );
}
