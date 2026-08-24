import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { runAutoMigrations, getDatabaseDiagnostics, executeCustomSchemaUpdate } from './migrations';

export const dbPath = path.join(process.cwd(), 'acite.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

export function initDatabase() {
  // Ensure uploads and multimedia directories exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const multimediaDir = path.join(process.cwd(), 'public', 'multimedia');
  if (!fs.existsSync(multimediaDir)) {
    fs.mkdirSync(multimediaDir, { recursive: true });
  }

  // Execute Auto-Migrations System (creates and evolves all tables safely)
  try {
    const migrationResult = runAutoMigrations(db);
    if (migrationResult.executed > 0) {
      console.log(`🚀 [DB System] Auto-actualização concluída: ${migrationResult.executed} migrações aplicadas. Versão actual: v${migrationResult.currentVersion}`);
    } else {
      console.log(`👌 [DB System] Base de dados sincronizada na versão v${migrationResult.currentVersion}`);
    }
  } catch (migErr) {
    console.error('⚠️ Erro ao executar auto-migrações:', migErr);
  }

  // Ensure default admin exists (user: admin, pass: admin)
  const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!adminUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin', salt);
    db.prepare(`
      INSERT INTO users (username, password_hash, name, email, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', hash, 'Administrador Geral', 'admin@acite.ao', 'superadmin');
    console.log('✅ Default admin created: user="admin" | password="admin"');
  }

  // 2. Site settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // 3. Hero Slides
  db.exec(`
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
  `);

  // 4. Courses table
  db.exec(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. News table
  db.exec(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Events table
  db.exec(`
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
  `);

  // 7. Publications / Books table
  db.exec(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Why Choose Us / Features
  db.exec(`
    CREATE TABLE IF NOT EXISTS features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      step_number TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      order_index INTEGER DEFAULT 0
    );
  `);

  // 9. Candidate Inscriptions / Applications
  db.exec(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 10. Institutional Pages
  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      meta_description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 11. Media Library
  db.exec(`
    CREATE TABLE IF NOT EXISTS media_library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      url TEXT NOT NULL,
      mimetype TEXT,
      size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default site settings if empty
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number };
  if (settingsCount.count === 0) {
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

    const insertStmt = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(defaultSettings)) {
      insertStmt.run(k, v);
    }
  }

  // Seed Hero Slides if empty
  const heroCount = db.prepare('SELECT COUNT(*) as count FROM hero_slides').get() as { count: number };
  if (heroCount.count === 0) {
    const insertHero = db.prepare(`
      INSERT INTO hero_slides (badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertHero.run(
      'BEM-VINDO À ACITE',
      'Excelência no Ensino e Investigação de Altos Estudos',
      'Instituição pública de referência em Angola para pós-graduações, mestrados, doutoramentos e pesquisa científica nas Ciências Sociais, Engenharias e Tecnologias.',
      '/multimedia/hero-slide-1.svg',
      'Ver Cursos & Pós-Graduações',
      '#cursos',
      'Fazer Inscrição',
      '#inscricao',
      1
    );

    insertHero.run(
      'CANDIDATURAS ABERTAS 2026',
      'Eleve o seu Potencial Académico e Profissional',
      'Cursos concebidos para formar líderes inovadores, investigadores e gestores de topo com corpo docente de renome internacional.',
      '/multimedia/hero-slide-2.svg',
      'Inscreva-se Agora',
      '#inscricao',
      'Calendário Académico',
      '#calendario',
      2
    );
  }

  // Seed Courses if empty
  const coursesCount = db.prepare('SELECT COUNT(*) as count FROM courses').get() as { count: number };
  if (coursesCount.count === 0) {
    const insertCourse = db.prepare(`
      INSERT INTO courses (title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCourse.run(
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
    );

    insertCourse.run(
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
    );

    insertCourse.run(
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
    );

    insertCourse.run(
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
    );

    insertCourse.run(
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
    );

    insertCourse.run(
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
    );
  }

  // Seed News if empty
  const newsCount = db.prepare('SELECT COUNT(*) as count FROM news').get() as { count: number };
  if (newsCount.count === 0) {
    const insertNews = db.prepare(`
      INSERT INTO news (title, slug, category, excerpt, content, image_url, published_at, author, views)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertNews.run(
      'ACITE Acolhe Conferência Internacional sobre Inteligência Artificial e Inovação em África',
      'conferencia-internacional-ia-africa',
      'Eventos Científicos',
      'O encontro reuniu mais de 300 académicos, investigadores e líderes governamentais para debater as oportunidades da IA no desenvolvimento sustentável do continente.',
      'A Academia de Ciências Sociais e Tecnologias (ACITE) realizou com sucesso a 1ª Conferência Internacional de Inteligência Artificial e Inovação em Angola. O evento contou com oradores de prestígio de universidades africanas, europeias e americanas, destacando o papel estratégico da pesquisa aplicada.\n\nDurante o discurso de abertura, foi salientada a importância da soberania tecnológica e da formação de quadros de nível de doutoramento em Angola.',
      '/multimedia/news-conferencia.svg',
      '2026-02-20',
      'Gabinete de Comunicação ACITE',
      420
    );

    insertNews.run(
      'Abertura Solene do Ano Académico 2026/2027 e Lançamento de Novos Programas de Doutoramento',
      'abertura-solene-ano-academico-2026',
      'Institucional',
      'A ACITE anunciou a integração de novas linhas de pesquisa científica e bolsas de mérito para jovens investigadores angolanos.',
      'Teve lugar no auditório principal da ACITE a cerimónia de abertura do novo ano letivo. Na ocasião, foram apresentados os novos cursos de doutoramento e mestrado aprovados pelo órgão tutelar, bem como a celebração de protocolos com indústrias nacionais para estágios e projetos conjuntos.',
      '/multimedia/news-abertura.svg',
      '2026-02-15',
      'Direcção Académica',
      290
    );

    insertNews.run(
      'Assinatura de Memorando de Cooperação com Institutos de Pesquisa Científica Internacionais',
      'memorando-cooperacao-internacional',
      'Cooperação',
      'Parceria estratégica prevê intercâmbio de docentes, cotutela de teses e acesso partilhado a repositórios de dados laboratoriais.',
      'Com o objetivo de internacionalizar as publicações científicas de docentes e pós-graduandos, a ACITE formalizou um protocolo de cooperação científica bilateral, permitindo o intercâmbio direto e publicação em revistas indexadas de alto impacto.',
      '/multimedia/news-memorando.svg',
      '2026-02-08',
      'Gabinete de Relações Internacionais',
      180
    );
  }

  // Seed Events if empty
  const eventsCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
  if (eventsCount.count === 0) {
    const insertEvent = db.prepare(`
      INSERT INTO events (title, event_date, event_time, location, description, category, registration_url, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEvent.run(
      'Workshop: Metodologias Ágeis e Publicação em Revistas Scopus',
      '2026-03-12',
      '09:00 - 13:00',
      'Auditório Nobre ACITE, Luanda',
      'Capacitação prática para mestrandos e doutorandos sobre estruturação de artigos, revisão por pares e indexação internacional.',
      'Workshop',
      '#inscricao-workshop',
      '/multimedia/event-workshop.svg'
    );

    insertEvent.run(
      'Fórum Nacional de Ciências Sociais e Governação Pública',
      '2026-04-05',
      '08:30 - 17:00',
      'Campus ACITE & Transmissão Online',
      'Debate alargado com decisores políticos, economistas e sociólogos sobre os desafios do planeamento territorial e crescimento inclusivo.',
      'Fórum Nacional',
      '#inscricao-forum',
      '/multimedia/event-forum.svg'
    );
  }

  // Seed Publications / Books if empty
  const pubCount = db.prepare('SELECT COUNT(*) as count FROM publications').get() as { count: number };
  if (pubCount.count === 0) {
    const insertPub = db.prepare(`
      INSERT INTO publications (title, authors, year, publication_type, abstract, download_url, cover_url, isbn)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPub.run(
      'Desenvolvimento Sustentável e Transformação Digital em Angola: Perspectivas e Desafios',
      'Prof. Doutor António Manuel & Equipa de Investigação ACITE',
      2025,
      'Livro Científico',
      'Obra de referência multidisciplinar que analisa os pilares da digitalização económica, infraestruturas energéticas e inclusão social no contexto angolano.',
      '#',
      '/multimedia/book-sustentabilidade.svg',
      '978-989-123-456-7'
    );

    insertPub.run(
      'Manual de Investigação Científica nas Ciências Sociais e Tecnológicas',
      'Corpo Docente do Conselho Científico da ACITE',
      2024,
      'Manual Académico',
      'Guia prático e metodológico para elaboração de projetos de tese, dissertações e artigos com normas de redação e ética científica.',
      '#',
      '/multimedia/book-manual.svg',
      '978-989-987-654-3'
    );
  }

  // Seed Features ("Porquê escolher a ACITE?")
  const featCount = db.prepare('SELECT COUNT(*) as count FROM features').get() as { count: number };
  if (featCount.count === 0) {
    const insertFeat = db.prepare(`
      INSERT INTO features (step_number, title, description, order_index)
      VALUES (?, ?, ?, ?)
    `);

    insertFeat.run('01', 'Corpo Docente de Alto Nível', 'Mais de 85% do nosso corpo docente é composto por Doutores e Mestres com ampla experiência académica internacional e notoriedade profissional.', 1);
    insertFeat.run('02', 'Investigação Aplicada ao País', 'Os nossos programas de pesquisa concentram-se na resolução de problemas reais de Angola e de África nas áreas de engenharia, governação e inovação.', 2);
    insertFeat.run('03', 'Infraestrutura Tecnológica Moderna', 'Laboratórios de computação avançada, biblioteca digital com acesso a bases mundiais e salas equipadas para ensino presencial e remoto.', 3);
    insertFeat.run('04', 'Rede de Parcerias Globais', 'Convénios ativos com universidades e centros de pesquisa de Portugal, Brasil, Reino Unido e África do Sul para cotutela e mobilidade.', 4);
  }

  // Seed Institutional Pages
  const pagesCount = db.prepare('SELECT COUNT(*) as count FROM pages').get() as { count: number };
  if (pagesCount.count === 0) {
    const insertPage = db.prepare(`
      INSERT INTO pages (slug, title, content, meta_description)
      VALUES (?, ?, ?, ?)
    `);

    insertPage.run(
      'sobre',
      'Sobre a ACITE',
      'A Academia de Ciências Sociais e Tecnologias (ACITE) é uma Instituição de Ensino Superior Pública de Altos Estudos vocacionada para a formação pós-graduada de excelência, a investigação científica e a extensão universitária.\n\nLocalizada em Luanda, Angola, a ACITE assume o compromisso de capacitar quadros superiores para responderem aos desafios complexos do desenvolvimento económico, social e tecnológico da nação.',
      'Conheça a história, missão e propósitos da ACITE em Angola.'
    );

    insertPage.run(
      'missao-visao',
      'Missão, Visão e Valores',
      '### Missão\nProduzir e disseminar conhecimento científico de fronteira, formar líderes e investigadores éticos e inovadores que impulsionem a transformação da sociedade angolana e africana.\n\n### Visão\nSer uma instituição de altos estudos de referência em África e no mundo lusófono, reconhecida pelo rigor científico, inovação tecnológica e impacto das suas pesquisas.\n\n### Valores\n- Excelência Académica e Rigor Científico\n- Ética, Transparência e Responsabilidade Social\n- Inovação e Pensamento Crítico\n- Valorização do Mérito e Inclusão',
      'Os princípios orientadores da Academia de Ciências Sociais e Tecnologias.'
    );
  }

  // --- AUTOMATIC DATABASE MIGRATION & MULTIMEDIA SYNC ---
  // Ensure existing database rows use local /multimedia images so the website never opens blank
  try {
    // 1. Hero Slides migration
    db.prepare(`UPDATE hero_slides SET image_url = '/multimedia/hero-slide-1.svg' WHERE order_index = 1 OR image_url LIKE '%unsplash%'`).run();
    db.prepare(`UPDATE hero_slides SET image_url = '/multimedia/hero-slide-2.svg' WHERE order_index = 2`).run();

    // 2. Courses migration
    db.prepare(`UPDATE courses SET image_url = '/multimedia/course-ia.svg' WHERE slug = 'doutoramento-computacao-ia'`).run();
    db.prepare(`UPDATE courses SET image_url = '/multimedia/course-politicas.svg' WHERE slug = 'doutoramento-politicas-publicas'`).run();
    db.prepare(`UPDATE courses SET image_url = '/multimedia/course-software.svg' WHERE slug = 'mestrado-engenharia-software'`).run();
    db.prepare(`UPDATE courses SET image_url = '/multimedia/course-gestao.svg' WHERE slug = 'mestrado-gestao-estrategica'`).run();
    db.prepare(`UPDATE courses SET image_url = '/multimedia/course-ciberseguranca.svg' WHERE slug = 'especializacao-ciberseguranca'`).run();
    db.prepare(`UPDATE courses SET image_url = '/multimedia/course-ingles.svg' WHERE slug = 'ingles-academico-cientifico'`).run();
    db.prepare(`UPDATE courses SET image_url = '/multimedia/default-academic.svg' WHERE image_url LIKE '%unsplash%' OR image_url = '' OR image_url IS NULL`).run();

    // 3. News migration
    db.prepare(`UPDATE news SET image_url = '/multimedia/news-conferencia.svg' WHERE slug = 'conferencia-internacional-ia-africa'`).run();
    db.prepare(`UPDATE news SET image_url = '/multimedia/news-abertura.svg' WHERE slug = 'abertura-solene-ano-academico-2026'`).run();
    db.prepare(`UPDATE news SET image_url = '/multimedia/news-memorando.svg' WHERE slug = 'memorando-cooperacao-internacional'`).run();
    db.prepare(`UPDATE news SET image_url = '/multimedia/default-academic.svg' WHERE image_url LIKE '%unsplash%' OR image_url = '' OR image_url IS NULL`).run();

    // 4. Events migration
    db.prepare(`UPDATE events SET image_url = '/multimedia/event-workshop.svg' WHERE title LIKE '%Workshop%'`).run();
    db.prepare(`UPDATE events SET image_url = '/multimedia/event-forum.svg' WHERE title LIKE '%Fórum%'`).run();
    db.prepare(`UPDATE events SET image_url = '/multimedia/default-academic.svg' WHERE image_url LIKE '%unsplash%' OR image_url = '' OR image_url IS NULL`).run();

    // 5. Publications migration
    db.prepare(`UPDATE publications SET cover_url = '/multimedia/book-sustentabilidade.svg' WHERE title LIKE '%Desenvolvimento Sustentável%'`).run();
    db.prepare(`UPDATE publications SET cover_url = '/multimedia/book-manual.svg' WHERE title LIKE '%Manual%'`).run();
    db.prepare(`UPDATE publications SET cover_url = '/multimedia/default-academic.svg' WHERE cover_url LIKE '%unsplash%' OR cover_url = '' OR cover_url IS NULL`).run();

    // 6. Register local multimedia assets in the media_library table
    const multimediaFiles = [
      { filename: 'acite-logo.svg', original_name: 'Logótipo Oficial ACITE.svg', url: '/multimedia/acite-logo.svg', mimetype: 'image/svg+xml', size: 1200 },
      { filename: 'hero-slide-1.svg', original_name: 'Banner Principal Campus.svg', url: '/multimedia/hero-slide-1.svg', mimetype: 'image/svg+xml', size: 2800 },
      { filename: 'hero-slide-2.svg', original_name: 'Banner Candidaturas Abertas.svg', url: '/multimedia/hero-slide-2.svg', mimetype: 'image/svg+xml', size: 2800 },
      { filename: 'course-ia.svg', original_name: 'Doutoramento em IA e Computação.svg', url: '/multimedia/course-ia.svg', mimetype: 'image/svg+xml', size: 2400 },
      { filename: 'course-politicas.svg', original_name: 'Doutoramento Políticas Públicas.svg', url: '/multimedia/course-politicas.svg', mimetype: 'image/svg+xml', size: 2400 },
      { filename: 'course-software.svg', original_name: 'Mestrado Engenharia Software.svg', url: '/multimedia/course-software.svg', mimetype: 'image/svg+xml', size: 2400 },
      { filename: 'course-gestao.svg', original_name: 'Mestrado Gestão Estratégica.svg', url: '/multimedia/course-gestao.svg', mimetype: 'image/svg+xml', size: 2400 },
      { filename: 'course-ciberseguranca.svg', original_name: 'Especialização Cibersegurança.svg', url: '/multimedia/course-ciberseguranca.svg', mimetype: 'image/svg+xml', size: 2400 },
      { filename: 'course-ingles.svg', original_name: 'Inglês Académico e Científico.svg', url: '/multimedia/course-ingles.svg', mimetype: 'image/svg+xml', size: 2400 },
      { filename: 'news-conferencia.svg', original_name: 'Notícia Conferência Internacional IA.svg', url: '/multimedia/news-conferencia.svg', mimetype: 'image/svg+xml', size: 2400 },
      { filename: 'news-abertura.svg', original_name: 'Notícia Abertura Ano Académico.svg', url: '/multimedia/news-abertura.svg', mimetype: 'image/svg+xml', size: 2400 },
      { filename: 'news-memorando.svg', original_name: 'Notícia Memorando de Cooperação.svg', url: '/multimedia/news-memorando.svg', mimetype: 'image/svg+xml', size: 2400 },
      { filename: 'event-workshop.svg', original_name: 'Workshop Publicação Scopus.svg', url: '/multimedia/event-workshop.svg', mimetype: 'image/svg+xml', size: 2400 },
      { filename: 'event-forum.svg', original_name: 'Fórum Nacional Ciências Sociais.svg', url: '/multimedia/event-forum.svg', mimetype: 'image/svg+xml', size: 2400 },
      { filename: 'book-sustentabilidade.svg', original_name: 'Capa Livro Sustentabilidade & Digital.svg', url: '/multimedia/book-sustentabilidade.svg', mimetype: 'image/svg+xml', size: 2600 },
      { filename: 'book-manual.svg', original_name: 'Capa Manual Investigação Científica.svg', url: '/multimedia/book-manual.svg', mimetype: 'image/svg+xml', size: 2600 },
      { filename: 'default-academic.svg', original_name: 'Emblema Padrão ACITE.svg', url: '/multimedia/default-academic.svg', mimetype: 'image/svg+xml', size: 1400 },
    ];

    const insertMediaStmt = db.prepare(`
      INSERT INTO media_library (filename, original_name, url, mimetype, size)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of multimediaFiles) {
      const exists = db.prepare('SELECT id FROM media_library WHERE url = ? OR filename = ?').get(item.url, item.filename);
      if (!exists) {
        insertMediaStmt.run(item.filename, item.original_name, item.url, item.mimetype, item.size);
      }
    }
  } catch (syncErr) {
    console.error('⚠️ Multimedia migration note:', syncErr);
  }

  console.log('✅ ACITE SQLite Database successfully initialized and seeded!');
}

export { db, runAutoMigrations, getDatabaseDiagnostics, executeCustomSchemaUpdate };
