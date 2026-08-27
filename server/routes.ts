import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db, getDatabaseDiagnostics } from './db.js';
import { authMiddleware, AuthRequest, generateToken, hashPassword, comparePassword } from './auth.js';

const router = Router();

// Configure Multer for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
    } catch {
      // ignore
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'acite-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas ficheiros de imagem e PDF são permitidos.'));
    }
  },
});

// ==========================================
// 1. AUTHENTICATION & MULTI-USER MANAGEMENT
// ==========================================

export const USER_CATEGORIES = [
  {
    id: 'superadmin',
    name: 'Super Administrador',
    role: 'superadmin',
    defaultDepartment: 'Direcção Geral & Reitoria',
    description: 'Acesso irrestrito a todos os módulos, utilizadores, base de dados e definições.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'academico',
    name: 'Direcção Académica & Cursos',
    role: 'academico',
    defaultDepartment: 'Gabinete de Pós-Graduação e Ensino',
    description: 'Gestão de programas de pós-graduação, mestrados, doutoramentos e planos curriculares.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'comunicacao',
    name: 'Comunicação & Imprensa',
    role: 'comunicacao',
    defaultDepartment: 'Gabinete de Relações Públicas e Imprensa',
    description: 'Publicação de notícias, comunicados institucionais, eventos e banners da página inicial.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'admissoes',
    name: 'Secretaria & Admissões',
    role: 'admissoes',
    defaultDepartment: 'Secretaria Académica e Admissões',
    description: 'Triagem, validação e gestão do estado de candidaturas e mensagens de contacto.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'investigacao',
    name: 'Docência & Investigação',
    role: 'investigacao',
    defaultDepartment: 'Conselho Científico e Centro de Estudos',
    description: 'Gestão de publicações científicas, obras publicadas, livros e artigos académicos.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    id: 'suporte',
    name: 'Técnico de Suporte & TI',
    role: 'suporte',
    defaultDepartment: 'Gabinete de Tecnologias de Informação',
    description: 'Manutenção do sistema, biblioteca de mídia, diagnósticos e base de dados.',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
];

// Login
router.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Introduza o nome de utilizador e a palavra-passe.' });
      return;
    }

    const cleanUsername = username.trim();
    const user = await db.get('SELECT * FROM users WHERE username = ?', [cleanUsername]);

    if (!user) {
      res.status(401).json({ error: 'Credenciais incorrectas. Verifique o utilizador ou a senha.' });
      return;
    }

    if (user.status && user.status === 'Inativo') {
      res.status(403).json({ error: 'Esta conta de utilizador encontra-se desactivada. Contacte a Direcção Geral.' });
      return;
    }

    const isMatch = comparePassword(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Credenciais incorrectas. Verifique a palavra-passe.' });
      return;
    }

    // Update last login timestamp
    try {
      await db.run('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    } catch {
      // ignore
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email || '',
      role: user.role || 'admin',
      category: user.category || 'Super Administrador',
      department: user.department || 'Direcção Geral',
    });

    res.cookie('acite_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role || 'admin',
        category: user.category || 'Super Administrador',
        department: user.department || 'Direcção Geral',
        phone: user.phone || '',
        status: user.status || 'Ativo',
        avatar_url: user.avatar_url || '',
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao processar login.' });
  }
});

// Current User info
router.get('/api/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Logout
router.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('acite_token');
  res.json({ success: true, message: 'Sessão terminada com sucesso.' });
});

// Update Profile & Change Admin Password
router.put('/api/auth/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, email, username, phone, department, current_password, new_password } = req.body;

    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      res.status(404).json({ error: 'Utilizador não encontrado.' });
      return;
    }

    if (new_password) {
      if (!current_password) {
        res.status(400).json({ error: 'Para alterar a senha, deve introduzir a senha actual.' });
        return;
      }
      if (!comparePassword(current_password, user.password_hash)) {
        res.status(400).json({ error: 'A senha actual está incorrecta.' });
        return;
      }
      if (new_password.length < 3) {
        res.status(400).json({ error: 'A nova senha deve ter pelo menos 3 caracteres.' });
        return;
      }

      const newHash = hashPassword(new_password);
      await db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newHash, userId]);
    }

    if (username && username !== user.username) {
      const existing = await db.get('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
      if (existing) {
        res.status(400).json({ error: 'Este nome de utilizador já está a ser utilizado por outra conta.' });
        return;
      }
    }

    await db.run(
      `UPDATE users 
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           username = COALESCE(?, username),
           phone = COALESCE(?, phone),
           department = COALESCE(?, department),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name || user.name, 
        email || user.email, 
        username || user.username,
        phone !== undefined ? phone : user.phone,
        department !== undefined ? department : user.department,
        userId
      ]
    );

    const updatedUser = await db.get(
      'SELECT id, username, name, email, role, category, department, phone, status, avatar_url FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Perfil e dados actualizados com sucesso!',
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao actualizar perfil.' });
  }
});

// Categories metadata endpoint
router.get('/api/admin/users/categories', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ categories: USER_CATEGORIES });
});

// Get all users
router.get('/api/admin/users', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, status } = req.query;

    let query = 'SELECT id, username, name, email, role, category, department, phone, status, avatar_url, last_login_at, created_at, updated_at FROM users WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'Todos') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (status && status !== 'Todos') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (name LIKE ? OR username LIKE ? OR email LIKE ? OR department LIKE ?)';
      params.push(term, term, term, term);
    }

    query += ' ORDER BY id ASC';

    const users = await db.all(query, params);
    const allUsers = await db.all('SELECT category, status FROM users');

    const categoryStats: Record<string, number> = {
      total: allUsers.length,
      active: allUsers.filter(u => (u.status || 'Ativo') === 'Ativo').length,
      inactive: allUsers.filter(u => u.status === 'Inativo').length,
    };

    USER_CATEGORIES.forEach(cat => {
      categoryStats[cat.name] = allUsers.filter(u => (u.category || 'Super Administrador') === cat.name).length;
    });

    res.json({
      users: users.map(u => ({
        ...u,
        category: u.category || 'Super Administrador',
        department: u.department || 'Direcção Geral',
        status: u.status || 'Ativo',
      })),
      categoryStats,
      categories: USER_CATEGORIES,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao listar utilizadores.' });
  }
});

// Create user
router.post('/api/admin/users', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { username, password, name, email, role, category, department, phone, status } = req.body;

    if (!username || !password || !name) {
      res.status(400).json({ error: 'Nome completo, nome de utilizador e palavra-passe são obrigatórios.' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await db.get('SELECT id FROM users WHERE username = ?', [cleanUsername]);
    if (existing) {
      res.status(400).json({ error: 'O nome de utilizador já está em uso.' });
      return;
    }

    if (email) {
      const existingEmail = await db.get('SELECT id FROM users WHERE email = ?', [email.trim()]);
      if (existingEmail) {
        res.status(400).json({ error: 'O endereço de e-mail já está associado a outra conta.' });
        return;
      }
    }

    const matchedCategory = USER_CATEGORIES.find(c => c.name === category || c.id === role);
    const finalCategory = category || matchedCategory?.name || 'Super Administrador';
    const finalRole = role || matchedCategory?.role || 'admin';
    const finalDepartment = department || matchedCategory?.defaultDepartment || 'Direcção Geral';
    const finalStatus = status || 'Ativo';

    const hash = hashPassword(password);
    const result = await db.run(
      `INSERT INTO users (username, password_hash, name, email, role, category, department, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanUsername, 
        hash, 
        name.trim(), 
        email ? email.trim() : '', 
        finalRole, 
        finalCategory, 
        finalDepartment, 
        phone ? phone.trim() : '', 
        finalStatus
      ]
    );

    const newUser = await db.get('SELECT id, username, name, email, role, category, department, phone, status, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({ 
      success: true, 
      id: result.lastInsertRowid, 
      message: `Utilizador ${name} adicionado com sucesso na categoria "${finalCategory}"!`,
      user: newUser
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao criar utilizador.' });
  }
});

// Update user
router.put('/api/admin/users/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    const { name, email, role, category, department, phone, status, new_password } = req.body;

    const user = await db.get('SELECT * FROM users WHERE id = ?', [targetId]);
    if (!user) {
      res.status(404).json({ error: 'Utilizador não encontrado.' });
      return;
    }

    if (user.username === 'admin' && status === 'Inativo') {
      res.status(400).json({ error: 'Não é permitido desactivar a conta principal de administração (admin).' });
      return;
    }

    if (new_password) {
      if (new_password.length < 3) {
        res.status(400).json({ error: 'A nova palavra-passe deve ter pelo menos 3 caracteres.' });
        return;
      }
      const newHash = hashPassword(new_password);
      await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, targetId]);
    }

    if (email && email !== user.email) {
      const existingEmail = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, targetId]);
      if (existingEmail) {
        res.status(400).json({ error: 'O endereço de e-mail já está associado a outra conta.' });
        return;
      }
    }

    const matchedCategory = USER_CATEGORIES.find(c => c.name === category || c.id === role);
    const finalCategory = category !== undefined ? category : (user.category || 'Super Administrador');
    const finalRole = role !== undefined ? role : (matchedCategory?.role || user.role || 'admin');
    const finalDepartment = department !== undefined ? department : (user.department || 'Direcção Geral');
    const finalStatus = status !== undefined ? status : (user.status || 'Ativo');

    await db.run(
      `UPDATE users 
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           role = ?,
           category = ?,
           department = ?,
           phone = COALESCE(?, phone),
           status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name || user.name,
        email !== undefined ? email : user.email,
        finalRole,
        finalCategory,
        finalDepartment,
        phone !== undefined ? phone : user.phone,
        finalStatus,
        targetId
      ]
    );

    const updated = await db.get('SELECT id, username, name, email, role, category, department, phone, status, updated_at FROM users WHERE id = ?', [targetId]);

    res.json({
      success: true,
      message: 'Utilizador actualizado com sucesso!',
      user: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao actualizar utilizador.' });
  }
});

// Toggle status
router.patch('/api/admin/users/:id/toggle-status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    const user = await db.get('SELECT id, username, status FROM users WHERE id = ?', [targetId]);
    
    if (!user) {
      res.status(404).json({ error: 'Utilizador não encontrado.' });
      return;
    }

    if (user.username === 'admin') {
      res.status(400).json({ error: 'A conta principal de administrador não pode ser desactivada.' });
      return;
    }

    if (user.id === req.user!.id) {
      res.status(400).json({ error: 'Não pode desactivar a sua própria conta actualmente em sessão.' });
      return;
    }

    const nextStatus = user.status === 'Inativo' ? 'Ativo' : 'Inativo';
    await db.run('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nextStatus, targetId]);

    res.json({
      success: true,
      status: nextStatus,
      message: `Conta de utilizador "${user.username}" alterada para ${nextStatus}.`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao alterar estado do utilizador.' });
  }
});

// Delete user
router.delete('/api/admin/users/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    const user = await db.get('SELECT id, username, name FROM users WHERE id = ?', [targetId]);

    if (!user) {
      res.status(404).json({ error: 'Utilizador não encontrado.' });
      return;
    }

    if (user.username === 'admin' || targetId === 1) {
      res.status(400).json({ error: 'A conta principal de administração (admin) é protegida e não pode ser eliminada.' });
      return;
    }

    if (targetId === req.user!.id) {
      res.status(400).json({ error: 'Não pode eliminar a sua própria conta em sessão.' });
      return;
    }

    await db.run('DELETE FROM users WHERE id = ?', [targetId]);

    res.json({ success: true, message: `Utilizador "${user.name}" eliminado com sucesso.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao eliminar utilizador.' });
  }
});

// ==========================================
// 2. PUBLIC API ROUTES
// ==========================================

router.get('/api/public/content', async (req: Request, res: Response) => {
  try {
    const settingsRows = await db.all('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = {};
    settingsRows.forEach((r: any) => {
      settings[r.key] = r.value;
    });

    const heroSlides = await db.all('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY order_index ASC');
    const courses = await db.all('SELECT * FROM courses WHERE is_active = 1 ORDER BY featured DESC, id ASC');
    const news = await db.all('SELECT * FROM news WHERE is_published = 1 ORDER BY published_at DESC LIMIT 6');
    const events = await db.all('SELECT * FROM events WHERE is_active = 1 ORDER BY event_date ASC LIMIT 6');
    const publications = await db.all('SELECT * FROM publications ORDER BY year DESC, id DESC LIMIT 6');
    const features = await db.all('SELECT * FROM features ORDER BY order_index ASC, id ASC');
    const pages = await db.all('SELECT id, slug, title, content, meta_description FROM pages');

    res.json({
      settings,
      heroSlides,
      courses,
      news,
      events,
      publications,
      features,
      pages,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao carregar dados da ACITE.' });
  }
});

// Public Course list & details
router.get('/api/public/courses', async (req: Request, res: Response) => {
  try {
    const courses = await db.all('SELECT * FROM courses WHERE is_active = 1 ORDER BY featured DESC, id ASC');
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/public/courses/:slug', async (req: Request, res: Response) => {
  try {
    const course = await db.get('SELECT * FROM courses WHERE slug = ? OR id = ?', [req.params.slug, req.params.slug]);
    if (!course) {
      res.status(404).json({ error: 'Curso não encontrado.' });
      return;
    }
    res.json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public News
router.get('/api/public/news', async (req: Request, res: Response) => {
  try {
    const articles = await db.all('SELECT * FROM news WHERE is_published = 1 ORDER BY published_at DESC');
    res.json(articles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/public/news/:slug', async (req: Request, res: Response) => {
  try {
    const article = await db.get('SELECT * FROM news WHERE slug = ? OR id = ?', [req.params.slug, req.params.slug]);
    if (!article) {
      res.status(404).json({ error: 'Notícia não encontrada.' });
      return;
    }
    try {
      await db.run('UPDATE news SET views = views + 1 WHERE id = ?', [article.id]);
    } catch {}
    res.json(article);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public Events
router.get('/api/public/events', async (req: Request, res: Response) => {
  try {
    const events = await db.all('SELECT * FROM events WHERE is_active = 1 ORDER BY event_date ASC');
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public Publications
router.get('/api/public/publications', async (req: Request, res: Response) => {
  try {
    const pubs = await db.all('SELECT * FROM publications ORDER BY year DESC, id DESC');
    res.json(pubs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public Application submission
router.post('/api/public/applications', async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      email,
      phone,
      identity_card,
      course_id,
      course_title,
      academic_degree,
      graduation_institution,
      notes,
    } = req.body;

    if (!full_name || !email || !phone || !course_title) {
      res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios (Nome, Email, Telefone e Curso).' });
      return;
    }

    const result = await db.run(
      `INSERT INTO applications (
        full_name, email, phone, identity_card, course_id, 
        course_title, academic_degree, graduation_institution, notes, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendente')`,
      [
        full_name.trim(),
        email.trim(),
        phone.trim(),
        identity_card || '',
        course_id || null,
        course_title,
        academic_degree || 'Licenciatura',
        graduation_institution || '',
        notes || ''
      ]
    );

    res.json({
      success: true,
      application_id: result.lastInsertRowid,
      message: 'Candidatura submetida com sucesso! A nossa comissão académica entrará em contacto brevemente.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao submeter candidatura.' });
  }
});

// Public Contact message
router.post('/api/public/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
      return;
    }
    const result = await db.run(
      `INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), phone || '', subject.trim(), message.trim()]
    );
    res.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Mensagem enviada com sucesso! Responderemos o mais brevemente possível.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public Newsletter
router.post('/api/public/newsletter', async (req: Request, res: Response) => {
  try {
    const { email, full_name } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email é obrigatório.' });
      return;
    }
    await db.run(
      `INSERT INTO newsletter_subscribers (email, full_name) VALUES (?, ?)`,
      [email.trim().toLowerCase(), full_name || '']
    );
    res.json({ success: true, message: 'Subscrição da newsletter efectuada com sucesso!' });
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE')) {
      res.json({ success: true, message: 'O seu e-mail já se encontra subscrito na nossa newsletter.' });
      return;
    }
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. ADMIN CMS ROUTES
// ==========================================

// Dashboard Stats & Analytics
router.get('/api/admin/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const totalCourses = await db.get('SELECT COUNT(*) as c FROM courses');
    const totalNews = await db.get('SELECT COUNT(*) as c FROM news');
    const totalEvents = await db.get('SELECT COUNT(*) as c FROM events');
    const totalPublications = await db.get('SELECT COUNT(*) as c FROM publications');
    const totalApplications = await db.get('SELECT COUNT(*) as c FROM applications');
    const pendingApplications = await db.get("SELECT COUNT(*) as c FROM applications WHERE status = 'Pendente'");
    const totalUsers = await db.get('SELECT COUNT(*) as c FROM users');

    const recentApplications = await db.all('SELECT * FROM applications ORDER BY created_at DESC LIMIT 5');
    const recentNews = await db.all('SELECT id, title, published_at, views, is_published FROM news ORDER BY created_at DESC LIMIT 5');

    res.json({
      stats: {
        courses: totalCourses?.c || 0,
        news: totalNews?.c || 0,
        events: totalEvents?.c || 0,
        publications: totalPublications?.c || 0,
        applications: totalApplications?.c || 0,
        pendingApplications: pendingApplications?.c || 0,
        users: totalUsers?.c || 0,
      },
      recentApplications,
      recentNews,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Site Settings (GET, PUT)
router.get('/api/admin/settings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const rows = await db.all('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = {};
    rows.forEach((r: any) => (settings[r.key] = r.value));
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/admin/settings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      const existing = await db.get('SELECT key FROM site_settings WHERE key = ?', [key]);
      if (existing) {
        await db.run('UPDATE site_settings SET value = ? WHERE key = ?', [String(value), key]);
      } else {
        await db.run('INSERT INTO site_settings (key, value) VALUES (?, ?)', [key, String(value)]);
      }
    }
    res.json({ success: true, message: 'Definições do portal actualizadas com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Hero Slides CRUD
router.get('/api/admin/hero', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const slides = await db.all('SELECT * FROM hero_slides ORDER BY order_index ASC, id ASC');
    res.json(slides);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/admin/hero', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index, is_active } = req.body;
    const result = await db.run(
      `INSERT INTO hero_slides (badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index || 0, is_active ?? 1]
    );
    res.json({ success: true, id: result.lastInsertRowid, message: 'Slide adicionado com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/admin/hero/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index, is_active } = req.body;
    await db.run(
      `UPDATE hero_slides SET
        badge = ?, title = ?, subtitle = ?, image_url = ?, primary_btn_text = ?, 
        primary_btn_link = ?, secondary_btn_text = ?, secondary_btn_link = ?, 
        order_index = ?, is_active = ?
      WHERE id = ?`,
      [badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index, is_active, req.params.id]
    );
    res.json({ success: true, message: 'Slide actualizado!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/admin/hero/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await db.run('DELETE FROM hero_slides WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Slide eliminado!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Courses CRUD
router.get('/api/admin/courses', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const courses = await db.all('SELECT * FROM courses ORDER BY id DESC');
    res.json(courses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/admin/courses', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured, is_active } = req.body;
    const courseSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const result = await db.run(
      `INSERT INTO courses (title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, courseSlug, category, degree || '', duration || '', modality || 'Presencial', description || '', syllabus || '', requirements || '', vacancies || 30, image_url || '', featured ? 1 : 0, is_active ?? 1]
    );
    res.json({ success: true, id: result.lastInsertRowid, message: 'Curso criado com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/admin/courses/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured, is_active } = req.body;
    await db.run(
      `UPDATE courses SET
        title = ?, slug = ?, category = ?, degree = ?, duration = ?, modality = ?,
        description = ?, syllabus = ?, requirements = ?, vacancies = ?, image_url = ?, featured = ?, is_active = ?
      WHERE id = ?`,
      [title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured ? 1 : 0, is_active ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Curso actualizado com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/admin/courses/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await db.run('DELETE FROM courses WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Curso removido!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// News CRUD
router.get('/api/admin/news', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const articles = await db.all('SELECT * FROM news ORDER BY id DESC');
    res.json(articles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/admin/news', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, category, excerpt, content, image_url, published_at, author, is_published } = req.body;
    const newsSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const result = await db.run(
      `INSERT INTO news (title, slug, category, excerpt, content, image_url, published_at, author, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, newsSlug, category || 'Notícias', excerpt || '', content || '', image_url || '', published_at || new Date().toISOString().split('T')[0], author || 'Redacção ACITE', is_published ?? 1]
    );
    res.json({ success: true, id: result.lastInsertRowid, message: 'Notícia publicada com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/admin/news/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, category, excerpt, content, image_url, published_at, author, is_published } = req.body;
    await db.run(
      `UPDATE news SET
        title = ?, slug = ?, category = ?, excerpt = ?, content = ?, image_url = ?, published_at = ?, author = ?, is_published = ?
      WHERE id = ?`,
      [title, slug, category, excerpt, content, image_url, published_at, author, is_published ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Notícia actualizada!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/admin/news/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await db.run('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notícia removida!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Events CRUD
router.get('/api/admin/events', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const events = await db.all('SELECT * FROM events ORDER BY event_date DESC');
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/admin/events', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, event_date, event_time, location, description, category, registration_url, image_url, is_active } = req.body;
    const result = await db.run(
      `INSERT INTO events (title, event_date, event_time, location, description, category, registration_url, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, event_date, event_time || '', location || '', description || '', category || 'Evento', registration_url || '', image_url || '', is_active ?? 1]
    );
    res.json({ success: true, id: result.lastInsertRowid, message: 'Evento registado com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/admin/events/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, event_date, event_time, location, description, category, registration_url, image_url, is_active } = req.body;
    await db.run(
      `UPDATE events SET
        title = ?, event_date = ?, event_time = ?, location = ?, description = ?, category = ?, registration_url = ?, image_url = ?, is_active = ?
      WHERE id = ?`,
      [title, event_date, event_time, location, description, category, registration_url, image_url, is_active ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Evento actualizado!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/admin/events/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await db.run('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Evento removido!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Publications CRUD
router.get('/api/admin/publications', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pubs = await db.all('SELECT * FROM publications ORDER BY year DESC, id DESC');
    res.json(pubs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/admin/publications', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, authors, year, publication_type, abstract, download_url, cover_url, isbn } = req.body;
    const result = await db.run(
      `INSERT INTO publications (title, authors, year, publication_type, abstract, download_url, cover_url, isbn)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, authors, year || new Date().getFullYear(), publication_type || 'Livro', abstract || '', download_url || '', cover_url || '', isbn || '']
    );
    res.json({ success: true, id: result.lastInsertRowid, message: 'Publicação adicionada!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/admin/publications/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, authors, year, publication_type, abstract, download_url, cover_url, isbn } = req.body;
    await db.run(
      `UPDATE publications SET
        title = ?, authors = ?, year = ?, publication_type = ?, abstract = ?, download_url = ?, cover_url = ?, isbn = ?
      WHERE id = ?`,
      [title, authors, year, publication_type, abstract, download_url, cover_url, isbn, req.params.id]
    );
    res.json({ success: true, message: 'Publicação actualizada!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/admin/publications/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await db.run('DELETE FROM publications WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Publicação removida!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Features CRUD
router.get('/api/admin/features', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const features = await db.all('SELECT * FROM features ORDER BY order_index ASC');
    res.json(features);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/admin/features', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { step_number, title, description, order_index } = req.body;
    const result = await db.run(
      `INSERT INTO features (step_number, title, description, order_index) VALUES (?, ?, ?, ?)`,
      [step_number || '01', title, description, order_index || 0]
    );
    res.json({ success: true, id: result.lastInsertRowid, message: 'Item adicionado!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/admin/features/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { step_number, title, description, order_index } = req.body;
    await db.run(
      `UPDATE features SET step_number = ?, title = ?, description = ?, order_index = ? WHERE id = ?`,
      [step_number, title, description, order_index, req.params.id]
    );
    res.json({ success: true, message: 'Item actualizado!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/admin/features/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await db.run('DELETE FROM features WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Item removido!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Candidate Applications Management
router.get('/api/admin/applications', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const applications = await db.all('SELECT * FROM applications ORDER BY created_at DESC');
    res.json(applications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/admin/applications/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    await db.run('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Estado da candidatura alterado para ${status}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/admin/applications/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await db.run('DELETE FROM applications WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Candidatura eliminada.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Institutional Pages
router.get('/api/admin/pages', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pages = await db.all('SELECT * FROM pages ORDER BY id ASC');
    res.json(pages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/admin/pages/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, meta_description } = req.body;
    await db.run(
      'UPDATE pages SET title = ?, content = ?, meta_description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, content, meta_description || '', req.params.id]
    );
    res.json({ success: true, message: 'Página actualizada!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Media Library
router.post('/api/admin/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const result = await db.run(
      `INSERT INTO media_library (filename, original_name, url, mimetype, size) VALUES (?, ?, ?, ?, ?)`,
      [req.file.filename, req.file.originalname, fileUrl, req.file.mimetype, req.file.size]
    );

    res.json({
      success: true,
      url: fileUrl,
      id: result.lastInsertRowid,
      filename: req.file.filename,
      original_name: req.file.originalname,
      message: 'Ficheiro carregado com sucesso!',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao carregar ficheiro.' });
  }
});

router.get('/api/admin/media', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const media = await db.all('SELECT * FROM media_library ORDER BY created_at DESC');
    res.json(media);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/admin/media/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const fileRecord = await db.get('SELECT * FROM media_library WHERE id = ?', [req.params.id]);
    if (fileRecord) {
      try {
        const filePath = path.join(process.cwd(), 'uploads', fileRecord.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {}
      await db.run('DELETE FROM media_library WHERE id = ?', [req.params.id]);
    }
    res.json({ success: true, message: 'Ficheiro eliminado!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Database Diagnostics
router.get('/api/admin/database/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const diagnostics = await getDatabaseDiagnostics();
    res.json(diagnostics);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao obter diagnóstico da base de dados.' });
  }
});

export default router;
