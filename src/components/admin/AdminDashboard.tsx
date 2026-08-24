import { useState, useEffect } from 'react';
import { fetchAdminStats } from '../../services/api';
import { 
  GraduationCap, 
  Newspaper, 
  Calendar, 
  BookOpen, 
  UserPlus, 
  Clock, 
  ArrowUpRight, 
  PlusCircle, 
  Settings, 
  Sparkles,
  FileText,
  Database
} from 'lucide-react';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

export default function AdminDashboard({ setActiveTab }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminStats();
      setStats(data.stats);
      setRecentApplications(data.recentApplications || []);
      setRecentNews(data.recentNews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-acite-blue"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Cursos & Programas',
      count: stats?.courses || 0,
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      tab: 'courses',
    },
    {
      title: 'Candidaturas Recebidas',
      count: stats?.applications || 0,
      badge: stats?.pendingApplications ? `${stats.pendingApplications} pendentes` : undefined,
      icon: UserPlus,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tab: 'applications',
    },
    {
      title: 'Notícias Publicadas',
      count: stats?.news || 0,
      icon: Newspaper,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      tab: 'news',
    },
    {
      title: 'Eventos & Calendário',
      count: stats?.events || 0,
      icon: Calendar,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      tab: 'events',
    },
    {
      title: 'Obras & Publicações',
      count: stats?.publications || 0,
      icon: BookOpen,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      tab: 'publications',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-acite-blue to-[#002244] rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-acite-gold/20 text-acite-gold text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-acite-gold/30">
            <Sparkles size={14} /> Sistema de Gestão de Conteúdos ACITE
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Painel de Controlo ACITE</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Bem-vindo ao gestor de conteúdos da Academia de Ciências Sociais e Tecnologias. 
            Todas as alterações efectuadas aqui reflectem-se instantaneamente no website público.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setActiveTab('courses')}
              className="bg-acite-gold text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-1.5 shadow"
            >
              <PlusCircle size={14} /> Novo Curso
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 backdrop-blur-sm"
            >
              <FileText size={14} /> Nova Notícia
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 backdrop-blur-sm"
            >
              <Settings size={14} /> Definições do Portal
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className="bg-acite-gold text-acite-blue hover:bg-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Database size={14} /> Base de Dados & Auto-Update
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(card.tab)}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg border ${card.color}`}>
                  <Icon size={20} />
                </div>
                <ArrowUpRight size={18} className="text-gray-400 group-hover:text-acite-blue transition-colors" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">{card.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-gray-900">{card.count}</span>
                  {card.badge && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                      {card.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two columns: Recent Applications & Recent News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Últimas Candidaturas</h3>
              <p className="text-xs text-gray-500">Inscrições recebidas através do formulário web</p>
            </div>
            <button
              onClick={() => setActiveTab('applications')}
              className="text-xs text-acite-blue font-semibold hover:underline"
            >
              Ver Todas ({stats?.applications || 0})
            </button>
          </div>

          {recentApplications.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">Nenhuma candidatura registada ainda.</p>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100/80 transition-colors">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-semibold text-gray-900 truncate">{app.full_name}</p>
                    <p className="text-xs text-gray-600 truncate">{app.course_title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {new Date(app.created_at).toLocaleDateString('pt-PT')} • {app.phone}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${
                      app.status === 'Aprovado'
                        ? 'bg-green-100 text-green-800'
                        : app.status === 'Rejeitado'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent News */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Notícias & Publicações Recentes</h3>
              <p className="text-xs text-gray-500">Últimos artigos e comunicados oficiais</p>
            </div>
            <button
              onClick={() => setActiveTab('news')}
              className="text-xs text-acite-blue font-semibold hover:underline"
            >
              Gerir Notícias
            </button>
          </div>

          {recentNews.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">Nenhum artigo publicado ainda.</p>
          ) : (
            <div className="space-y-3">
              {recentNews.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100/80 transition-colors">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Publicado em {n.published_at} • {n.views || 0} visualizações
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${n.is_published ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                    {n.is_published ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
