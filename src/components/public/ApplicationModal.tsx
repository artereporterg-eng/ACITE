import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { submitApplication } from '../../services/api';
import { UserPlus, CheckCircle2, AlertCircle, X, Send, GraduationCap } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  preSelectedCourse?: string;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  courses,
  preSelectedCourse,
}: ApplicationModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [identityCard, setIdentityCard] = useState('');
  const [courseTitle, setCourseTitle] = useState(preSelectedCourse || '');
  const [academicDegree, setAcademicDegree] = useState('Licenciatura');
  const [graduationInst, setGraduationInst] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (preSelectedCourse) {
      setCourseTitle(preSelectedCourse);
    } else if (courses.length > 0 && !courseTitle) {
      setCourseTitle(courses[0].title);
    }
  }, [preSelectedCourse, courses]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !courseTitle) {
      setErrorMsg('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await submitApplication({
        full_name: fullName,
        email,
        phone,
        identity_card: identityCard,
        course_title: courseTitle,
        academic_degree: academicDegree,
        graduation_institution: graduationInst,
        notes,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao submeter candidatura.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setIdentityCard('');
    setNotes('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-acite-blue text-white relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-acite-gold text-xs font-bold uppercase tracking-wider mb-1">
              <GraduationCap size={16} /> Processo de Admissão Online
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Boletim de Candidatura ACITE</h3>
            <p className="text-blue-100 text-xs mt-1">Ano Académico 2026/2027</p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form Body or Success Screen */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900">Candidatura Submetida com Sucesso!</h4>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                A sua inscrição para o curso <strong>{courseTitle}</strong> foi registada com sucesso na secretaria académica da ACITE. Entraremos em contacto brevemente via telefone/e-mail para os passos seguintes de validação documental.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="btn-gold px-8 py-3 font-bold text-sm shadow-md"
                >
                  Concluir e Fechar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Course selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Curso Pretendido *
                </label>
                <select
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title} ({c.degree})
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Nome Completo do Candidato *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Manuel António da Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Correio Electrónico (E-mail) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="candidato@exemplo.ao"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Contacto Telefónico / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+244 9XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Nº do Bilhete de Identidade / Passaporte
                  </label>
                  <input
                    type="text"
                    placeholder="00XXXXXXXXXLA0XX"
                    value={identityCard}
                    onChange={(e) => setIdentityCard(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Grau Académico Anterior
                  </label>
                  <select
                    value={academicDegree}
                    onChange={(e) => setAcademicDegree(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  >
                    <option value="Licenciatura">Licenciatura / Bacharelato</option>
                    <option value="Mestrado">Mestrado</option>
                    <option value="Ensino Médio">Ensino Médio Concluído</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Instituição Universitária de Graduação Anterior
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Universidade Agostinho Neto, UCAN, etc."
                    value={graduationInst}
                    onChange={(e) => setGraduationInst(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Observações ou Motivação Adicional
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Indique eventuais notas relevantes sobre a sua candidatura..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold px-7 py-3 text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'A submeter candidatura...' : 'Enviar Candidatura'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
