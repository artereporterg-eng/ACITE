import { createClient, Client, InStatement } from '@libsql/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Turso Database configuration:
// Works with Turso Cloud (libsql://... with TURSO_AUTH_TOKEN)
// or fallback to local SQLite (file:acite.db)
const databaseUrl = 
  process.env.TURSO_DATABASE_URL || 
  process.env.TURSO_URL || 
  process.env.LIBSQL_URL || 
  'file:acite.db';

const authToken = 
  process.env.TURSO_AUTH_TOKEN || 
  process.env.LIBSQL_AUTH_TOKEN || 
  undefined;

export const client: Client = createClient({
  url: databaseUrl,
  authToken: authToken,
});

export const dbPath = databaseUrl;

// Unified async DB helper interface
export const db = {
  client,

  async all<T = any>(sql: string, args: any[] = []): Promise<T[]> {
    const res = await client.execute({ sql, args });
    return res.rows as unknown as T[];
  },

  async get<T = any>(sql: string, args: any[] = []): Promise<T | undefined> {
    const res = await client.execute({ sql, args });
    return (res.rows[0] as unknown as T) || undefined;
  },

  async run(sql: string, args: any[] = []): Promise<{ lastInsertRowid: number; rowsAffected: number }> {
    const res = await client.execute({ sql, args });
    return {
      lastInsertRowid: Number(res.lastInsertRowid ?? 0),
      rowsAffected: res.rowsAffected ?? 0,
    };
  },

  async exec(sql: string): Promise<void> {
    await client.executeMultiple(sql);
  },

  async batch(statements: InStatement[]): Promise<any[]> {
    return await client.batch(statements, 'write');
  },

  // Prepared statement emulation for compatibility
  prepare(sql: string) {
    return {
      all: (...args: any[]) => db.all(sql, args),
      get: (...args: any[]) => db.get(sql, args),
      run: (...args: any[]) => db.run(sql, args),
    };
  },
};

let isInitialized = false;

export async function initDatabase() {
  if (isInitialized) return;

  try {
    // 1. Ensure directories exist in non-serverless environments
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const multimediaDir = path.join(process.cwd(), 'public', 'multimedia');
      if (!fs.existsSync(multimediaDir)) {
        fs.mkdirSync(multimediaDir, { recursive: true });
      }
    } catch {
      // Ignored in read-only serverless filesystems
    }

    // 2. Core Tables Schema for Turso / LibSQL
    await client.executeMultiple(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT 'Administrador ACITE',
        email TEXT UNIQUE,
        role TEXT NOT NULL DEFAULT 'admin',
        category TEXT DEFAULT 'Super Administrador',
        department TEXT DEFAULT 'Direcção Geral',
        phone TEXT,
        status TEXT DEFAULT 'Ativo',
        avatar_url TEXT,
        last_login_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hero_slides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        badge TEXT,
        title TEXT NOT NULL,
        subtitle TEXT,
        image_url TEXT NOT NULL,
        primary_btn_text TEXT,
        primary_btn_link TEXT,
        secondary_btn_text TEXT,
        secondary_btn_link TEXT,
        order_index INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        category TEXT NOT NULL,
        degree TEXT,
        duration TEXT,
        modality TEXT DEFAULT 'Presencial',
        description TEXT,
        syllabus TEXT,
        requirements TEXT,
        vacancies INTEGER DEFAULT 30,
        image_url TEXT,
        featured INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        coordinator TEXT,
        credits INTEGER DEFAULT 120,
        schedule_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        category TEXT DEFAULT 'Notícias',
        excerpt TEXT,
        content TEXT,
        image_url TEXT,
        author TEXT DEFAULT 'Redacção ACITE',
        published_at DATE DEFAULT CURRENT_DATE,
        views INTEGER DEFAULT 0,
        is_published INTEGER DEFAULT 1,
        tags TEXT,
        meta_keywords TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        event_date TEXT NOT NULL,
        event_time TEXT,
        location TEXT,
        description TEXT,
        category TEXT DEFAULT 'Conferência',
        registration_url TEXT,
        image_url TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS publications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        authors TEXT NOT NULL,
        year INTEGER,
        publication_type TEXT DEFAULT 'Livro',
        abstract TEXT,
        download_url TEXT,
        cover_url TEXT,
        isbn TEXT,
        doi TEXT,
        citations_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        step_number TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        order_index INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        identity_card TEXT,
        course_id INTEGER,
        course_title TEXT NOT NULL,
        academic_degree TEXT,
        graduation_institution TEXT,
        notes TEXT,
        status TEXT DEFAULT 'Pendente',
        reviewed_by TEXT,
        reviewed_at DATETIME,
        rejection_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        meta_description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS media_library (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        url TEXT NOT NULL,
        mimetype TEXT,
        size INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        details TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS system_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT DEFAULT 'info',
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link_url TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS navigation_menus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_location TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        target TEXT DEFAULT '_self',
        order_index INTEGER DEFAULT 0,
        parent_id INTEGER DEFAULT NULL,
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'Não Lida',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        is_active INTEGER DEFAULT 1,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
      CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
      CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    `);

    // 3. Seed Default Users: admin (pass: 123) and fox (pass: 123)
    const salt = bcrypt.genSaltSync(10);
    const hash123 = bcrypt.hashSync('123', salt);

    const adminUser = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
    if (adminUser) {
      await db.run(
        `UPDATE users SET password_hash = ?, role = 'superadmin', category = 'Super Administrador', status = 'Ativo', name = 'Administrador Geral' WHERE username = 'admin'`,
        [hash123]
      );
    } else {
      await db.run(
        `INSERT INTO users (username, password_hash, name, email, role, category, department, phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['admin', hash123, 'Administrador Geral', 'admin@acite.ao', 'superadmin', 'Super Administrador', 'Direcção Geral & Reitoria', '+244 923 000 000', 'Ativo']
      );
    }

    const foxUser = await db.get('SELECT * FROM users WHERE username = ?', ['fox']);
    if (foxUser) {
      await db.run(
        `UPDATE users SET password_hash = ?, role = 'superadmin', category = 'Super Administrador', status = 'Ativo', name = 'Fox Administrator' WHERE username = 'fox'`,
        [hash123]
      );
    } else {
      await db.run(
        `INSERT INTO users (username, password_hash, name, email, role, category, department, phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['fox', hash123, 'Fox Administrator', 'fox@acite.ao', 'superadmin', 'Super Administrador', 'Gabinete de Tecnologias de Informação', '+244 912 345 678', 'Ativo']
      );
    }

    // 4. Seed site settings if empty
    const settingsCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM site_settings');
    if ((settingsCount?.count || 0) === 0) {
      const defaultSettings: Record<string, string> = {
        site_name: 'ACITE',
        full_name: 'Academia de Ciências Sociais e Tecnologias',
        tagline: 'Instituição de Ensino Superior Pública de Altos Estudos',
        description: 'A Academia de Ciências Sociais e Tecnologias desenvolve actividades académicas, de investigação científica e extensão nos domínios das Ciências Sociais, Engenharias e Tecnologias. Ministra Cursos de Mestrado e Doutoramento.',
        logo_text: 'A',
        phone: '+244 923 000 000 / +244 912 000 000',
        email: 'geral@acite.ao',
        admissions_email: 'inscricoes@acite.ao',
        address: 'Rua das Escolas, Bairro Morro Bento / Talatona, Luanda - Angola',
        academic_calendar_url: '#',
        repository_url: 'https://repositorio.acite.ao',
        inscriptions_open: 'true',
        inscriptions_badge: 'Candidaturas 2026/2027 Abertas',
        facebook_url: 'https://facebook.com/aciteangola',
        twitter_url: 'https://twitter.com/aciteangola',
        instagram_url: 'https://instagram.com/aciteangola',
        linkedin_url: 'https://linkedin.com/school/acite',
        youtube_url: 'https://youtube.com',
        stat_active_students: '1.500+',
        stat_masters_doctors: '85%',
        stat_published_papers: '320+',
        stat_partner_universities: '25+',
      };

      for (const [k, v] of Object.entries(defaultSettings)) {
        await db.run('INSERT INTO site_settings (key, value) VALUES (?, ?)', [k, v]);
      }
    }

    // 5. Seed Hero Slides if empty
    const heroCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM hero_slides');
    if ((heroCount?.count || 0) === 0) {
      await db.run(
        `INSERT INTO hero_slides (badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'BEM-VINDO À ACITE',
          'Excelência no Ensino e Investigação de Altos Estudos',
          'Instituição pública de referência em Angola para pós-graduações, mestrados, doutoramentos e pesquisa científica nas Ciências Sociais, Engenharias e Tecnologias.',
          '/multimedia/hero-slide-1.svg',
          'Ver Cursos & Pós-Graduações',
          '#cursos',
          'Fazer Inscrição',
          '#inscricao',
          1
        ]
      );

      await db.run(
        `INSERT INTO hero_slides (badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'CANDIDATURAS ABERTAS 2026',
          'Eleve o seu Potencial Académico e Profissional',
          'Cursos concebidos para formar líderes inovadores, investigadores e gestores de topo com corpo docente de renome internacional.',
          '/multimedia/hero-slide-2.svg',
          'Inscreva-se Agora',
          '#inscricao',
          'Calendário Académico',
          '#calendario',
          2
        ]
      );
    }

    // 6. Seed Courses if empty
    const coursesCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM courses');
    if ((coursesCount?.count || 0) === 0) {
      const coursesSeed = [
        [
          'Doutoramento em Ciências da Computação e Inteligência Artificial',
          'doutoramento-computacao-ia',
          'Pós-Graduação Académica',
          'Doutoramento (PhD)',
          '3 a 4 Anos',
          'Presencial e Híbrido',
          'Programa avançado dedicado à investigação de ponta em algoritmos avançados, inteligência artificial, processamento de dados e cibersegurança aplicada ao desenvolvimento nacional.',
          '1º Ano: Métodos Avançados de Investigação, Tópicos em IA, Aprendizagem Automática, Seminário Doutoral.\n2º a 4º Ano: Elaboração da Tese Doutoral e Publicações Científicas.',
          'Grau de Mestre em Engenharia Informática, Ciências da Computação ou áreas afins; Proposta de Projecto de Tese; Curriculum Vitae e Entrevista com o Conselho Científico.',
          15,
          '/multimedia/course-ia.svg',
          1
        ],
        [
          'Doutoramento em Políticas Públicas e Desenvolvimento Social',
          'doutoramento-politicas-publicas',
          'Pós-Graduação Académica',
          'Doutoramento (PhD)',
          '3 a 4 Anos',
          'Presencial',
          'Formação doutoral focada na análise crítica, formulação de políticas governamentais, economia social, sustentabilidade e governação em África.',
          'Módulos Teóricos e Metodológicos Avançados, Governação e Políticas Públicas em Angola, Seminários de Investigação e Redacção de Tese.',
          'Mestrado em Ciências Sociais, Economia, Direito ou Administração Pública; CV detalhado e Projeto de Pesquisa.',
          20,
          '/multimedia/course-politicas.svg',
          1
        ],
        [
          'Mestrado em Engenharia de Software e Sistemas de Informação',
          'mestrado-engenharia-software',
          'Pós-Graduação Académica',
          'Mestrado (MSc)',
          '2 Anos',
          'Pós-Laboral / Híbrido',
          'Capacita profissionais de engenharia para arquitetar sistemas corporativos robustos, gestão de produtos digitais, cloud computing e inovação tecnológica.',
          'Arquitetura de Software, Big Data Analytics, Engenharia de Requisitos, Gestão Ágil de Projetos, Dissertação/Trabalho de Projeto.',
          'Licenciatura em Engenharia Informática, Telecomunicações, Ciências da Computação ou afins com média mínima de 14 valores.',
          30,
          '/multimedia/course-software.svg',
          1
        ],
        [
          'Mestrado em Gestão Estratégica e Liderança Organizacional',
          'mestrado-gestao-estrategica',
          'Pós-Graduação Académica',
          'Mestrado (MSc)',
          '2 Anos',
          'Pós-Laboral',
          'Desenvolvimento de visão estratégica de alto nível, liderança de equipas multidisciplinares, finanças corporativas e transformação digital nos negócios.',
          'Estratégia Empresarial Global, Finanças para Executivos, Gestão de Pessoas e Liderança, Inovação e Empreendedorismo, Dissertação.',
          'Licenciatura reconhecida em qualquer área do conhecimento e experiência profissional relevante.',
          35,
          '/multimedia/course-gestao.svg',
          1
        ],
        [
          'Especialização Executiva em Cibersegurança e Governação de TI',
          'especializacao-ciberseguranca',
          'Pós-Graduação Profissional',
          'Pós-Graduação',
          '9 Meses',
          'Híbrido (Sábados)',
          'Curso intensivo voltado para gestores de segurança da informação, auditoria de redes corporativas, conformidade regulatória e resposta a incidentes.',
          'Normas ISO 27001, Testes de Intrusão, Forense Digital, Proteção de Dados e Legislação Cibernética Angolana.',
          'Licenciatura ou experiência profissional comprovada na área de TI.',
          25,
          '/multimedia/course-ciberseguranca.svg',
          0
        ],
        [
          'Programa Avançado de Inglês Académico e Científico (IELTS/TOEFL)',
          'ingles-academico-cientifico',
          'Centro de Estudos de Línguas',
          'Certificação Internacional',
          '6 Meses',
          'Presencial / Online',
          'Capacitação linguística rigorosa para investigadores, escrita de papers científicos internacionais e preparação para conferências globais.',
          'Academic Writing for Journals, Oral Presentations & Defenses, IELTS/TOEFL Academic Preparation.',
          'Teste de nivelamento inicial ou certificado prévio B1/B2.',
          40,
          '/multimedia/course-ingles.svg',
          0
        ]
      ];

      for (const c of coursesSeed) {
        await db.run(
          `INSERT INTO courses (title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          c
        );
      }
    }

    // 7. Seed News if empty
    const newsCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM news');
    if ((newsCount?.count || 0) === 0) {
      await db.run(
        `INSERT INTO news (title, slug, category, excerpt, content, image_url, published_at, author, views)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'ACITE Acolhe Conferência Internacional sobre Inteligência Artificial e Inovação em África',
          'conferencia-internacional-ia-africa',
          'Eventos Científicos',
          'O encontro reuniu mais de 300 académicos, investigadores e líderes governamentais para debater as oportunidades da IA no desenvolvimento sustentável do continente.',
          'A Academia de Ciências Sociais e Tecnologias (ACITE) realizou com sucesso a 1ª Conferência Internacional de Inteligência Artificial e Inovação em Angola. O evento contou com oradores de prestígio de universidades africanas, europeias e americanas, destacando o papel estratégico da pesquisa aplicada.\n\nDurante o discurso de abertura, foi salientada a importância da soberania tecnológica e da formação de quadros de nível de doutoramento em Angola.',
          '/multimedia/news-conferencia.svg',
          '2026-02-20',
          'Gabinete de Comunicação ACITE',
          420
        ]
      );

      await db.run(
        `INSERT INTO news (title, slug, category, excerpt, content, image_url, published_at, author, views)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Abertura Solene do Ano Académico 2026/2027 e Lançamento de Novos Programas de Doutoramento',
          'abertura-solene-ano-academico-2026',
          'Institucional',
          'A ACITE anunciou a integração de novas linhas de pesquisa científica e bolsas de mérito para jovens investigadores angolanos.',
          'Teve lugar no auditório principal da ACITE a cerimónia de abertura do novo ano letivo. Na ocasião, foram apresentados os novos cursos de doutoramento e mestrado aprovados pelo órgão tutelar, bem como a celebração de protocolos com indústrias nacionais para estágios e projetos conjuntos.',
          '/multimedia/news-abertura.svg',
          '2026-02-15',
          'Direcção Académica',
          290
        ]
      );
    }

    // 8. Seed Events if empty
    const eventsCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM events');
    if ((eventsCount?.count || 0) === 0) {
      await db.run(
        `INSERT INTO events (title, event_date, event_time, location, description, category, registration_url, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Workshop: Metodologias Ágeis e Publicação em Revistas Scopus',
          '2026-03-12',
          '09:00 - 13:00',
          'Auditório Nobre ACITE, Luanda',
          'Capacitação prática para mestrandos e doutorandos sobre estruturação de artigos, revisão por pares e indexação internacional.',
          'Workshop',
          '#inscricao-workshop',
          '/multimedia/event-workshop.svg'
        ]
      );
    }

    // 9. Seed Publications if empty
    const pubCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM publications');
    if ((pubCount?.count || 0) === 0) {
      await db.run(
        `INSERT INTO publications (title, authors, year, publication_type, abstract, download_url, cover_url, isbn)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Desenvolvimento Sustentável e Transformação Digital em Angola: Perspectivas e Desafios',
          'Prof. Doutor António Manuel & Equipa de Investigação ACITE',
          2025,
          'Livro Científico',
          'Obra de referência multidisciplinar que analisa os pilares da digitalização económica, infraestruturas energéticas e inclusão social no contexto angolano.',
          '#',
          '/multimedia/book-sustentabilidade.svg',
          '978-989-123-456-7'
        ]
      );
    }

    // 10. Seed Features if empty
    const featCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM features');
    if ((featCount?.count || 0) === 0) {
      await db.run(`INSERT INTO features (step_number, title, description, order_index) VALUES (?, ?, ?, ?)`, ['01', 'Corpo Docente de Alto Nível', 'Mais de 85% do nosso corpo docente é composto por Doutores e Mestres com ampla experiência académica internacional e notoriedade profissional.', 1]);
      await db.run(`INSERT INTO features (step_number, title, description, order_index) VALUES (?, ?, ?, ?)`, ['02', 'Investigação Aplicada ao País', 'Os nossos programas de pesquisa concentram-se na resolução de problemas reais de Angola e de África nas áreas de engenharia, governação e inovação.', 2]);
      await db.run(`INSERT INTO features (step_number, title, description, order_index) VALUES (?, ?, ?, ?)`, ['03', 'Infraestrutura Tecnológica Moderna', 'Laboratórios de computação avançada, biblioteca digital com acesso a bases mundiais e salas equipadas para ensino presencial e remoto.', 3]);
      await db.run(`INSERT INTO features (step_number, title, description, order_index) VALUES (?, ?, ?, ?)`, ['04', 'Rede de Parcerias Globais', 'Convénios ativos com universidades e centros de pesquisa de Portugal, Brasil, Reino Unido e África do Sul para cotutela e mobilidade.', 4]);
    }

    // 11. Seed Institutional Pages if empty
    const pagesCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM pages');
    if ((pagesCount?.count || 0) === 0) {
      await db.run(
        `INSERT INTO pages (slug, title, content, meta_description) VALUES (?, ?, ?, ?)`,
        [
          'sobre',
          'Sobre a ACITE',
          'A Academia de Ciências Sociais e Tecnologias (ACITE) é uma Instituição de Ensino Superior Pública de Altos Estudos vocacionada para a formação pós-graduada de excelência, a investigação científica e a extensão universitária.\n\nLocalizada em Luanda, Angola, a ACITE assume o compromisso de capacitar quadros superiores para responderem aos desafios complexos do desenvolvimento económico, social e tecnológico da nação.',
          'Conheça a história, missão e propósitos da ACITE em Angola.'
        ]
      );
      await db.run(
        `INSERT INTO pages (slug, title, content, meta_description) VALUES (?, ?, ?, ?)`,
        [
          'missao-visao',
          'Missão, Visão e Valores',
          '### Missão\nProduzir e disseminar conhecimento científico de fronteira, formar líderes e investigadores éticos e inovadores que impulsionem a transformação da sociedade angolana e africana.\n\n### Visão\nSer uma instituição de altos estudos de referência em África e no mundo lusófono, reconhecida pelo rigor científico, inovação tecnológica e impacto das suas pesquisas.\n\n### Valores\n- Excelência Académica e Rigor Científico\n- Ética, Transparência e Responsabilidade Social\n- Inovação e Pensamento Crítico\n- Valorização do Mérito e Inclusão',
          'Os princípios orientadores da Academia de Ciências Sociais e Tecnologias.'
        ]
      );
    }

    isInitialized = true;
    console.log(`✅ [ACITE] Turso / LibSQL Database initialized successfully (${databaseUrl.startsWith('libsql://') ? 'Turso Cloud' : 'Local SQLite'})`);
  } catch (err) {
    console.error('❌ [ACITE DB Init Error]:', err);
  }
}

export async function getDatabaseDiagnostics() {
  const isTursoCloud = databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('https://');

  const tables = [
    'users', 'site_settings', 'hero_slides', 'courses', 'news', 'events', 
    'publications', 'features', 'applications', 'pages', 'media_library',
    'audit_logs', 'system_notifications', 'navigation_menus', 'contact_messages', 'newsletter_subscribers'
  ];

  const tablesStats = [];
  for (const tableName of tables) {
    try {
      const countRes = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM ${tableName}`);
      tablesStats.push({
        name: tableName,
        rowCount: countRes?.count ?? 0,
      });
    } catch {
      tablesStats.push({
        name: tableName,
        rowCount: 0,
      });
    }
  }

  return {
    engine: isTursoCloud ? 'Turso Database (LibSQL Cloud / Edge)' : 'LibSQL (Local SQLite File)',
    databaseUrl: isTursoCloud ? databaseUrl.replace(/:[^:@]+@/, ':***@') : databaseUrl,
    isTursoCloud,
    tables: tablesStats,
    lastCheckedAt: new Date().toISOString(),
    status: 'ONLINE & READY',
  };
}
