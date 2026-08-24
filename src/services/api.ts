import { 
  FullContentPayload, 
  Course, 
  NewsItem, 
  EventItem, 
  PublicationItem, 
  HeroSlide, 
  FeatureItem, 
  SiteSettings, 
  ApplicationItem, 
  InstitutionalPage, 
  User,
  UserCategory,
  UserListResponse
} from '../types';

const API_BASE = '';

function getAuthHeader() {
  const token = localStorage.getItem('acite_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 1. PUBLIC APIS
export async function fetchPublicContent(): Promise<FullContentPayload> {
  const res = await fetch(`${API_BASE}/api/public/content`);
  if (!res.ok) throw new Error('Falha ao carregar conteúdos do portal');
  return res.json();
}

export const fetchInitialData = fetchPublicContent;

export async function submitApplication(data: Partial<ApplicationItem>): Promise<{ success: boolean; message: string; application_id?: number }> {
  const res = await fetch(`${API_BASE}/api/public/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Falha ao submeter candidatura');
  return json;
}

// 2. AUTH APIS
export async function apiLogin(username: string, password: string): Promise<{ success: boolean; token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao efectuar login');
  return json;
}

export async function apiGetMe(): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Sessão inválida');
  return json;
}

export async function apiLogout(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
  localStorage.removeItem('acite_token');
}

export async function apiUpdateProfile(data: {
  name?: string;
  email?: string;
  username?: string;
  current_password?: string;
  new_password?: string;
}): Promise<{ success: boolean; message: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Falha ao actualizar perfil');
  return json;
}

// 3. ADMIN CMS APIS
export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/api/admin/stats`, {
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao carregar estatísticas');
  return json;
}

export async function updateSiteSettings(settings: Record<string, string>) {
  const res = await fetch(`${API_BASE}/api/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(settings),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao guardar definições');
  return json;
}

// Courses
export async function saveCourse(course: Partial<Course>) {
  const isEdit = !!course.id;
  const url = isEdit ? `${API_BASE}/api/admin/courses/${course.id}` : `${API_BASE}/api/admin/courses`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(course),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao guardar curso');
  return json;
}

export async function deleteCourse(id: number) {
  const res = await fetch(`${API_BASE}/api/admin/courses/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao eliminar curso');
  return json;
}

// News
export async function saveNews(news: Partial<NewsItem>) {
  const isEdit = !!news.id;
  const url = isEdit ? `${API_BASE}/api/admin/news/${news.id}` : `${API_BASE}/api/admin/news`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(news),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao guardar notícia');
  return json;
}

export async function deleteNews(id: number) {
  const res = await fetch(`${API_BASE}/api/admin/news/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao eliminar notícia');
  return json;
}

// Events
export async function saveEvent(event: Partial<EventItem>) {
  const isEdit = !!event.id;
  const url = isEdit ? `${API_BASE}/api/admin/events/${event.id}` : `${API_BASE}/api/admin/events`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(event),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao guardar evento');
  return json;
}

export async function deleteEvent(id: number) {
  const res = await fetch(`${API_BASE}/api/admin/events/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao eliminar evento');
  return json;
}

// Publications
export async function savePublication(pub: Partial<PublicationItem>) {
  const isEdit = !!pub.id;
  const url = isEdit ? `${API_BASE}/api/admin/publications/${pub.id}` : `${API_BASE}/api/admin/publications`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(pub),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao guardar publicação');
  return json;
}

export async function deletePublication(id: number) {
  const res = await fetch(`${API_BASE}/api/admin/publications/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao eliminar publicação');
  return json;
}

// Hero Slides
export async function saveHeroSlide(slide: Partial<HeroSlide>) {
  const isEdit = !!slide.id;
  const url = isEdit ? `${API_BASE}/api/admin/hero/${slide.id}` : `${API_BASE}/api/admin/hero`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(slide),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao guardar slide');
  return json;
}

export async function deleteHeroSlide(id: number) {
  const res = await fetch(`${API_BASE}/api/admin/hero/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao eliminar slide');
  return json;
}

// Features
export async function saveFeature(feat: Partial<FeatureItem>) {
  const isEdit = !!feat.id;
  const url = isEdit ? `${API_BASE}/api/admin/features/${feat.id}` : `${API_BASE}/api/admin/features`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(feat),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao guardar item');
  return json;
}

export async function deleteFeature(id: number) {
  const res = await fetch(`${API_BASE}/api/admin/features/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao eliminar item');
  return json;
}

// Applications
export async function fetchApplications(): Promise<ApplicationItem[]> {
  const res = await fetch(`${API_BASE}/api/admin/applications`, {
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao carregar candidaturas');
  return json;
}

export async function updateApplicationStatus(id: number, status: string) {
  const res = await fetch(`${API_BASE}/api/admin/applications/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao actualizar estado');
  return json;
}

export async function deleteApplication(id: number) {
  const res = await fetch(`${API_BASE}/api/admin/applications/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao eliminar candidatura');
  return json;
}

// Pages
export async function savePage(page: Partial<InstitutionalPage>) {
  const res = await fetch(`${API_BASE}/api/admin/pages/${page.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(page),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao guardar página');
  return json;
}

// Media upload
export async function uploadMediaFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/admin/upload`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao carregar ficheiro');
  return json;
}

export async function fetchMediaLibrary() {
  const res = await fetch(`${API_BASE}/api/admin/media`, {
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao carregar galeria');
  return json;
}

export async function deleteMediaFile(id: number) {
  const res = await fetch(`${API_BASE}/api/admin/media/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao eliminar ficheiro');
  return json;
}

// 4. DATABASE AUTO-UPDATE & SYSTEM TOOLS
export async function fetchDatabaseDiagnostics() {
  const res = await fetch(`${API_BASE}/api/admin/database/status`, {
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Falha ao carregar estado da base de dados');
  return json;
}

export async function triggerDatabaseMigration() {
  const res = await fetch(`${API_BASE}/api/admin/database/migrate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Falha ao executar auto-actualização da base de dados');
  return json;
}

export async function optimizeDatabase() {
  const res = await fetch(`${API_BASE}/api/admin/database/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Falha ao optimizar base de dados');
  return json;
}

export async function executeCustomSchema(sql: string) {
  const res = await fetch(`${API_BASE}/api/admin/database/custom-schema`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ sql }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao executar instrução SQL');
  return json;
}

export function getDatabaseBackupUrl(): string {
  const token = localStorage.getItem('acite_token');
  return `${API_BASE}/api/admin/database/backup${token ? `?token=${token}` : ''}`;
}

// 5. USER & CATEGORY MANAGEMENT
export async function fetchUsers(params?: { category?: string; status?: string; search?: string }): Promise<UserListResponse> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.status) query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`${API_BASE}/api/admin/users${qs}`, {
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Falha ao carregar lista de utilizadores');
  return json;
}

export async function fetchUserCategories(): Promise<{ categories: UserCategory[] }> {
  const res = await fetch(`${API_BASE}/api/admin/users/categories`, {
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Falha ao carregar categorias de utilizadores');
  return json;
}

export async function createUser(userData: {
  username: string;
  password?: string;
  name: string;
  email?: string;
  role?: string;
  category: string;
  department?: string;
  phone?: string;
  status?: string;
}): Promise<{ success: boolean; message: string; user: User; id: number }> {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(userData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Falha ao criar utilizador');
  return json;
}

export async function updateUser(id: number, userData: Partial<User> & { new_password?: string }): Promise<{ success: boolean; message: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(userData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Falha ao actualizar utilizador');
  return json;
}

export async function toggleUserStatus(id: number): Promise<{ success: boolean; status: 'Ativo' | 'Inativo'; message: string }> {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}/toggle-status`, {
    method: 'PATCH',
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Falha ao alterar estado do utilizador');
  return json;
}

export async function deleteUser(id: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Falha ao eliminar utilizador');
  return json;
}


