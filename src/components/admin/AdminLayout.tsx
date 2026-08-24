import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchInitialData,
  fetchAdminStats
} from '../../services/api';
import { 
  InitialDataResponse 
} from '../../types';
import AdminDashboard from './AdminDashboard';
import AdminCourses from './AdminCourses';
import AdminNews from './AdminNews';
import AdminEvents from './AdminEvents';
import AdminPublications from './AdminPublications';
import AdminHero from './AdminHero';
import { AdminFeatures, AdminPages } from './AdminFeatures';
import AdminMedia from './AdminMedia';
import AdminApplications from './AdminApplications';
import AdminSettings from './AdminSettings';
import AdminProfile from './AdminProfile';
import AdminDatabase from './AdminDatabase';
import { 
  LayoutDashboard, 
  GraduationCap, 
  UserPlus, 
  Newspaper, 
  Calendar, 
  BookOpen, 
  Layers, 
  Sparkles, 
  FileText, 
  Image, 
  Settings, 
  UserCheck, 
  LogOut, 
  Globe, 
  Menu, 
  X,
  ExternalLink,
  ShieldCheck,
  Database
} from 'lucide-react';

interface AdminLayoutProps {
  onCloseAdmin: () => void;
}

export default function AdminLayout({ onCloseAdmin }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<InitialDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [initialRes, statsRes] = await Promise.all([
        fetchInitialData(),
        fetchAdminStats().catch(() => ({ stats: { pendingApplications: 0 } })),
      ]);
      setData(initialRes);
      setPendingCount(statsRes.stats?.pendingApplications || 0);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'courses', label: 'Cursos & Programas', icon: GraduationCap, badge: data?.courses?.length },
    { id: 'applications', label: 'Candidaturas', icon: UserPlus, highlightBadge: pendingCount > 0 ? `${pendingCount} novas` : undefined },
    { id: 'news', label: 'Notícias & Mídia', icon: Newspaper, badge: data?.news?.length },
    { id: 'events', label: 'Eventos & Agenda', icon: Calendar, badge: data?.events?.length },
    { id: 'publications', label: 'Obras & Publicações', icon: BookOpen, badge: data?.publications?.length },
    { id: 'hero', label: 'Banners & Slides', icon: Layers },
    { id: 'features', label: 'Diferenciais (Porquê ACITE)', icon: Sparkles },
    { id: 'pages', label: 'Páginas Institucionais', icon: FileText },
    { id: 'media', label: 'Biblioteca de Ficheiros', icon: Image },
    { id: 'database', label: 'Base de Dados & Sistema', icon: Database },
    { id: 'settings', label: 'Definições do Portal', icon: Settings },
    { id: 'profile', label: 'Conta & Alterar Senha', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col antialiased">
      {/* Top WordPress-like Toolbar */}
      <header className="bg-[#1D2327] text-[#F0F0F1] h-12 flex items-center justify-between px-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-300 hover:text-white p-1"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-acite-gold text-acite-blue font-bold rounded flex items-center justify-center text-xs">
              A
            </div>
            <span className="font-bold text-sm tracking-wide hidden sm:inline">ACITE WP-Admin</span>
          </div>

          <button
            onClick={onCloseAdmin}
            className="text-xs text-gray-300 hover:text-acite-gold flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Globe size={14} />
            <span className="hidden md:inline">Ver Website Público</span>
            <ExternalLink size={12} className="opacity-70" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 text-gray-300">
            <ShieldCheck size={16} className="text-acite-gold" />
            <span>Olá, <strong className="text-white">{user?.name || user?.username || 'Administrador'}</strong></span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded font-medium transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Terminar Sessão</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-12 bottom-0 z-40 w-64 bg-[#1E1E1E] text-[#DCDCDE] flex flex-col justify-between shrink-0 shadow-lg transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="py-4 overflow-y-auto max-h-[calc(100vh-3rem)]">
            <div className="px-4 pb-3 mb-2 border-b border-gray-800 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Gestão de Conteúdos
            </div>
            <nav className="space-y-0.5 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-acite-blue text-white font-semibold shadow-sm'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isActive ? 'text-acite-gold' : 'text-gray-400'} />
                      <span>{item.label}</span>
                    </div>
                    {item.highlightBadge ? (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                        {item.highlightBadge}
                      </span>
                    ) : item.badge !== undefined ? (
                      <span className="bg-white/10 text-gray-300 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-3 border-t border-gray-800 bg-[#171717] text-[11px] text-gray-400 flex items-center justify-between">
            <span>Versão 2.4.0 (CMS)</span>
            <span className="text-acite-gold font-semibold">ACITE Core</span>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 min-w-0 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-acite-blue mb-4"></div>
              <p className="text-sm font-medium">A carregar dados do painel administrativo...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <AdminDashboard setActiveTab={setActiveTab} />}
              {activeTab === 'courses' && (
                <AdminCourses courses={data?.courses || []} onCoursesUpdated={loadAllData} />
              )}
              {activeTab === 'applications' && <AdminApplications />}
              {activeTab === 'news' && (
                <AdminNews news={data?.news || []} onNewsUpdated={loadAllData} />
              )}
              {activeTab === 'events' && (
                <AdminEvents events={data?.events || []} onEventsUpdated={loadAllData} />
              )}
              {activeTab === 'publications' && (
                <AdminPublications
                  publications={data?.publications || []}
                  onPublicationsUpdated={loadAllData}
                />
              )}
              {activeTab === 'hero' && (
                <AdminHero slides={data?.hero_slides || []} onSlidesUpdated={loadAllData} />
              )}
              {activeTab === 'features' && (
                <AdminFeatures features={data?.features || []} onDataUpdated={loadAllData} />
              )}
              {activeTab === 'pages' && (
                <AdminPages pages={data?.pages || []} onDataUpdated={loadAllData} />
              )}
              {activeTab === 'media' && <AdminMedia />}
              {activeTab === 'database' && <AdminDatabase />}
              {activeTab === 'settings' && (
                <AdminSettings initialSettings={data?.settings || {}} onSettingsUpdated={loadAllData} />
              )}
              {activeTab === 'profile' && <AdminProfile />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
