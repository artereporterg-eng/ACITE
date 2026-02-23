/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  Facebook, 
  GraduationCap, 
  Instagram, 
  Mail, 
  MapPin, 
  Menu, 
  Phone, 
  Search, 
  Twitter, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-acite-blue text-white py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-medium">
          <div className="flex gap-6">
            <a href="#" className="flex items-center gap-2 hover:text-acite-gold transition-colors">
              <Calendar size={14} /> Calendário Académico
            </a>
            <a href="#" className="flex items-center gap-2 hover:text-acite-gold transition-colors">
              <BookOpen size={14} /> Repositório Institucional
            </a>
          </div>
          <div className="flex gap-4 items-center">
            <a href="#" className="bg-acite-gold px-3 py-1 rounded text-white hover:bg-opacity-90 transition-all">
              INSCRIÇÕES
            </a>
            <div className="flex gap-3 ml-4 border-l border-white/20 pl-4">
              <Facebook size={14} className="cursor-pointer hover:text-acite-gold" />
              <Twitter size={14} className="cursor-pointer hover:text-acite-gold" />
              <Instagram size={14} className="cursor-pointer hover:text-acite-gold" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white py-4'}`}>
        <nav className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-acite-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <div>
              <h1 className="text-acite-blue text-lg leading-tight">ACITE</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Academia de Ciências Sociais e Tecnologias</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#" className="nav-link text-acite-blue font-bold">Início</a>
            <a href="#" className="nav-link">A Instituição</a>
            <a href="#" className="nav-link">Ensino</a>
            <a href="#" className="nav-link">Investigação</a>
            <a href="#" className="nav-link">Extensão</a>
            <a href="#" className="nav-link">Publicações</a>
            <a href="#" className="nav-link">Contactos</a>
            <button className="text-acite-blue hover:text-acite-gold transition-colors">
              <Search size={20} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-acite-blue"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t overflow-hidden"
            >
              <div className="flex flex-col p-4 gap-4">
                <a href="#" className="font-bold text-acite-blue">Início</a>
                <a href="#">A Instituição</a>
                <a href="#">Ensino</a>
                <a href="#">Investigação</a>
                <a href="#">Extensão</a>
                <a href="#">Publicações</a>
                <a href="#">Contactos</a>
                <div className="pt-4 border-t flex gap-4">
                  <a href="#" className="btn-gold text-center flex-1">Inscrições</a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-[600px] overflow-hidden">
          <img 
            src="https://picsum.photos/seed/acite-campus/1920/1080" 
            alt="ACITE Campus" 
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl text-white"
              >
                <span className="bg-acite-gold text-white px-3 py-1 rounded text-sm font-bold mb-4 inline-block">BEM-VINDO À ACITE</span>
                <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Excelência no Ensino e Investigação</h2>
                <p className="text-lg mb-8 text-gray-100">Uma instituição pública de altos estudos dedicada ao desenvolvimento das Ciências Sociais, Engenharias e Tecnologias em Angola.</p>
                <div className="flex flex-wrap gap-4">
                  <button className="btn-gold px-8 py-3 text-lg">Nossos Cursos</button>
                  <button className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-3 rounded-md font-medium hover:bg-white/30 transition-all text-lg">Saiba Mais</button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quick Stats/Actions */}
        <section className="bg-acite-light py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-acite-blue group hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-acite-blue/10 rounded-lg flex items-center justify-center text-acite-blue mb-6 group-hover:bg-acite-blue group-hover:text-white transition-colors">
                  <GraduationCap size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Pós-Graduação</h3>
                <p className="text-gray-600 mb-4">Doutoramentos e Mestrados académicos focados na excelência científica.</p>
                <a href="#" className="text-acite-blue font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Ver Cursos <ChevronRight size={16} />
                </a>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-acite-gold group hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-acite-gold/10 rounded-lg flex items-center justify-center text-acite-gold mb-6 group-hover:bg-acite-gold group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Investigação</h3>
                <p className="text-gray-600 mb-4">Desenvolvimento de projectos científicos com impacto social e tecnológico.</p>
                <a href="#" className="text-acite-gold font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Projectos <ChevronRight size={16} />
                </a>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-acite-blue group hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-acite-blue/10 rounded-lg flex items-center justify-center text-acite-blue mb-6 group-hover:bg-acite-blue group-hover:text-white transition-colors">
                  <Calendar size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Eventos</h3>
                <p className="text-gray-600 mb-4">Fique por dentro das conferências, seminários e workshops da ACITE.</p>
                <a href="#" className="text-acite-blue font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Calendário <ChevronRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-acite-gold font-bold tracking-widest uppercase text-sm">Actualidade</span>
                <h2 className="text-4xl font-bold mt-2">Últimas Notícias</h2>
              </div>
              <a href="#" className="text-acite-blue font-bold border-b-2 border-acite-blue pb-1 hidden md:block">Ver Todas as Notícias</a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <article key={i} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl mb-4 aspect-video">
                    <img 
                      src={`https://picsum.photos/seed/news-${i}/800/600`} 
                      alt="News" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-acite-blue text-white text-xs font-bold px-2 py-1 rounded">
                      23 FEV 2026
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-acite-blue transition-colors">ACITE Realiza Conferência Internacional sobre Tecnologias Emergentes</h3>
                  <p className="text-gray-600 line-clamp-2">O evento reuniu especialistas nacionais e internacionais para discutir o futuro da inovação tecnológica em Angola...</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-acite-blue text-white py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-1/2" />
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-8">Porquê escolher a ACITE?</h2>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full border border-acite-gold flex items-center justify-center shrink-0 text-acite-gold">
                      01
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Corpo Docente Qualificado</h4>
                      <p className="text-blue-100">Contamos com doutores e mestres de renome com vasta experiência académica e profissional.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full border border-acite-gold flex items-center justify-center shrink-0 text-acite-gold">
                      02
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Infraestrutura Moderna</h4>
                      <p className="text-blue-100">Laboratórios equipados e bibliotecas actualizadas para suportar a sua jornada de aprendizagem.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full border border-acite-gold flex items-center justify-center shrink-0 text-acite-gold">
                      03
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Reconhecimento Institucional</h4>
                      <p className="text-blue-100">Somos uma instituição pública de referência, reconhecida pela qualidade dos seus graduados.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://picsum.photos/seed/acite-students/800/1000" 
                  alt="Students" 
                  className="rounded-2xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-8 -left-8 bg-acite-gold p-8 rounded-2xl shadow-xl hidden md:block">
                  <p className="text-4xl font-bold">+1500</p>
                  <p className="text-sm uppercase tracking-widest font-semibold opacity-80">Estudantes Activos</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-acite-light">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para elevar a sua carreira académica?</h2>
            <p className="text-lg text-gray-600 mb-10">As inscrições para os cursos de Pós-Graduação estão abertas. Junte-se a uma comunidade de excelência.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="btn-gold px-10 py-4 text-lg shadow-lg shadow-acite-gold/20">Inscrever-se Agora</button>
              <button className="bg-white text-acite-blue border border-acite-blue px-10 py-4 rounded-md font-medium hover:bg-acite-blue hover:text-white transition-all text-lg">Ver Guia do Candidato</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-acite-dark text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-acite-blue rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <h2 className="text-2xl font-bold">ACITE</h2>
              </div>
              <p className="text-gray-400 mb-6">Academia de Ciências Sociais e Tecnologias. Instituição de Ensino Superior Pública de Altos Estudos em Angola.</p>
              <div className="flex gap-4">
                <Facebook size={20} className="text-gray-400 hover:text-acite-gold cursor-pointer transition-colors" />
                <Twitter size={20} className="text-gray-400 hover:text-acite-gold cursor-pointer transition-colors" />
                <Instagram size={20} className="text-gray-400 hover:text-acite-gold cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6 border-l-4 border-acite-gold pl-4">Links Rápidos</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">A Instituição</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cursos Disponíveis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investigação Científica</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Publicações</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Calendário Académico</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 border-l-4 border-acite-gold pl-4">Cursos</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Doutoramentos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mestrados</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Especializações</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Línguas</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 border-l-4 border-acite-gold pl-4">Contactos</h4>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="text-acite-gold shrink-0" />
                  <span>Luanda, Angola</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={20} className="text-acite-gold shrink-0" />
                  <span>+244 9XX XXX XXX</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={20} className="text-acite-gold shrink-0" />
                  <span>info@acite.ao</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} ACITE - Academia de Ciências Sociais e Tecnologias. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
