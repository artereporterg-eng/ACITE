import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SiteSettings } from '../../types';
import { 
  Calendar, 
  BookOpen, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Menu, 
  X, 
  Search, 
  Shield, 
  LogOut, 
  UserCheck, 
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  settings: SiteSettings;
  onOpenInscriptions: () => void;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  onOpenPageModal: (slug: string) => void;
  onOpenSearch: () => void;
}

export default function Navbar({
  settings,
  onOpenInscriptions,
  onOpenLogin,
  onOpenAdmin,
  onOpenPageModal,
  onOpenSearch,
}: NavbarProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-acite-blue text-white py-2 px-4 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-medium">
          <div className="flex items-center gap-6">
            <a
              href="#eventos"
              className="flex items-center gap-1.5 hover:text-acite-gold transition-colors"
            >
              <Calendar size={13} className="text-acite-gold" />
              <span>Calendário Académico & Eventos</span>
            </a>
            <a
              href="#publicacoes"
              className="flex items-center gap-1.5 hover:text-acite-gold transition-colors"
            >
              <BookOpen size={13} className="text-acite-gold" />
              <span>Repositório Científico & Publicações</span>
            </a>
            {settings.phone && (
              <span className="flex items-center gap-1 text-gray-300">
                <Phone size={12} className="text-acite-gold" /> {settings.phone}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenInscriptions}
              className="bg-acite-gold text-white px-3 py-1 rounded text-xs font-bold hover:bg-opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              {settings.inscriptions_badge || 'INSCRIÇÕES 2026/2027'}
            </button>

            {/* Social icons */}
            <div className="flex items-center gap-3 pl-3 border-l border-white/20">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-acite-gold transition-colors">
                  <Facebook size={13} />
                </a>
              )}
              {settings.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noreferrer" className="hover:text-acite-gold transition-colors">
                  <Twitter size={13} />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-acite-gold transition-colors">
                  <Instagram size={13} />
                </a>
              )}
              {settings.linkedin_url && (
                <a href={settings.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-acite-gold transition-colors">
                  <Linkedin size={13} />
                </a>
              )}
            </div>

            {/* Admin quick login button */}
            <div className="pl-3 border-l border-white/20">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenAdmin}
                    className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Shield size={13} className="text-acite-gold" />
                    <span>Painel Admin ({user?.username})</span>
                  </button>
                  <button
                    onClick={logout}
                    title="Terminar Sessão"
                    className="text-gray-300 hover:text-red-400 p-1"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="text-gray-300 hover:text-acite-gold text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <UserCheck size={13} />
                  <span>Área Reservada (Admin)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100 transition-all duration-200">
        <nav className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
          {/* Logo & Identity */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-acite-blue text-acite-gold font-bold text-2xl rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <h1 className="text-acite-blue font-extrabold text-xl leading-none tracking-tight">
                {settings.site_name || 'ACITE'}
              </h1>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5 max-w-xs truncate">
                {settings.full_name || 'Academia de Ciências Sociais e Tecnologias'}
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-gray-700">
            <a href="#" className="text-acite-blue border-b-2 border-acite-blue pb-0.5">
              Início
            </a>
            <button
              onClick={() => onOpenPageModal('sobre-a-acite')}
              className="hover:text-acite-blue transition-colors cursor-pointer"
            >
              A Instituição
            </button>
            <a href="#cursos" className="hover:text-acite-blue transition-colors">
              Ensino & Cursos
            </a>
            <button
              onClick={() => onOpenPageModal('investigacao-e-pos-graduacao')}
              className="hover:text-acite-blue transition-colors cursor-pointer"
            >
              Investigação
            </button>
            <a href="#noticias" className="hover:text-acite-blue transition-colors">
              Notícias
            </a>
            <a href="#eventos" className="hover:text-acite-blue transition-colors">
              Eventos
            </a>
            <a href="#publicacoes" className="hover:text-acite-blue transition-colors">
              Publicações
            </a>
            <a href="#contactos" className="hover:text-acite-blue transition-colors">
              Contactos
            </a>

            {/* Search action */}
            <button
              onClick={onOpenSearch}
              className="text-gray-500 hover:text-acite-blue p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              title="Pesquisar no portal"
            >
              <Search size={18} />
            </button>

            {/* Inscription CTA button */}
            <button
              onClick={onOpenInscriptions}
              className="btn-gold px-4 py-2 text-xs uppercase tracking-wider font-bold shadow-sm"
            >
              Candidaturas
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenSearch}
              className="text-gray-600 p-2"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-acite-blue p-2"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden shadow-lg"
            >
              <div className="flex flex-col p-4 gap-3 text-sm font-semibold text-gray-800">
                <a
                  href="#"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 px-3 rounded-lg bg-blue-50 text-acite-blue"
                >
                  Início
                </a>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenPageModal('sobre-a-acite');
                  }}
                  className="text-left py-2 px-3 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  A Instituição
                </button>
                <a
                  href="#cursos"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Ensino & Cursos
                </a>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenPageModal('investigacao-e-pos-graduacao');
                  }}
                  className="text-left py-2 px-3 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Investigação
                </button>
                <a
                  href="#noticias"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Notícias
                </a>
                <a
                  href="#eventos"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Eventos
                </a>
                <a
                  href="#publicacoes"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Publicações
                </a>
                <a
                  href="#contactos"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Contactos
                </a>

                <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenInscriptions();
                    }}
                    className="btn-gold py-2.5 text-center font-bold text-sm w-full"
                  >
                    Fazer Inscrição Online
                  </button>
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="py-2.5 bg-gray-900 text-white font-semibold text-xs rounded-md text-center flex items-center justify-center gap-2"
                    >
                      <Shield size={14} className="text-acite-gold" /> Ir para o Painel Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenLogin();
                      }}
                      className="py-2 text-center text-xs text-gray-600 hover:text-acite-blue"
                    >
                      Entrar no Painel Administrativo
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
