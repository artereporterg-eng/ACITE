import { useState, useEffect } from 'react';
import { HeroSlide } from '../../types';
import { ChevronLeft, ChevronRight, GraduationCap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeroSliderProps {
  slides: HeroSlide[];
  onOpenInscriptions: () => void;
}

export default function HeroSlider({ slides, onOpenInscriptions }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative h-[600px] md:h-[650px] bg-gray-950 overflow-hidden select-none">
      {/* Background Image Carousel with motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id || currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={currentSlide.image_url}
            alt={currentSlide.title}
            className="w-full h-full object-cover opacity-45 md:opacity-55"
          />
          {/* Subtle ACITE gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001830]/90 via-[#002244]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id || currentIndex}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              {currentSlide.badge && (
                <div className="inline-flex items-center gap-2 bg-acite-gold text-white px-3.5 py-1 rounded text-xs font-bold uppercase tracking-wider mb-5 shadow">
                  <GraduationCap size={14} />
                  <span>{currentSlide.badge}</span>
                </div>
              )}

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] mb-5 drop-shadow-sm text-white">
                {currentSlide.title}
              </h2>

              {currentSlide.subtitle && (
                <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 font-light leading-relaxed max-w-xl drop-shadow">
                  {currentSlide.subtitle}
                </p>
              )}

              <div className="flex flex-wrap gap-4 items-center">
                {currentSlide.primary_btn_link === '#inscricao' ? (
                  <button
                    onClick={onOpenInscriptions}
                    className="btn-gold px-8 py-3.5 text-base font-bold flex items-center gap-2 shadow-lg shadow-acite-gold/25"
                  >
                    <span>{currentSlide.primary_btn_text || 'Fazer Inscrição'}</span>
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <a
                    href={currentSlide.primary_btn_link || '#cursos'}
                    className="btn-gold px-8 py-3.5 text-base font-bold flex items-center gap-2 shadow-lg shadow-acite-gold/25"
                  >
                    <span>{currentSlide.primary_btn_text || 'Nossos Cursos'}</span>
                    <ArrowRight size={18} />
                  </a>
                )}

                {currentSlide.secondary_btn_text && (
                  <a
                    href={currentSlide.secondary_btn_link || '#'}
                    onClick={(e) => {
                      if (currentSlide.secondary_btn_link === '#inscricao') {
                        e.preventDefault();
                        onOpenInscriptions();
                      }
                    }}
                    className="bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white px-7 py-3.5 rounded-md font-semibold text-base transition-all flex items-center gap-2"
                  >
                    <span>{currentSlide.secondary_btn_text}</span>
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer"
            aria-label="Slide seguinte"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-8 bg-acite-gold' : 'w-2.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
