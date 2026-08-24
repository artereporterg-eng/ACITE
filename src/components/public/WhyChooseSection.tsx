import { FeatureItem, SiteSettings } from '../../types';
import { Sparkles, Users, Award, BookOpen, Globe2 } from 'lucide-react';

interface WhyChooseSectionProps {
  features: FeatureItem[];
  settings: SiteSettings;
}

export default function WhyChooseSection({ features, settings }: WhyChooseSectionProps) {
  return (
    <section className="bg-acite-blue text-white py-20 relative overflow-hidden">
      {/* Decorative Geometric Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-white/[0.03] skew-x-12 translate-x-1/3 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-acite-gold/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Why Choose ACITE Title & Features */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-acite-gold/20 text-acite-gold text-xs font-bold px-3 py-1 rounded-full border border-acite-gold/30 mb-3">
                <Sparkles size={14} /> Diferenciais Institucionais
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Porquê escolher a ACITE para a sua Pós-Graduação?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base mt-4 leading-relaxed font-light">
                Compreendemos as exigências de liderança na sociedade contemporânea e oferecemos formação que alia excelência científica ao rigor profissional.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              {features.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-2xl border-2 border-acite-gold/80 bg-acite-gold/10 flex items-center justify-center font-extrabold text-acite-gold shrink-0 text-base group-hover:bg-acite-gold group-hover:text-acite-blue transition-all duration-300">
                    {item.step_number}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-acite-gold transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Dynamic Stats & Campus Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop"
                alt="ACITE Estudantes e Docentes"
                className="w-full h-full object-cover aspect-4/5"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-acite-blue/90 via-acite-blue/20 to-transparent" />
            </div>

            {/* Float Highlight Badge */}
            <div className="absolute -bottom-6 -left-6 bg-acite-gold text-white p-6 rounded-2xl shadow-2xl border border-white/20 hidden sm:block max-w-xs">
              <p className="text-3xl font-black">{settings.stat_active_students || '1.500+'}</p>
              <p className="text-xs uppercase tracking-wider font-bold opacity-90 mt-1">
                Estudantes e Investigadores Activos
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Numbers Bar */}
        <div className="mt-16 pt-12 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Users size={24} className="mx-auto text-acite-gold mb-2" />
            <p className="text-3xl font-extrabold text-white">{settings.stat_active_students || '1.500+'}</p>
            <p className="text-xs text-blue-200 mt-1 font-medium">Estudantes Formados & Activos</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Award size={24} className="mx-auto text-acite-gold mb-2" />
            <p className="text-3xl font-extrabold text-white">{settings.stat_masters_doctors || '85%'}</p>
            <p className="text-xs text-blue-200 mt-1 font-medium">Corpo Docente com Doutoramento</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <BookOpen size={24} className="mx-auto text-acite-gold mb-2" />
            <p className="text-3xl font-extrabold text-white">{settings.stat_published_papers || '320+'}</p>
            <p className="text-xs text-blue-200 mt-1 font-medium">Artigos e Obras Publicadas</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Globe2 size={24} className="mx-auto text-acite-gold mb-2" />
            <p className="text-3xl font-extrabold text-white">{settings.stat_partner_universities || '25+'}</p>
            <p className="text-xs text-blue-200 mt-1 font-medium">Parcerias e Convénios Globais</p>
          </div>
        </div>
      </div>
    </section>
  );
}
