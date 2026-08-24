import React, { useState } from 'react';
import { Course } from '../../types';
import { saveCourse, deleteCourse } from '../../services/api';
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  Search, 
  X 
} from 'lucide-react';

interface AdminCoursesProps {
  courses: Course[];
  onCoursesUpdated: () => void;
}

export default function AdminCourses({ courses, onCoursesUpdated }: AdminCoursesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    'Pós-Graduação Académica',
    'Pós-Graduação Profissional',
    'Centro de Estudos de Línguas',
    'Especialização Executiva',
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setCurrentCourse({
      title: '',
      category: 'Pós-Graduação Académica',
      degree: 'Mestrado (MSc)',
      duration: '2 Anos',
      modality: 'Presencial',
      description: '',
      syllabus: '',
      requirements: '',
      vacancies: 30,
      image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
      featured: 0,
      is_active: 1,
    });
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setCurrentCourse({ ...course });
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Tem a certeza que deseja eliminar o curso "${title}"?`)) return;
    try {
      await deleteCourse(id);
      setSuccessMsg('Curso removido com sucesso!');
      onCoursesUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao eliminar curso.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCourse.title) {
      setErrorMsg('O título do curso é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await saveCourse(currentCourse);
      setSuccessMsg('Curso guardado com sucesso!');
      setIsModalOpen(false);
      onCoursesUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao guardar curso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="text-acite-blue" size={28} />
            Gestão de Cursos e Programas Académicos
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Adicione, edite e organize os cursos de pós-graduação, mestrados e doutoramentos ministrados na ACITE.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-acite-blue text-white rounded-lg font-semibold text-sm hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus size={18} /> Novo Curso
        </button>
      </div>

      {/* Messages */}
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

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-acite-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({courses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-acite-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                <img
                  src={course.image_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="bg-acite-blue text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    {course.category}
                  </span>
                  {course.featured ? (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow">
                      <Star size={10} fill="currentColor" /> Destaque
                    </span>
                  ) : null}
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-xs font-semibold text-acite-gold">{course.degree}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-3 mb-4">{course.description}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded-lg text-gray-600 mb-2">
                  <div>
                    <span className="font-semibold block text-gray-900">Duração:</span> {course.duration || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold block text-gray-900">Modalidade:</span> {course.modality || 'Presencial'}
                  </div>
                  <div>
                    <span className="font-semibold block text-gray-900">Vagas:</span> {course.vacancies || 30}
                  </div>
                  <div>
                    <span className="font-semibold block text-gray-900">Estado:</span>{' '}
                    <span className={course.is_active ? 'text-green-600 font-semibold' : 'text-red-500'}>
                      {course.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <button
                onClick={() => handleOpenEdit(course)}
                className="text-xs font-semibold text-acite-blue hover:text-acite-gold flex items-center gap-1 cursor-pointer"
              >
                <Edit size={14} /> Editar
              </button>
              <button
                onClick={() => handleDelete(course.id, course.title)}
                className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-base font-bold text-gray-700">Nenhum curso encontrado</h4>
          <p className="text-xs mt-1">Tente ajustar a pesquisa ou adicionar um novo curso.</p>
        </div>
      )}

      {/* Edit/Add Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <GraduationCap className="text-acite-blue" size={22} />
                {currentCourse.id ? 'Editar Curso' : 'Criar Novo Curso'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Título do Curso *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentCourse.title || ''}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Ex: Mestrado em Engenharia de Software"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    value={currentCourse.category || 'Pós-Graduação Académica'}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Grau Académico
                  </label>
                  <input
                    type="text"
                    value={currentCourse.degree || ''}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, degree: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Ex: Doutoramento (PhD), Mestrado (MSc)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Duração
                  </label>
                  <input
                    type="text"
                    value={currentCourse.duration || ''}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Ex: 2 Anos, 4 Semestres"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Modalidade
                  </label>
                  <input
                    type="text"
                    value={currentCourse.modality || ''}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, modality: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Ex: Presencial, Pós-Laboral, Híbrido"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    URL da Imagem de Destaque
                  </label>
                  <input
                    type="text"
                    value={currentCourse.image_url || ''}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, image_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Descrição Geral do Curso
                  </label>
                  <textarea
                    rows={3}
                    value={currentCourse.description || ''}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Resumo dos objectivos e competências..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Plano Curricular / Síntese do Programa
                  </label>
                  <textarea
                    rows={3}
                    value={currentCourse.syllabus || ''}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, syllabus: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Módulos, disciplinas ou linhas de investigação..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Requisitos de Acesso e Perfil de Entrada
                  </label>
                  <textarea
                    rows={2}
                    value={currentCourse.requirements || ''}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, requirements: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                    placeholder="Habilitações literárias prévias necessárias..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Número de Vagas
                  </label>
                  <input
                    type="number"
                    value={currentCourse.vacancies || 30}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, vacancies: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={!!currentCourse.featured}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, featured: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 text-acite-blue rounded"
                    />
                    Destacar na Página Inicial
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={currentCourse.is_active !== 0}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, is_active: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 text-acite-blue rounded"
                    />
                    Curso Activo / Publicado
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-acite-blue text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'A guardar...' : 'Guardar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
