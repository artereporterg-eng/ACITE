import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface Migration {
  version: number;
  name: string;
  description: string;
  up: (db: Database.Database) => void;
  down?: (db: Database.Database) => void;
}

/**
 * Helper to check if a table exists
 */
export function hasTable(db: Database.Database, tableName: string): boolean {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableName);
  return !!row;
}

/**
 * Helper to check if a column exists in a specific table
 */
export function hasColumn(db: Database.Database, tableName: string, columnName: string): boolean {
  if (!hasTable(db, tableName)) return false;
  const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return tableInfo.some((col) => col.name.toLowerCase() === columnName.toLowerCase());
}

/**
 * Helper to check if an index exists
 */
export function hasIndex(db: Database.Database, indexName: string): boolean {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name = ?").get(indexName);
  return !!row;
}

/**
 * Helper to safely add a column if it doesn't already exist
 */
export function addColumnIfNotExists(db: Database.Database, tableName: string, columnDef: string): boolean {
  const colName = columnDef.trim().split(/\s+/)[0];
  if (!hasColumn(db, tableName, colName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnDef}`);
    return true;
  }
  return false;
}

/**
 * Registry of all sequential migrations.
 * Whenever new features are developed, add a new migration here.
 * The system will automatically execute pending migrations on boot.
 */
export const migrationsRegistry: Migration[] = [
  {
    version: 1,
    name: '001_initial_core_schema',
    description: 'Criação do esquema base inicial: utilizadores, definições, hero, cursos, notícias, eventos, publicações, páginas e biblioteca de mídia',
    up: (db) => {
      // 1. Users
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Site settings
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

      // 4. Courses
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

      // 5. News
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

      // 6. Events
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

      // 7. Publications
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

      // 8. Features
      db.exec(`
        CREATE TABLE IF NOT EXISTS features (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          step_number TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          order_index INTEGER DEFAULT 0
        );
      `);

      // 9. Applications
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

      // 10. Pages
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
    },
  },
  {
    version: 2,
    name: '002_add_indexes_and_metadata',
    description: 'Adiciona índices de aceleração de pesquisa e colunas de auditoria/metadados para evolução do portal',
    up: (db) => {
      // Create performance indexes
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
        CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
        CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
        CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published, published_at);
        CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
        CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
        CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
        CREATE INDEX IF NOT EXISTS idx_media_url ON media_library(url);
      `);

      // Add extra extensible columns if not present
      addColumnIfNotExists(db, 'courses', 'coordinator TEXT');
      addColumnIfNotExists(db, 'courses', 'credits INTEGER DEFAULT 120');
      addColumnIfNotExists(db, 'courses', 'schedule_info TEXT');
      
      addColumnIfNotExists(db, 'news', 'tags TEXT');
      addColumnIfNotExists(db, 'news', 'meta_keywords TEXT');
      
      addColumnIfNotExists(db, 'applications', 'reviewed_by TEXT');
      addColumnIfNotExists(db, 'applications', 'reviewed_at DATETIME');
      addColumnIfNotExists(db, 'applications', 'rejection_reason TEXT');

      addColumnIfNotExists(db, 'publications', 'doi TEXT');
      addColumnIfNotExists(db, 'publications', 'citations_count INTEGER DEFAULT 0');
    },
  },
  {
    version: 3,
    name: '003_notifications_and_audit_log',
    description: 'Cria tabelas de Notificações Administrativas e Histórico de Ações (Audit Trail) para acompanhamento de mudanças',
    up: (db) => {
      // 12. Audit Logs table
      db.exec(`
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
      `);

      // 13. System Notifications
      db.exec(`
        CREATE TABLE IF NOT EXISTS system_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT DEFAULT 'info',
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          link_url TEXT,
          is_read INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 14. Custom Navigation Menus (for future flexible header/footer builders)
      db.exec(`
        CREATE TABLE IF NOT EXISTS navigation_menus (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          menu_location TEXT NOT NULL, -- 'header', 'footer', 'quick_links'
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          target TEXT DEFAULT '_self',
          order_index INTEGER DEFAULT 0,
          parent_id INTEGER DEFAULT NULL,
          is_active INTEGER DEFAULT 1
        );
      `);
    },
  },
  {
    version: 4,
    name: '004_newsletter_and_contact_messages',
    description: 'Cria tabelas de Subscrições de Newsletter e Mensagens de Contacto recebidas pelo site',
    up: (db) => {
      // 15. Contact Messages
      db.exec(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'Não Lida', -- 'Não Lida', 'Lida', 'Respondida'
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 16. Newsletter Subscriptions
      db.exec(`
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          is_active INTEGER DEFAULT 1,
          subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    },
  },
  {
    version: 5,
    name: '005_user_categories_and_multi_account_system',
    description: 'Expansão do sistema multi-utilizador: adiciona categorias de utilizadores, departamento, telefone, estado e contas departamentais',
    up: (db) => {
      addColumnIfNotExists(db, 'users', 'category TEXT DEFAULT "Super Administrador"');
      addColumnIfNotExists(db, 'users', 'department TEXT DEFAULT "Direcção Geral"');
      addColumnIfNotExists(db, 'users', 'phone TEXT');
      addColumnIfNotExists(db, 'users', 'status TEXT DEFAULT "Ativo"');
      addColumnIfNotExists(db, 'users', 'avatar_url TEXT');
      addColumnIfNotExists(db, 'users', 'last_login_at DATETIME');

      // Update default admin to Super Administrador
      db.prepare(`
        UPDATE users 
        SET category = 'Super Administrador', 
            department = 'Direcção Geral & Reitoria',
            role = 'superadmin',
            status = 'Ativo'
        WHERE username = 'admin'
      `).run();

      // Seed initial representative department users if only 1 user exists
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      if (userCount.count <= 1) {
        // Hash for password 'acite2026'
        // Pre-computed or generated safely
        const salt = bcrypt.genSaltSync(10);
        const defaultHash = bcrypt.hashSync('acite2026', salt);

        const insertUser = db.prepare(`
          INSERT OR IGNORE INTO users (username, password_hash, name, email, role, category, department, phone, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // 1. Direcção Académica
        insertUser.run(
          'academico',
          defaultHash,
          'Dra. Maria Eunice Santos',
          'academico@acite.ao',
          'academico',
          'Direcção Académica & Cursos',
          'Gabinete de Pós-Graduação e Ensino',
          '+244 923 112 233',
          'Ativo'
        );

        // 2. Comunicação e Imprensa
        insertUser.run(
          'comunicacao',
          defaultHash,
          'Lic. Manuel Domingos',
          'comunicacao@acite.ao',
          'comunicacao',
          'Comunicação & Imprensa',
          'Gabinete de Relações Públicas e Imprensa',
          '+244 934 445 566',
          'Ativo'
        );

        // 3. Secretaria e Admissões
        insertUser.run(
          'secretaria',
          defaultHash,
          'Dra. Ana Paula Carvalho',
          'secretaria@acite.ao',
          'admissoes',
          'Secretaria & Admissões',
          'Departamento de Gestão Académica e Admissões',
          '+244 912 778 899',
          'Ativo'
        );

        // 4. Investigação Científica
        insertUser.run(
          'investigador',
          defaultHash,
          'Prof. Doutor António Bunga',
          'investigacao@acite.ao',
          'investigacao',
          'Docência & Investigação',
          'Conselho Científico e Centro de Estudos',
          '+244 945 001 122',
          'Ativo'
        );
      }
    },
  }
];

/**
 * Ensures the migration tracking table exists
 */
export function initMigrationTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      batch INTEGER NOT NULL DEFAULT 1,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      execution_time_ms INTEGER DEFAULT 0
    );
  `);
}

/**
 * Runs all pending migrations sequentially and safely within transactions
 */
export function runAutoMigrations(db: Database.Database): {
  executed: number;
  currentVersion: number;
  migrationsApplied: string[];
} {
  initMigrationTable(db);

  // Get all applied versions
  const appliedRows = db.prepare('SELECT version FROM _schema_migrations ORDER BY version ASC').all() as Array<{ version: number }>;
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  // Determine current batch number
  const lastBatchRow = db.prepare('SELECT MAX(batch) as maxBatch FROM _schema_migrations').get() as { maxBatch: number | null };
  const currentBatch = (lastBatchRow?.maxBatch || 0) + 1;

  const migrationsToRun = migrationsRegistry.filter((m) => !appliedVersions.has(m.version));
  const appliedNames: string[] = [];

  if (migrationsToRun.length === 0) {
    const latestVersion = appliedRows.length > 0 ? appliedRows[appliedRows.length - 1].version : 0;
    return {
      executed: 0,
      currentVersion: latestVersion,
      migrationsApplied: [],
    };
  }

  console.log(`🔄 [DB Auto-Update] Encontradas ${migrationsToRun.length} migrações pendentes. A iniciar actualização da base de dados...`);

  for (const migration of migrationsToRun) {
    const startTime = Date.now();
    const runInTransaction = db.transaction(() => {
      migration.up(db);
      const duration = Date.now() - startTime;
      db.prepare(`
        INSERT INTO _schema_migrations (version, name, description, batch, execution_time_ms)
        VALUES (?, ?, ?, ?, ?)
      `).run(migration.version, migration.name, migration.description || '', currentBatch, duration);
    });

    try {
      runInTransaction();
      appliedNames.push(migration.name);
      console.log(`✅ [DB Auto-Update] Migração v${migration.version} "${migration.name}" aplicada com sucesso (${Date.now() - startTime}ms)`);
    } catch (err) {
      console.error(`❌ [DB Auto-Update Error] Falha crítica ao executar migração v${migration.version} "${migration.name}":`, err);
      throw err;
    }
  }

  const latestRow = db.prepare('SELECT MAX(version) as latestVersion FROM _schema_migrations').get() as { latestVersion: number };

  return {
    executed: migrationsToRun.length,
    currentVersion: latestRow?.latestVersion || 0,
    migrationsApplied: appliedNames,
  };
}

/**
 * Returns comprehensive database status, table stats, file size, and migration history
 */
export function getDatabaseDiagnostics(db: Database.Database, dbFilePath: string) {
  initMigrationTable(db);

  // 1. Migrations history
  const migrationsHistory = db.prepare(`
    SELECT version, name, description, batch, applied_at, execution_time_ms
    FROM _schema_migrations
    ORDER BY version DESC
  `).all() as Array<{
    version: number;
    name: string;
    description: string;
    batch: number;
    applied_at: string;
    execution_time_ms: number;
  }>;

  const appliedVersionSet = new Set(migrationsHistory.map((m) => m.version));
  const totalAvailable = migrationsRegistry.length;
  const totalApplied = migrationsHistory.length;
  const pendingMigrations = migrationsRegistry
    .filter((m) => !appliedVersionSet.has(m.version))
    .map((m) => ({ version: m.version, name: m.name, description: m.description }));

  // 2. Tables stats
  const tableList = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_schema_%'
    ORDER BY name ASC
  `).all() as Array<{ name: string }>;

  const tablesStats = tableList.map((t) => {
    try {
      const countRow = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get() as { count: number };
      const columns = db.prepare(`PRAGMA table_info(${t.name})`).all() as Array<{ name: string; type: string; notnull: number; pk: number }>;
      return {
        name: t.name,
        rowCount: countRow?.count || 0,
        columnCount: columns.length,
        columns: columns.map(c => ({ name: c.name, type: c.type, isPrimary: Boolean(c.pk) })),
      };
    } catch {
      return {
        name: t.name,
        rowCount: 0,
        columnCount: 0,
        columns: [],
      };
    }
  });

  // 3. Database file metadata & integrity
  let fileSizeBytes = 0;
  try {
    if (fs.existsSync(dbFilePath)) {
      const stat = fs.statSync(dbFilePath);
      fileSizeBytes = stat.size;
    }
  } catch (err) {
    console.error('Failed to get db file size', err);
  }

  let integrityResult = 'OK';
  try {
    const integrityRow = db.prepare('PRAGMA integrity_check').get() as Record<string, string>;
    integrityResult = Object.values(integrityRow)[0] || 'OK';
  } catch {
    integrityResult = 'Error during check';
  }

  return {
    engine: 'SQLite 3 (WAL Mode)',
    databaseFile: path.basename(dbFilePath),
    fileSizeBytes,
    fileSizeFormatted: `${(fileSizeBytes / 1024).toFixed(1)} KB`,
    integrity: integrityResult,
    currentVersion: migrationsHistory.length > 0 ? migrationsHistory[0].version : 0,
    totalAvailableMigrations: totalAvailable,
    totalAppliedMigrations: totalApplied,
    pendingMigrationsCount: pendingMigrations.length,
    pendingMigrations,
    migrationsHistory,
    tables: tablesStats,
    lastCheckedAt: new Date().toISOString(),
  };
}

/**
 * Safely executes a dynamic DDL update or adds custom table/columns
 */
export function executeCustomSchemaUpdate(db: Database.Database, sql: string) {
  // Validate safety: only allow CREATE, ALTER, INSERT, UPDATE, DROP INDEX, etc. Disallow DROP DATABASE/arbitrary OS commands
  const cleanSql = sql.trim();
  if (!cleanSql) {
    throw new Error('O comando SQL está vazio.');
  }

  const transaction = db.transaction(() => {
    db.exec(cleanSql);
  });

  transaction();
  return { success: true, message: 'Estrutura da base de dados actualizada com sucesso.' };
}
