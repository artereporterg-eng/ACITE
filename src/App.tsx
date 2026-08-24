import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { fetchInitialData } from './services/api';
import { InitialDataResponse, InstitutionalPage } from './types';
import Navbar from './components/public/Navbar';
import HeroSlider from './components/public/HeroSlider';
import CoursesSection from './components/public/CoursesSection';
import WhyChooseSection from './components/public/WhyChooseSection';
import NewsSection from './components/public/NewsSection';
import EventsSection from './components/public/EventsSection';
import PublicationsSection from './components/public/PublicationsSection';
import ApplicationModal from './components/public/ApplicationModal';
import InstitutionalModal from './components/public/InstitutionalModal';
import LoginModal from './components/public/LoginModal';
import SearchModal from './components/public/SearchModal';
import Footer from './components/public/Footer';
import AdminLayout from './components/admin/AdminLayout';
import { Sparkles } from 'lucide-react';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<InitialDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);

  // Modals state
  const [isInscriptionOpen, setIsInscriptionOpen] = useState(false);
  const [preSelectedCourse, setPreSelectedCourse] = useState<string>('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activePageSlug, setActivePageSlug] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchInitialData();
      setData(res);
    } catch (err) {
      console.error('Error loading ACITE portal initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenInscriptions = (courseTitle?: string) => {
    if (courseTitle) setPreSelectedCourse(courseTitle);
    setIsInscriptionOpen(true);
  };

  const handleOpenPage = (slug: string) => {
    setActivePageSlug(slug);
  };

  const selectedPage: InstitutionalPage | undefined = data?.pages?.find(
    (p) => p.slug === activePageSlug
  );

  // If user requested admin view and is authenticated, show the WordPress CMS Admin Layout
  if (isAdminView && isAuthenticated) {
    return (
      <AdminLayout
        onCloseAdmin={() => {
          setIsAdminView(false);
          loadData(); // refresh public data after edits
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-acite-blue flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 bg-white text-acite-blue font-black text-3xl rounded-2xl flex items-center justify-center shadow-2xl mb-6 animate-bounce">
          A
        </div>
        <h2 className="text-xl font-bold tracking-wide">ACITE</h2>
        <p className="text-xs text-blue-200 mt-1 uppercase tracking-widest font-semibold">
          Academia de Ciências Sociais e Tecnologias
        </p>
        <div className="mt-8 flex items-center gap-2 text-xs text-blue-300">
          <div className="w-2 h-2 rounded-full bg-acite-gold animate-ping" />
          <span>A carregar portal institucional...</span>
        </div>
      </div>
    );
  }

  const settings = data?.settings || {};
  const heroSlides = data?.heroSlides || (data as any)?.hero_slides || [];
  const features = data?.features || [];
  const courses = data?.courses || [];
  const news = data?.news || [];
  const events = data?.events || [];
  const publications = data?.publications || [];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans selection:bg-acite-gold selection:text-white">
      {/* Dynamic Navbar with Real Settings */}
      <Navbar
        settings={settings}
        onOpenInscriptions={() => handleOpenInscriptions()}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenAdmin={() => setIsAdminView(true)}
        onOpenPageModal={handleOpenPage}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1">
        {/* Dynamic Hero Slider */}
        <HeroSlider
          slides={heroSlides}
          onOpenInscriptions={() => handleOpenInscriptions()}
        />

        {/* Dynamic Courses Section */}
        <CoursesSection
          courses={courses}
          onApplyCourse={(title) => handleOpenInscriptions(title)}
        />

        {/* Why Choose ACITE Section with dynamic features & stats */}
        <WhyChooseSection
          features={features}
          settings={settings}
        />

        {/* Dynamic News Section */}
        <NewsSection news={news} />

        {/* Dynamic Scientific Events Section */}
        <EventsSection
          events={events}
          onOpenInscriptions={() => handleOpenInscriptions()}
        />

        {/* Dynamic Publications & Books Repository Section */}
        <PublicationsSection publications={publications} />

        {/* Call to Action Bar */}
        <section className="py-16 bg-gradient-to-r from-acite-blue via-[#002B54] to-acite-blue text-white text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-5">
            <span className="inline-flex items-center gap-1.5 text-acite-gold font-bold text-xs uppercase tracking-widest bg-acite-gold/10 px-3 py-1 rounded-full border border-acite-gold/30">
              <Sparkles size={14} /> Candidaturas Abertas para Mestrados e Doutoramentos
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Pronto para impulsionar a sua carreira e formação científica?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
              Junte-se à instituição pública de referência em Angola. Preencha a sua candidatura online hoje mesmo.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => handleOpenInscriptions()}
                className="btn-gold px-8 py-3.5 text-sm font-bold shadow-lg shadow-acite-gold/25"
              >
                Fazer Candidatura Online
              </button>
              <a
                href="#cursos"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 text-white px-7 py-3.5 rounded-md text-sm font-semibold transition-all"
              >
                Explorar Todos os Cursos
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Dynamic Footer */}
      <Footer
        settings={settings}
        courses={courses}
        onOpenInscriptions={() => handleOpenInscriptions()}
        onOpenLogin={() => {
          if (isAuthenticated) {
            setIsAdminView(true);
          } else {
            setIsLoginOpen(true);
          }
        }}
        onOpenPageModal={handleOpenPage}
      />

      {/* Candidate Admission Application Modal */}
      <ApplicationModal
        isOpen={isInscriptionOpen}
        onClose={() => {
          setIsInscriptionOpen(false);
          setPreSelectedCourse('');
        }}
        courses={courses}
        preSelectedCourse={preSelectedCourse}
      />

      {/* Institutional Page Modal (Sobre Nós, Missão e Visão) */}
      <InstitutionalModal
        isOpen={!!activePageSlug}
        onClose={() => setActivePageSlug(null)}
        page={selectedPage}
      />

      {/* Admin Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminView(true);
        }}
      />

      {/* Spotlight Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        courses={courses}
        news={news}
        events={events}
        publications={publications}
        onSelectCourse={(c) => {
          setIsSearchOpen(false);
          handleOpenInscriptions(c.title);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
