import { useState } from 'react';
import { Course } from '../../types';
import { 
  GraduationCap, 
  Clock, 
  Users, 
  BookOpen, 
  ChevronRight, 
  CheckCircle, 
  X, 
  Search,
  Award
} from 'lucide-react';

interface CoursesSectionProps {
  courses: Course[];
  onApplyCourse: (courseTitle: string) => void;
}

export default function CoursesSection({ courses, onApplyCourse }: CoursesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourseModal, setActiveCourseModal] = useState<Course | null>(null);

  const categories = [
    'Pós-Graduação Académica',
    'Pós-Graduação Profissional',
    'Centro de Estudos de Línguas',
    'Especialização Executiva',
  ];

  const activeCourses = courses.filter((c) => c.is_active !== 0);

  const filteredCourses = activeCourses.filter((course) => {
    const matchesCat = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (course.degree && course.degree.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <section id="cursos" className="py-20 bg-gray-50/70 border-y border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-acite-gold font-bold tracking-widest uppercase text-xs mb-2">
            <Award size={14} /> Oferta Formativa 2026/2027
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-acite-dark tracking-tight">
            Cursos de Pós-Graduação e Formação Avançada
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-3 leading-relaxed">
            Programas curriculares de elevado rigor científico concebidos para capacitar líderes, investigadores e especialistas de excelência em Angola.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-acite-blue text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Todos os Cursos ({activeCourses.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-acite-blue text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar especialidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-acite-blue outline-none"
            />
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image Cover */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={course.image_url || '/multimedia/default-academic.svg'}
                    alt={course.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/multimedia/default-academic.svg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-acite-blue/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                      {course.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-xs font-semibold text-acite-gold uppercase tracking-wider block">
                      {course.degree || 'Grau Académico'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg leading-snug mb-3 group-hover:text-acite-blue transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 mb-6">
                    {course.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-3 rounded-xl text-gray-600 mb-2 border border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-acite-blue shrink-0" />
                      <span>{course.duration || '2 Anos'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-acite-gold shrink-0" />
                      <span>{course.modality || 'Presencial'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-acite-blue shrink-0" />
                      <span>{course.vacancies || 30} Vagas</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <CheckCircle size={13} className="shrink-0" />
                      <span>Inscrições Abertas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Bottom Bar */}
              <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
                <button
                  onClick={() => setActiveCourseModal(course)}
                  className="text-xs font-bold text-acite-blue hover:text-acite-gold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <BookOpen size={14} />
                  <span>Ver Programa</span>
                </button>

                <button
                  onClick={() => onApplyCourse(course.title)}
                  className="bg-acite-gold hover:bg-opacity-90 active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <span>Candidatar</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
            <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
            <h4 className="font-bold text-base text-gray-800">Nenhum curso encontrado nesta categoria</h4>
            <p className="text-xs mt-1">Experimente limpar a pesquisa ou selecionar "Todos os Cursos".</p>
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {activeCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-acite-blue text-white relative">
              <button
                onClick={() => setActiveCourseModal(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
              <span className="bg-acite-gold text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
                {activeCourseModal.category}
              </span>
              <h3 className="text-2xl font-bold leading-tight">{activeCourseModal.title}</h3>
              <p className="text-blue-200 text-xs mt-1">{activeCourseModal.degree}</p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Duração</span>
                  <span className="font-bold text-acite-blue">{activeCourseModal.duration || '2 Anos'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Modalidade</span>
                  <span className="font-bold text-acite-blue">{activeCourseModal.modality || 'Presencial'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Vagas Limite</span>
                  <span className="font-bold text-acite-blue">{activeCourseModal.vacancies || 30} Vagas</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">
                  Apresentação do Curso
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {activeCourseModal.description}
                </p>
              </div>

              {/* Syllabus */}
              {activeCourseModal.syllabus && (
                <div>
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">
                    Plano Curricular & Conteúdo Programático
                  </h4>
                  <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-3.5 rounded-xl border border-gray-100 font-mono">
                    {activeCourseModal.syllabus}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {activeCourseModal.requirements && (
                <div>
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">
                    Condições de Admissão & Perfil de Entrada
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                    {activeCourseModal.requirements}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 px-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => setActiveCourseModal(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const title = activeCourseModal.title;
                  setActiveCourseModal(null);
                  onApplyCourse(title);
                }}
                className="btn-gold px-6 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>Inscrever-me Neste Curso</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
