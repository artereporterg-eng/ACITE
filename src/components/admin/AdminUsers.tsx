import React, { useState, useEffect } from 'react';
import { 
  fetchUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus 
} from '../../services/api';
import { User, UserCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  GraduationCap, 
  Newspaper, 
  UserCheck, 
  BookOpen, 
  Terminal, 
  Edit3, 
  Trash2, 
  Key, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  X, 
  Building2, 
  Phone, 
  Mail, 
  Lock, 
  Info,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
  'Super Administrador': ShieldCheck,
  'Direcção Académica & Cursos': GraduationCap,
  'Comunicação & Imprensa': Newspaper,
  'Secretaria & Admissões': UserCheck,
  'Docência & Investigação': BookOpen,
  'Técnico de Suporte & TI': Terminal,
};

const CATEGORY_COLORS: Record<string, { badge: string; bg: string; text: string; border: string }> = {
  'Super Administrador': {
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200'
  },
  'Direcção Académica & Cursos': {
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  'Comunicação & Imprensa': {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  'Secretaria & Admissões': {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  'Docência & Investigação': {
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200'
  },
  'Técnico de Suporte & TI': {
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200'
  },
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  const [showMatrix, setShowMatrix] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    category: 'Direcção Académica & Cursos',
    department: 'Gabinete de Pós-Graduação e Ensino',
    phone: '',
    role: 'academico',
    status: 'Ativo' as 'Ativo' | 'Inativo',
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchUsers({
        category: selectedCategory !== 'Todos' ? selectedCategory : undefined,
        status: selectedStatus !== 'Todos' ? selectedStatus : undefined,
        search: searchTerm.trim() || undefined,
      });
      setUsers(res.users || []);
      setCategoryStats(res.categoryStats || {});
      if (res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Falha ao carregar utilizadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      category: 'Direcção Académica & Cursos',
      department: 'Gabinete de Pós-Graduação e Ensino',
      phone: '',
      role: 'academico',
      status: 'Ativo',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (targetUser: User) => {
    setEditingUser(targetUser);
    setFormData({
      name: targetUser.name,
      username: targetUser.username,
      email: targetUser.email || '',
      password: '',
      category: targetUser.category || 'Super Administrador',
      department: targetUser.department || 'Direcção Geral',
      phone: targetUser.phone || '',
      role: targetUser.role || 'admin',
      status: targetUser.status || 'Ativo',
    });
    setIsModalOpen(true);
  };

  const handleCategoryChange = (categoryName: string) => {
    const found = categories.find(c => c.name === categoryName);
    setFormData(prev => ({
      ...prev,
      category: categoryName,
      role: found?.role || prev.role,
      department: found?.defaultDepartment || prev.department,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        // Update user
        const res = await updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          category: formData.category,
          department: formData.department,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
          new_password: formData.password ? formData.password : undefined,
        });
        showAlert('success', res.message || 'Utilizador actualizado com sucesso!');
      } else {
        // Create user
        const res = await createUser({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          category: formData.category,
          department: formData.department,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
        });
        showAlert('success', res.message || 'Novo utilizador adicionado com sucesso!');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      showAlert('error', err.message || 'Erro ao guardar dados do utilizador');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    if (targetUser.username === 'admin') {
      showAlert('error', 'A conta principal de administrador não pode ser desactivada.');
      return;
    }
    if (targetUser.id === currentUser?.id) {
      showAlert('error', 'Não pode desactivar a sua própria conta em sessão.');
      return;
    }

    try {
      const res = await toggleUserStatus(targetUser.id);
      showAlert('success', res.message);
      loadUsers();
    } catch (err: any) {
      showAlert('error', err.message || 'Falha ao alterar estado do utilizador');
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (targetUser.username === 'admin' || targetUser.id === 1) {
      showAlert('error', 'A conta principal de administração (admin) é protegida e não pode ser eliminada.');
      return;
    }
    if (targetUser.id === currentUser?.id) {
      showAlert('error', 'Não pode eliminar a sua própria conta em sessão.');
      return;
    }

    if (!window.confirm(`Tem a certeza de que deseja eliminar o utilizador "${targetUser.name}" (${targetUser.username})? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const res = await deleteUser(targetUser.id);
      showAlert('success', res.message);
      loadUsers();
    } catch (err: any) {
      showAlert('error', err.message || 'Falha ao eliminar utilizador');
    }
  };

  const handleOpenPasswordModal = (targetUser: User) => {
    setPasswordTargetUser(targetUser);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleQuickPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser || !newPassword) return;
    if (newPassword.length < 4) {
      showAlert('error', 'A nova palavra-passe deve ter pelo menos 4 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateUser(passwordTargetUser.id, {
        new_password: newPassword,
      });
      showAlert('success', `Palavra-passe de ${passwordTargetUser.name} alterada com sucesso!`);
      setIsPasswordModalOpen(false);
    } catch (err: any) {
      showAlert('error', err.message || 'Erro ao alterar palavra-passe');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Alert Notification */}
      {alert && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border shadow-sm ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="p-1 hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Gestão de Utilizadores & Categorias
              </h1>
              <p className="text-sm text-gray-500">
                Adicione múltiplos utilizadores ao backend e separe as equipas por categorias departamentais
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowMatrix(!showMatrix)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <Info size={15} />
            <span>{showMatrix ? 'Ocultar Guia de Categorias' : 'Guia de Categorias'}</span>
          </button>

          <button
            onClick={loadUsers}
            title="Recarregar dados"
            className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-acite-blue hover:bg-[#002244] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <UserPlus size={16} />
            <span>Criar Novo Utilizador</span>
          </button>
        </div>
      </div>

      {/* Categorized Statistics Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.name] || ShieldCheck;
          const styling = CATEGORY_COLORS[cat.name] || {
            badge: 'bg-gray-100 text-gray-800',
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-200'
          };
          const count = categoryStats[cat.name] || 0;
          const isSelected = selectedCategory === cat.name;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? 'Todos' : cat.name)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'ring-2 ring-acite-blue border-acite-blue bg-blue-50/50 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${styling.bg} ${styling.text} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
                <span className="text-lg font-bold text-gray-900">{count}</span>
              </div>
              <p className="text-xs font-semibold text-gray-800 line-clamp-1">{cat.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{cat.role}</p>
            </button>
          );
        })}
      </div>

      {/* Category Matrix Reference Guide */}
      {showMatrix && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-acite-gold font-bold text-sm">
              <Sparkles size={16} />
              <span>Organograma de Categorias & Atribuições no Portal ACITE</span>
            </div>
            <button onClick={() => setShowMatrix(false)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || ShieldCheck;
              return (
                <div key={cat.id} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Icon size={16} className="text-acite-gold" />
                    <span>{cat.name}</span>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">{cat.description}</p>
                  <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Gabinete sugerido:</span>
                    <span className="text-acite-gold/90 font-medium">{cat.defaultDepartment}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filtrar por categoria"
              className="text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3.5 py-2.5 pr-8 focus:ring-2 focus:ring-acite-blue focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todas as Categorias ({categoryStats.total || 0})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({categoryStats[c.name] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filtrar por estado"
              className="text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3.5 py-2.5 pr-8 focus:ring-2 focus:ring-acite-blue focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos os Estados</option>
              <option value="Ativo">Apenas Ativos ({categoryStats.active || 0})</option>
              <option value="Inativo">Apenas Inativos ({categoryStats.inactive || 0})</option>
            </select>
          </div>

          {(selectedCategory !== 'Todos' || selectedStatus !== 'Todos' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory('Todos');
                setSelectedStatus('Todos');
                setSearchTerm('');
              }}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Pesquisar por nome, utilizador, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-acite-blue focus:outline-none"
          />
          <Search size={15} className="absolute left-3 top-3 text-gray-400" />
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <RefreshCw size={28} className="animate-spin text-acite-blue mb-2" />
            <p className="text-xs">A carregar utilizadores e categorias...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-gray-800 mb-1">Nenhum utilizador encontrado</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
              Não existem utilizadores correspondentes aos critérios de pesquisa ou categoria selecionada.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 bg-acite-blue text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#002244]"
            >
              <UserPlus size={14} />
              <span>Adicionar Primeiro Utilizador</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Utilizador & Nome</th>
                  <th className="py-3.5 px-4">Categoria / Função</th>
                  <th className="py-3.5 px-4">Departamento / Gabinete</th>
                  <th className="py-3.5 px-4">Contactos</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {users.map((u) => {
                  const Icon = CATEGORY_ICONS[u.category] || ShieldCheck;
                  const styling = CATEGORY_COLORS[u.category] || {
                    badge: 'bg-gray-100 text-gray-800 border-gray-200',
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                    border: 'border-gray-200'
                  };
                  const isMainAdmin = u.username === 'admin' || u.id === 1;
                  const isCurrent = u.id === currentUser?.id;

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/75 transition-colors">
                      {/* Name & Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${styling.bg} ${styling.text} font-bold flex items-center justify-center text-xs shrink-0 border ${styling.border}`}>
                            {u.name ? u.name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-900">{u.name}</span>
                              {isCurrent && (
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                  Você
                                </span>
                              )}
                              {isMainAdmin && (
                                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                  Principal
                                </span>
                              )}
                            </div>
                            <span className="text-gray-400 font-mono text-[11px]">@{u.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold tracking-tight shadow-2xs whitespace-nowrap"
                          style={{ borderColor: 'inherit' }}
                        >
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border font-medium ${styling.badge}`}>
                            <Icon size={13} />
                            <span>{u.category}</span>
                          </span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Building2 size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate max-w-[200px]" title={u.department}>
                            {u.department || 'Direcção Geral'}
                          </span>
                        </div>
                      </td>

                      {/* Contact details */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {u.email ? (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Mail size={12} className="text-gray-400" />
                              <span className="truncate max-w-[180px]">{u.email}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300 italic text-[11px]">Sem e-mail</span>
                          )}
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                              <Phone size={11} className="text-gray-400" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isMainAdmin || isCurrent}
                          title={
                            isMainAdmin 
                              ? 'Conta principal de administrador não pode ser desactivada' 
                              : isCurrent 
                              ? 'Não pode desactivar a sua própria conta' 
                              : 'Clique para alternar estado'
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            u.status === 'Ativo'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } ${isMainAdmin || isCurrent ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Ativo' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          <span>{u.status}</span>
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPasswordModal(u)}
                            title="Alterar Palavra-passe"
                            className="p-1.5 text-gray-500 hover:text-acite-blue hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Key size={15} />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Editar Utilizador"
                            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit3 size={15} />
                          </button>

                          {!isMainAdmin && !isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="Eliminar Utilizador"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-acite-blue/10 text-acite-blue flex items-center justify-center">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingUser ? `Editar Utilizador: ${editingUser.name}` : 'Criar Novo Utilizador'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Defina os dados de acesso e a categoria departamental de funções
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              {/* Category Selector with live visual cards */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Categoria de Utilizador <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = formData.category === cat.name;
                    const Icon = CATEGORY_ICONS[cat.name] || ShieldCheck;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.name)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-acite-blue/5 border-acite-blue ring-1 ring-acite-blue'
                            : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-acite-blue text-white' : 'bg-gray-200 text-gray-700'}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 line-clamp-1">{cat.name}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{cat.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Dr. António dos Santos"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-acite-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome de Utilizador (Login) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    placeholder="ex: asantos"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-acite-blue focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {editingUser && (
                    <span className="text-[10px] text-gray-400 mt-0.5 block">O username não pode ser alterado após criação.</span>
                  )}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Endereço de E-mail Institucional
                  </label>
                  <input
                    type="email"
                    placeholder="ex: asantos@acite.ao"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-acite-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="ex: +244 923 456 789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-acite-blue focus:outline-none"
                  />
                </div>
              </div>

              {/* Department / Organograma */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Departamento / Gabinete Institucional
                </label>
                <input
                  type="text"
                  placeholder="ex: Gabinete de Pós-Graduação e Ensino"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-acite-blue focus:outline-none"
                />
              </div>

              {/* Password & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {editingUser ? 'Nova Palavra-passe (Opcional)' : 'Palavra-passe Inicial *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    placeholder={editingUser ? 'Deixe em branco para manter a actual' : 'Mínimo 4 caracteres'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-acite-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Estado da Conta
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Ativo' | 'Inativo' })}
                    disabled={editingUser?.username === 'admin'}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-acite-blue focus:outline-none bg-white"
                  >
                    <option value="Ativo">Ativo (Acesso Liberado)</option>
                    <option value="Inativo">Inativo (Acesso Suspenso)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-acite-blue text-white hover:bg-[#002244] rounded-xl transition-colors flex items-center gap-2"
                >
                  {submitting && <RefreshCw size={14} className="animate-spin" />}
                  <span>{editingUser ? 'Salvar Alterações' : 'Criar Utilizador'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && passwordTargetUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Alterar Palavra-passe</h3>
                  <p className="text-xs text-gray-500">Para: {passwordTargetUser.name} (@{passwordTargetUser.username})</p>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickPasswordSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nova Palavra-passe
                </label>
                <input
                  type="password"
                  required
                  placeholder="Introduza a nova senha (mínimo 4 caracteres)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-acite-blue focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw size={13} className="animate-spin" />}
                  <span>Redefinir Palavra-passe</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
