import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db, dbPath, runAutoMigrations, getDatabaseDiagnostics, executeCustomSchemaUpdate } from './db.js';
import { authMiddleware, AuthRequest, generateToken, hashPassword, comparePassword } from './auth.js';

const router = Router();

// Configure Multer for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
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
// 1. AUTHENTICATION ROUTES
// ==========================================

// Login
router.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Introduza o nome de utilizador e a palavra-passe.' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim()) as any;

    if (!user) {
      res.status(401).json({ error: 'Credenciais incorrectas. Verifique o utilizador ou a senha.' });
      return;
    }

    const isMatch = comparePassword(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Credenciais incorrectas. Verifique a palavra-passe.' });
      return;
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
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
        role: user.role,
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
router.put('/api/auth/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, email, username, current_password, new_password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      res.status(404).json({ error: 'Utilizador não encontrado.' });
      return;
    }

    // Check if changing password
    if (new_password) {
      if (!current_password) {
        res.status(400).json({ error: 'Para alterar a senha, deve introduzir a senha actual.' });
        return;
      }
      if (!comparePassword(current_password, user.password_hash)) {
        res.status(400).json({ error: 'A senha actual está incorrecta.' });
        return;
      }
      if (new_password.length < 4) {
        res.status(400).json({ error: 'A nova senha deve ter pelo menos 4 caracteres.' });
        return;
      }

      const newHash = hashPassword(new_password);
      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, userId);
    }

    // Check if changing username
    if (username && username !== user.username) {
      const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
      if (existing) {
        res.status(400).json({ error: 'Este nome de utilizador já está a ser utilizado por outra conta.' });
        return;
      }
    }

    db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          username = COALESCE(?, username),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name || user.name, email || user.email, username || user.username, userId);

    const updatedUser = db.prepare('SELECT id, username, name, email, role FROM users WHERE id = ?').get(userId);

    res.json({
      success: true,
      message: 'Perfil e credenciais actualizados com sucesso!',
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao actualizar perfil.' });
  }
});

// Manage Admin Users (Create additional staff)
router.get('/api/admin/users', authMiddleware, (req: AuthRequest, res: Response) => {
  const users = db.prepare('SELECT id, username, name, email, role, created_at FROM users ORDER BY id ASC').all();
  res.json(users);
});

router.post('/api/admin/users', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { username, password, name, email, role } = req.body;
    if (!username || !password || !name) {
      res.status(400).json({ error: 'Nome, utilizador e senha são obrigatórios.' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      res.status(400).json({ error: 'Nome de utilizador já existente.' });
      return;
    }

    const hash = hashPassword(password);
    const result = db.prepare(`
      INSERT INTO users (username, password_hash, name, email, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(username, hash, name, email || '', role || 'admin');

    res.json({ success: true, id: result.lastInsertRowid, message: 'Utilizador criado com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/admin/users/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const targetId = parseInt(req.params.id, 10);
  if (targetId === req.user!.id) {
    res.status(400).json({ error: 'Não pode eliminar a sua própria conta em sessão.' });
    return;
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
  res.json({ success: true, message: 'Utilizador removido com sucesso.' });
});

// ==========================================
// 2. PUBLIC API ROUTES (For Fast Frontend Load)
// ==========================================

router.get('/api/public/content', (req: Request, res: Response) => {
  try {
    // 1. Settings object
    const settingsRows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    settingsRows.forEach((r) => {
      settings[r.key] = r.value;
    });

    // 2. Hero slides
    const heroSlides = db.prepare('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY order_index ASC').all();

    // 3. Courses
    const courses = db.prepare('SELECT * FROM courses WHERE is_active = 1 ORDER BY featured DESC, id ASC').all();

    // 4. News
    const news = db.prepare('SELECT * FROM news WHERE is_published = 1 ORDER BY published_at DESC LIMIT 6').all();

    // 5. Events
    const events = db.prepare('SELECT * FROM events WHERE is_active = 1 ORDER BY event_date ASC LIMIT 6').all();

    // 6. Publications
    const publications = db.prepare('SELECT * FROM publications ORDER BY year DESC, id DESC LIMIT 6').all();

    // 7. Features
    const features = db.prepare('SELECT * FROM features ORDER BY order_index ASC, id ASC').all();

    // 8. Pages
    const pages = db.prepare('SELECT id, slug, title, content, meta_description FROM pages').all();

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

// Public Course details
router.get('/api/public/courses/:slug', (req: Request, res: Response) => {
  const course = db.prepare('SELECT * FROM courses WHERE slug = ? OR id = ?').get(req.params.slug, req.params.slug);
  if (!course) {
    res.status(404).json({ error: 'Curso não encontrado.' });
    return;
  }
  res.json(course);
});

// Public News details
router.get('/api/public/news/:slug', (req: Request, res: Response) => {
  const article = db.prepare('SELECT * FROM news WHERE slug = ? OR id = ?').get(req.params.slug, req.params.slug) as any;
  if (!article) {
    res.status(404).json({ error: 'Notícia não encontrada.' });
    return;
  }
  // Increment view count
  db.prepare('UPDATE news SET views = views + 1 WHERE id = ?').run(article.id);
  res.json(article);
});

// Public Application submission (Frontend Inscrição Form)
router.post('/api/public/applications', (req: Request, res: Response) => {
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

    const result = db.prepare(`
      INSERT INTO applications (
        full_name, email, phone, identity_card, course_id, 
        course_title, academic_degree, graduation_institution, notes, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendente')
    `).run(
      full_name.trim(),
      email.trim(),
      phone.trim(),
      identity_card || '',
      course_id || null,
      course_title,
      academic_degree || 'Licenciatura',
      graduation_institution || '',
      notes || ''
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

// ==========================================
// 3. ADMIN CMS ROUTES (PROTECTED)
// ==========================================

// Dashboard Stats & Analytics
router.get('/api/admin/stats', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const totalCourses = db.prepare('SELECT COUNT(*) as c FROM courses').get() as any;
    const totalNews = db.prepare('SELECT COUNT(*) as c FROM news').get() as any;
    const totalEvents = db.prepare('SELECT COUNT(*) as c FROM events').get() as any;
    const totalPublications = db.prepare('SELECT COUNT(*) as c FROM publications').get() as any;
    const totalApplications = db.prepare('SELECT COUNT(*) as c FROM applications').get() as any;
    const pendingApplications = db.prepare("SELECT COUNT(*) as c FROM applications WHERE status = 'Pendente'").get() as any;
    const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get() as any;

    const recentApplications = db.prepare('SELECT * FROM applications ORDER BY created_at DESC LIMIT 5').all();
    const recentNews = db.prepare('SELECT id, title, published_at, views, is_published FROM news ORDER BY created_at DESC LIMIT 5').all();

    res.json({
      stats: {
        courses: totalCourses.c,
        news: totalNews.c,
        events: totalEvents.c,
        publications: totalPublications.c,
        applications: totalApplications.c,
        pendingApplications: pendingApplications.c,
        users: totalUsers.c,
      },
      recentApplications,
      recentNews,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Site Settings (GET, PUT)
router.get('/api/admin/settings', authMiddleware, (req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  rows.forEach((r) => (settings[r.key] = r.value));
  res.json(settings);
});

router.put('/api/admin/settings', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;
    const updateStmt = db.prepare(`
      INSERT INTO site_settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    const updateMany = db.transaction((entries: [string, any][]) => {
      for (const [key, value] of entries) {
        updateStmt.run(key, String(value));
      }
    });

    updateMany(Object.entries(settings));
    res.json({ success: true, message: 'Definições do portal actualizadas com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Hero Slides CRUD
router.get('/api/admin/hero', authMiddleware, (req: AuthRequest, res: Response) => {
  const slides = db.prepare('SELECT * FROM hero_slides ORDER BY order_index ASC, id ASC').all();
  res.json(slides);
});

router.post('/api/admin/hero', authMiddleware, (req: AuthRequest, res: Response) => {
  const { badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index, is_active } = req.body;
  const result = db.prepare(`
    INSERT INTO hero_slides (badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index || 0, is_active ?? 1);
  res.json({ success: true, id: result.lastInsertRowid, message: 'Slide adicionado com sucesso!' });
});

router.put('/api/admin/hero/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index, is_active } = req.body;
  db.prepare(`
    UPDATE hero_slides SET
      badge = ?, title = ?, subtitle = ?, image_url = ?, primary_btn_text = ?, 
      primary_btn_link = ?, secondary_btn_text = ?, secondary_btn_link = ?, 
      order_index = ?, is_active = ?
    WHERE id = ?
  `).run(badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index, is_active, req.params.id);
  res.json({ success: true, message: 'Slide actualizado!' });
});

router.delete('/api/admin/hero/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM hero_slides WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Slide eliminado!' });
});

// Courses CRUD
router.get('/api/admin/courses', authMiddleware, (req: AuthRequest, res: Response) => {
  const courses = db.prepare('SELECT * FROM courses ORDER BY id DESC').all();
  res.json(courses);
});

router.post('/api/admin/courses', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured, is_active } = req.body;
  const courseSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const result = db.prepare(`
    INSERT INTO courses (title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, courseSlug, category, degree || '', duration || '', modality || 'Presencial', description || '', syllabus || '', requirements || '', vacancies || 30, image_url || '', featured ? 1 : 0, is_active ?? 1);
  res.json({ success: true, id: result.lastInsertRowid, message: 'Curso criado com sucesso!' });
});

router.put('/api/admin/courses/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured, is_active } = req.body;
  db.prepare(`
    UPDATE courses SET
      title = ?, slug = ?, category = ?, degree = ?, duration = ?, modality = ?,
      description = ?, syllabus = ?, requirements = ?, vacancies = ?, image_url = ?, featured = ?, is_active = ?
    WHERE id = ?
  `).run(title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured ? 1 : 0, is_active ? 1 : 0, req.params.id);
  res.json({ success: true, message: 'Curso actualizado com sucesso!' });
});

router.delete('/api/admin/courses/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Curso removido!' });
});

// News CRUD
router.get('/api/admin/news', authMiddleware, (req: AuthRequest, res: Response) => {
  const articles = db.prepare('SELECT * FROM news ORDER BY id DESC').all();
  res.json(articles);
});

router.post('/api/admin/news', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, slug, category, excerpt, content, image_url, published_at, author, is_published } = req.body;
  const newsSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const result = db.prepare(`
    INSERT INTO news (title, slug, category, excerpt, content, image_url, published_at, author, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, newsSlug, category || 'Notícias', excerpt || '', content || '', image_url || '', published_at || new Date().toISOString().split('T')[0], author || 'Redacção ACITE', is_published ?? 1);
  res.json({ success: true, id: result.lastInsertRowid, message: 'Notícia publicada com sucesso!' });
});

router.put('/api/admin/news/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, slug, category, excerpt, content, image_url, published_at, author, is_published } = req.body;
  db.prepare(`
    UPDATE news SET
      title = ?, slug = ?, category = ?, excerpt = ?, content = ?, image_url = ?, published_at = ?, author = ?, is_published = ?
    WHERE id = ?
  `).run(title, slug, category, excerpt, content, image_url, published_at, author, is_published ? 1 : 0, req.params.id);
  res.json({ success: true, message: 'Notícia actualizada!' });
});

router.delete('/api/admin/news/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Notícia removida!' });
});

// Events CRUD
router.get('/api/admin/events', authMiddleware, (req: AuthRequest, res: Response) => {
  const events = db.prepare('SELECT * FROM events ORDER BY event_date DESC').all();
  res.json(events);
});

router.post('/api/admin/events', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, event_date, event_time, location, description, category, registration_url, image_url, is_active } = req.body;
  const result = db.prepare(`
    INSERT INTO events (title, event_date, event_time, location, description, category, registration_url, image_url, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, event_date, event_time || '', location || '', description || '', category || 'Evento', registration_url || '', image_url || '', is_active ?? 1);
  res.json({ success: true, id: result.lastInsertRowid, message: 'Evento registado com sucesso!' });
});

router.put('/api/admin/events/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, event_date, event_time, location, description, category, registration_url, image_url, is_active } = req.body;
  db.prepare(`
    UPDATE events SET
      title = ?, event_date = ?, event_time = ?, location = ?, description = ?, category = ?, registration_url = ?, image_url = ?, is_active = ?
    WHERE id = ?
  `).run(title, event_date, event_time, location, description, category, registration_url, image_url, is_active ? 1 : 0, req.params.id);
  res.json({ success: true, message: 'Evento actualizado!' });
});

router.delete('/api/admin/events/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Evento removido!' });
});

// Publications CRUD
router.get('/api/admin/publications', authMiddleware, (req: AuthRequest, res: Response) => {
  const pubs = db.prepare('SELECT * FROM publications ORDER BY year DESC, id DESC').all();
  res.json(pubs);
});

router.post('/api/admin/publications', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, authors, year, publication_type, abstract, download_url, cover_url, isbn } = req.body;
  const result = db.prepare(`
    INSERT INTO publications (title, authors, year, publication_type, abstract, download_url, cover_url, isbn)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, authors, year || new Date().getFullYear(), publication_type || 'Livro', abstract || '', download_url || '', cover_url || '', isbn || '');
  res.json({ success: true, id: result.lastInsertRowid, message: 'Publicação adicionada!' });
});

router.put('/api/admin/publications/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, authors, year, publication_type, abstract, download_url, cover_url, isbn } = req.body;
  db.prepare(`
    UPDATE publications SET
      title = ?, authors = ?, year = ?, publication_type = ?, abstract = ?, download_url = ?, cover_url = ?, isbn = ?
    WHERE id = ?
  `).run(title, authors, year, publication_type, abstract, download_url, cover_url, isbn, req.params.id);
  res.json({ success: true, message: 'Publicação actualizada!' });
});

router.delete('/api/admin/publications/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM publications WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Publicação removida!' });
});

// Features (Why Choose ACITE) CRUD
router.get('/api/admin/features', authMiddleware, (req: AuthRequest, res: Response) => {
  const features = db.prepare('SELECT * FROM features ORDER BY order_index ASC').all();
  res.json(features);
});

router.post('/api/admin/features', authMiddleware, (req: AuthRequest, res: Response) => {
  const { step_number, title, description, order_index } = req.body;
  const result = db.prepare(`
    INSERT INTO features (step_number, title, description, order_index)
    VALUES (?, ?, ?, ?)
  `).run(step_number || '01', title, description, order_index || 0);
  res.json({ success: true, id: result.lastInsertRowid, message: 'Item adicionado!' });
});

router.put('/api/admin/features/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { step_number, title, description, order_index } = req.body;
  db.prepare(`
    UPDATE features SET step_number = ?, title = ?, description = ?, order_index = ? WHERE id = ?
  `).run(step_number, title, description, order_index, req.params.id);
  res.json({ success: true, message: 'Item actualizado!' });
});

router.delete('/api/admin/features/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM features WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Item removido!' });
});

// Candidate Applications / Inscrições Management
router.get('/api/admin/applications', authMiddleware, (req: AuthRequest, res: Response) => {
  const applications = db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all();
  res.json(applications);
});

router.put('/api/admin/applications/:id/status', authMiddleware, (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true, message: `Estado da candidatura alterado para ${status}` });
});

router.delete('/api/admin/applications/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM applications WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Candidatura eliminada.' });
});

// Institutional Pages (Sobre, Missão, etc.)
router.get('/api/admin/pages', authMiddleware, (req: AuthRequest, res: Response) => {
  const pages = db.prepare('SELECT * FROM pages ORDER BY id ASC').all();
  res.json(pages);
});

router.put('/api/admin/pages/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, content, meta_description } = req.body;
  db.prepare('UPDATE pages SET title = ?, content = ?, meta_description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(title, content, meta_description || '', req.params.id);
  res.json({ success: true, message: 'Página actualizada!' });
});

// Media Library & File Uploads
router.post('/api/admin/upload', authMiddleware, upload.single('file'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const result = db.prepare(`
      INSERT INTO media_library (filename, original_name, url, mimetype, size)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.file.filename, req.file.originalname, fileUrl, req.file.mimetype, req.file.size);

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

router.get('/api/admin/media', authMiddleware, (req: AuthRequest, res: Response) => {
  const media = db.prepare('SELECT * FROM media_library ORDER BY created_at DESC').all();
  res.json(media);
});

router.delete('/api/admin/media/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const fileRecord = db.prepare('SELECT * FROM media_library WHERE id = ?').get(req.params.id) as any;
  if (fileRecord) {
    const filePath = path.join(process.cwd(), 'uploads', fileRecord.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    }
    db.prepare('DELETE FROM media_library WHERE id = ?').run(req.params.id);
  }
  res.json({ success: true, message: 'Ficheiro eliminado!' });
});

// ==========================================
// 12. DATABASE AUTO-UPDATE & SYSTEM DIAGNOSTICS
// ==========================================

// Get database status, migrations history, tables stats, and integrity
router.get('/api/admin/database/status', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const diagnostics = getDatabaseDiagnostics(db, dbPath);
    res.json(diagnostics);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao obter diagnóstico da base de dados.' });
  }
});

// Trigger database auto-update / run pending migrations
router.post('/api/admin/database/migrate', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const result = runAutoMigrations(db);
    const diagnostics = getDatabaseDiagnostics(db, dbPath);
    res.json({
      success: true,
      message: result.executed > 0
        ? `Base de dados actualizada com sucesso! ${result.executed} migrações aplicadas (Versão v${result.currentVersion}).`
        : `A base de dados já se encontra actualizada na versão mais recente (v${result.currentVersion}).`,
      result,
      diagnostics,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao executar migrações na base de dados.' });
  }
});

// Optimize database (VACUUM and PRAGMA optimize)
router.post('/api/admin/database/optimize', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    db.pragma('wal_checkpoint(TRUNCATE)');
    db.exec('VACUUM;');
    db.pragma('optimize');
    const diagnostics = getDatabaseDiagnostics(db, dbPath);
    res.json({
      success: true,
      message: 'Base de dados optimizada com sucesso (VACUUM e checkpoint executados).',
      diagnostics,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao optimizar base de dados.' });
  }
});

// Download database backup file (.db)
router.get('/api/admin/database/backup', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    // Flush WAL to disk first
    db.pragma('wal_checkpoint(FULL)');
    
    if (!fs.existsSync(dbPath)) {
      res.status(404).json({ error: 'Ficheiro da base de dados não encontrado.' });
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const backupFileName = `acite_database_backup_${dateStr}.db`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${backupFileName}"`);
    res.setHeader('Content-Type', 'application/x-sqlite3');
    
    const fileStream = fs.createReadStream(dbPath);
    fileStream.pipe(res);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao descarregar cópia de segurança.' });
  }
});

// Execute custom schema adjustment / new feature table safely
router.post('/api/admin/database/custom-schema', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      res.status(400).json({ error: 'Instrução SQL obrigatória.' });
      return;
    }

    const result = executeCustomSchemaUpdate(db, sql);
    const diagnostics = getDatabaseDiagnostics(db, dbPath);
    res.json({
      success: true,
      message: result.message,
      diagnostics,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro de sintaxe ou execução SQL.' });
  }
});

export default router;

