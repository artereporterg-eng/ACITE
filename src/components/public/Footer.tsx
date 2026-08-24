import { Course, SiteSettings } from '../../types';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Shield, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  ExternalLink
} from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  courses: Course[];
  onOpenInscriptions: () => void;
  onOpenLogin: () => void;
  onOpenPageModal: (slug: string) => void;
}

export default function Footer({
  settings,
  courses,
  onOpenInscriptions,
  onOpenLogin,
  onOpenPageModal,
}: FooterProps) {
  const featuredCourses = courses.slice(0, 4);

  return (
    <footer id="contactos" className="bg-acite-dark text-white pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-acite-blue text-acite-gold rounded-lg flex items-center justify-center font-bold text-xl shadow">
                A
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white leading-none">
                  {settings.site_name || 'ACITE'}
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">
                  República de Angola
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-light">
              {settings.description ||
                'A Academia de Ciências Sociais e Tecnologias é uma Instituição de Ensino Superior Pública de Altos Estudos vocacionada para a excelência científica, inovação e liderança.'}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-acite-gold text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Facebook size={15} />
                </a>
              )}
              {settings.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-acite-gold text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Twitter size={15} />
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-acite-gold text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Instagram size={15} />
                </a>
              )}
              {settings.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-acite-gold text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Linkedin size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Institutional Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-5 border-l-4 border-acite-gold pl-3">
              A Instituição
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => onOpenPageModal('sobre-a-acite')}
                  className="hover:text-acite-gold transition-colors text-left"
                >
                  Sobre a ACITE & História
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPageModal('missao-visao-e-valores')}
                  className="hover:text-acite-gold transition-colors text-left"
                >
                  Missão, Visão e Valores
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPageModal('investigacao-e-pos-graduacao')}
                  className="hover:text-acite-gold transition-colors text-left"
                >
                  Investigação & Pós-Graduação
                </button>
              </li>
              <li>
                <a href="#eventos" className="hover:text-acite-gold transition-colors">
                  Calendário Científico
                </a>
              </li>
              <li>
                <a href="#publicacoes" className="hover:text-acite-gold transition-colors">
                  Repositório Institucional
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Courses */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-5 border-l-4 border-acite-gold pl-3">
              Programas Curriculares
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              {featuredCourses.map((c) => (
                <li key={c.id}>
                  <a href="#cursos" className="hover:text-acite-gold transition-colors line-clamp-1">
                    {c.title}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={onOpenInscriptions}
                  className="text-acite-gold font-bold hover:underline mt-2 flex items-center gap-1"
                >
                  <span>Candidaturas Abertas</span>
                  <ExternalLink size={12} />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacts & Official Location */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-5 border-l-4 border-acite-gold pl-3">
              Contactos Oficiais
            </h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-acite-gold shrink-0 mt-0.5" />
                <span>{settings.address || 'Luanda, República de Angola'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-acite-gold shrink-0" />
                <span>{settings.phone || '+244 9XX XXX XXX'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-acite-gold shrink-0" />
                <span>{settings.email || 'geral@acite.ao'}</span>
              </li>
              {settings.admissions_email && (
                <li className="flex items-center gap-2.5">
                  <Mail size={16} className="text-acite-gold shrink-0" />
                  <span>Admissões: {settings.admissions_email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Admin Login shortcut */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {settings.full_name || 'ACITE - Academia de Ciências Sociais e Tecnologias'}. Todos os direitos reservados.
          </p>
          
          <button
            onClick={onOpenLogin}
            className="text-gray-500 hover:text-acite-gold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
          >
            <Shield size={13} className="text-acite-gold" />
            <span>Aceder ao Painel Administrativo (WordPress CMS)</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
