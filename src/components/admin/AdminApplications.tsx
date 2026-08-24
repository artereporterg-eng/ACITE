import { useState, useEffect } from 'react';
import { ApplicationItem } from '../../types';
import { fetchApplications, updateApplicationStatus, deleteApplication } from '../../services/api';
import { UserPlus, Search, Trash2, CheckCircle2, Clock, AlertCircle, Eye, Phone, Mail, FileText, X } from 'lucide-react';

export default function AdminApplications() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchApplications();
      setApplications(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar candidaturas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateApplicationStatus(id, newStatus);
      setSuccessMsg(`Estado actualizado para "${newStatus}"!`);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus as any } : app))
      );
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao actualizar estado.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Eliminar candidatura de "${name}"?`)) return;
    try {
      await deleteApplication(id);
      setSuccessMsg('Candidatura eliminada com sucesso.');
      setApplications((prev) => prev.filter((a) => a.id !== id));
      if (selectedApp?.id === id) setSelectedApp(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao eliminar candidatura.');
    }
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countPending = applications.filter((a) => a.status === 'Pendente').length;
  const countApproved = applications.filter((a) => a.status === 'Aprovado').length;
  const countReviewing = applications.filter((a) => a.status === 'Em Análise').length;
  const countRejected = applications.filter((a) => a.status === 'Rejeitado').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus className="text-acite-blue" size={28} />
          Gestão de Candidaturas & Inscrições Online
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Acompanhe todos os candidatos inscritos através do formulário online no portal público da ACITE.
        </p>
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

      {/* Quick summary badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('Pendente')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Pendente'
              ? 'bg-amber-500 text-white border-amber-600 shadow'
              : 'bg-white text-gray-800 border-gray-200 hover:border-amber-400'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Pendentes</p>
          <p className="text-2xl font-bold mt-1">{countPending}</p>
        </div>
        <div
          onClick={() => setStatusFilter('Em Análise')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Em Análise'
              ? 'bg-blue-600 text-white border-blue-700 shadow'
              : 'bg-white text-gray-800 border-gray-200 hover:border-blue-400'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Em Análise</p>
          <p className="text-2xl font-bold mt-1">{countReviewing}</p>
        </div>
        <div
          onClick={() => setStatusFilter('Aprovado')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Aprovado'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow'
              : 'bg-white text-gray-800 border-gray-200 hover:border-emerald-400'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Aprovados</p>
          <p className="text-2xl font-bold mt-1">{countApproved}</p>
        </div>
        <div
          onClick={() => setStatusFilter('Rejeitado')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Rejeitado'
              ? 'bg-red-600 text-white border-red-700 shadow'
              : 'bg-white text-gray-800 border-gray-200 hover:border-red-400'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Rejeitados</p>
          <p className="text-2xl font-bold mt-1">{countRejected}</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar candidato, curso, telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-acite-blue outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-acite-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas as Candidaturas ({applications.length})
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acite-blue mx-auto mb-2"></div>
            A carregar candidaturas...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UserPlus size={48} className="mx-auto text-gray-300 mb-3" />
            <h4 className="text-base font-bold text-gray-700">Nenhuma candidatura encontrada</h4>
            <p className="text-xs mt-1">Quando os candidatos se inscreverem no site, aparecerão aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                  <th className="py-3.5 px-4">Candidato</th>
                  <th className="py-3.5 px-4">Curso Pretendido</th>
                  <th className="py-3.5 px-4">Contactos</th>
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{app.full_name}</p>
                      <p className="text-xs text-gray-500">{app.academic_degree || 'Licenciatura'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-gray-800">{app.course_title}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      <p>{app.phone}</p>
                      <p className="text-gray-400">{app.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(app.created_at).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-md border outline-none cursor-pointer ${
                          app.status === 'Aprovado'
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : app.status === 'Rejeitado'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : app.status === 'Em Análise'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Em Análise">Em Análise</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Rejeitado">Rejeitado</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-1.5 text-acite-blue hover:bg-blue-50 rounded-md transition-colors"
                        title="Ver Detalhes da Candidatura"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id, app.full_name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-5 bg-acite-blue text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{selectedApp.full_name}</h3>
                <p className="text-xs text-blue-200">{selectedApp.course_title}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Telefone / WhatsApp</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1.5 mt-0.5">
                    <Phone size={14} className="text-acite-gold" /> {selectedApp.phone}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase block">E-mail</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1.5 mt-0.5">
                    <Mail size={14} className="text-acite-gold" /> {selectedApp.email}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Nº de Bilhete / ID</span>
                  <span className="font-medium text-gray-900">{selectedApp.identity_card || 'Não indicado'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Grau Anterior</span>
                  <span className="font-medium text-gray-900">{selectedApp.academic_degree || 'Licenciatura'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Instituição de Origem</span>
                  <span className="font-medium text-gray-900">{selectedApp.graduation_institution || 'Não indicada'}</span>
                </div>
              </div>

              {selectedApp.notes && (
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase block mb-1">Notas / Motivação do Candidato</span>
                  <p className="text-xs bg-gray-50 p-3 rounded-lg text-gray-700 leading-relaxed border border-gray-100">
                    {selectedApp.notes}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">Alterar Estado:</span>
                  <select
                    value={selectedApp.status}
                    onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-acite-blue outline-none"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Análise">Em Análise</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Rejeitado">Rejeitado</option>
                  </select>
                </div>

                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
