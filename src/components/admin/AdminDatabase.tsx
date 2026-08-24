import React, { useState, useEffect, FormEvent } from 'react';
import { 
  fetchDatabaseDiagnostics, 
  triggerDatabaseMigration, 
  optimizeDatabase, 
  executeCustomSchema,
  getDatabaseBackupUrl 
} from '../../services/api';
import { DatabaseDiagnostics } from '../../types';
import { 
  Database, 
  RefreshCw, 
  Zap, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  HardDrive, 
  Layers, 
  Table, 
  Code, 
  Play, 
  AlertCircle,
  Sparkles,
  Info,
  ChevronRight,
  FileCode2
} from 'lucide-react';

export default function AdminDatabase() {
  const [diagnostics, setDiagnostics] = useState<DatabaseDiagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  
  // Custom schema expansion state
  const [customSql, setCustomSql] = useState('');
  const [showSqlEditor, setShowSqlEditor] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchDatabaseDiagnostics();
      setDiagnostics(data);
      if (data.tables.length > 0 && !selectedTable) {
        setSelectedTable(data.tables[0].name);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao carregar dados da base de dados' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunMigrations = async () => {
    try {
      setActionLoading('migrate');
      setMessage(null);
      const res = await triggerDatabaseMigration();
      setMessage({ type: 'success', text: res.message || 'Migrações aplicadas com sucesso!' });
      if (res.diagnostics) {
        setDiagnostics(res.diagnostics);
      } else {
        await loadData();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao executar migrações' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOptimize = async () => {
    try {
      setActionLoading('optimize');
      setMessage(null);
      const res = await optimizeDatabase();
      setMessage({ type: 'success', text: res.message || 'Base de dados optimizada com sucesso!' });
      if (res.diagnostics) {
        setDiagnostics(res.diagnostics);
      } else {
        await loadData();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao optimizar base de dados' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecuteCustomSql = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSql.trim()) return;

    try {
      setActionLoading('customSql');
      setMessage(null);
      const res = await executeCustomSchema(customSql);
      setMessage({ type: 'success', text: res.message || 'Estrutura actualizada com sucesso!' });
      setCustomSql('');
      if (res.diagnostics) {
        setDiagnostics(res.diagnostics);
      } else {
        await loadData();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao executar instrução SQL' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadBackup = () => {
    const token = localStorage.getItem('acite_token');
    const backupUrl = `${getDatabaseBackupUrl()}`;
    
    // Trigger download using an invisible anchor tag
    const link = document.createElement('a');
    link.href = backupUrl;
    link.setAttribute('download', `acite_db_backup_${new Date().toISOString().slice(0, 10)}.db`);
    // Pass auth via fetch and blob download for secure transfer
    fetch(backupUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(response => {
        if (!response.ok) throw new Error('Falha no download da cópia');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setMessage({ type: 'success', text: 'Cópia de segurança (.db) descarregada com sucesso!' });
      })
      .catch(err => {
        setMessage({ type: 'error', text: err.message || 'Erro ao descarregar cópia de segurança' });
      });
  };

  const setSqlTemplate = (templateType: string) => {
    setShowSqlEditor(true);
    if (templateType === 'new_feature_table') {
      setCustomSql(`-- Criar tabela para nova funcionalidade (Exemplo: Bolsas de Estudo)
CREATE TABLE IF NOT EXISTS scholarships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  donor_institution TEXT NOT NULL,
  vacancies INTEGER DEFAULT 5,
  deadline DATE,
  requirements TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_scholarships_active ON scholarships(is_active);`);
    } else if (templateType === 'add_column') {
      setCustomSql(`-- Adicionar nova coluna a uma tabela existente de forma segura
ALTER TABLE news ADD COLUMN video_url TEXT;`);
    } else if (templateType === 'audit_clean') {
      setCustomSql(`-- Limpar registos antigos de auditoria
DELETE FROM audit_logs WHERE created_at < datetime('now', '-90 days');`);
    }
  };

  const activeTableData = diagnostics?.tables.find(t => t.name === selectedTable);

  if (loading && !diagnostics) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center py-16">
        <RefreshCw size={32} className="animate-spin text-acite-blue mx-auto mb-3" />
        <p className="text-gray-600 font-medium">A analisar o motor e esquema da base de dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="text-acite-blue" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Motor de Base de Dados & Auto-Actualização</h2>
          </div>
          <p className="text-sm text-gray-500">
            Sistema de migrações inteligentes que expande e preserva a base de dados automaticamente a cada nova funcionalidade adicionada.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadData}
            disabled={actionLoading !== null}
            className="px-3.5 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            title="Recarregar diagnósticos"
          >
            <RefreshCw size={16} className={actionLoading === 'refresh' ? 'animate-spin' : ''} />
            Recarregar
          </button>

          <button
            onClick={handleRunMigrations}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-acite-blue text-white rounded-md text-sm font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Zap size={16} className={actionLoading === 'migrate' ? 'animate-spin' : ''} />
            {actionLoading === 'migrate' ? 'A Actualizar...' : 'Verificar & Auto-Actualizar'}
          </button>

          <button
            onClick={handleOptimize}
            disabled={actionLoading !== null}
            className="px-3.5 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
            title="Executar VACUUM e optimizar índices"
          >
            <Sparkles size={16} className={actionLoading === 'optimize' ? 'animate-spin' : ''} />
            {actionLoading === 'optimize' ? 'A Optimizar...' : 'Optimizar Base'}
          </button>

          <button
            onClick={handleDownloadBackup}
            className="px-3.5 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-sm"
            title="Fazer download do ficheiro .db completo"
          >
            <Download size={16} />
            Backup (.db)
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center justify-between border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100 underline">
            Fechar
          </button>
        </div>
      )}

      {/* Diagnostic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Versão do Esquema</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-extrabold text-acite-blue">v{diagnostics?.currentVersion || 1}</span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                {diagnostics?.totalAppliedMigrations} Migrações
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-acite-blue flex items-center justify-center">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Integridade & WAL</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-lg font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck size={18} />
                {diagnostics?.integrity || 'OK'}
              </span>
              <span className="text-xs text-gray-500">({diagnostics?.engine})</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tamanho da Base</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-extrabold text-gray-800">{diagnostics?.fileSizeFormatted || '0 KB'}</span>
              <span className="text-xs text-gray-400">{diagnostics?.databaseFile}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <HardDrive size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tabelas do Sistema</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-extrabold text-amber-600">{diagnostics?.tables.length || 0}</span>
              <span className="text-xs text-gray-500">
                {diagnostics?.tables.reduce((acc, t) => acc + t.rowCount, 0)} Registos Totais
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Table size={20} />
          </div>
        </div>
      </div>

      {/* Main Grid: Migrations Timeline + Schema Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): Migrations History and Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Migrations Timeline Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="text-acite-blue" size={18} />
                <h3 className="font-bold text-gray-800 text-base">Histórico de Auto-Migrações Executadas</h3>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                {diagnostics?.migrationsHistory.length} versões aplicadas
              </span>
            </div>

            <div className="p-5">
              <div className="relative border-l-2 border-acite-blue/20 ml-4 space-y-6">
                {diagnostics?.migrationsHistory.map((mig) => (
                  <div key={mig.version} className="relative pl-6">
                    {/* Timeline Node dot */}
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-acite-blue border-2 border-white shadow-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-acite-blue/40 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-acite-blue text-white text-xs font-bold rounded">
                            v{mig.version}
                          </span>
                          <span className="font-mono text-sm font-bold text-gray-800">{mig.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>Lote #{mig.batch}</span>
                          <span>{mig.execution_time_ms}ms</span>
                          <span>{new Date(mig.applied_at).toLocaleString('pt-PT')}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">
                        {mig.description || 'Evolução estrutural automática do esquema relacional.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {diagnostics?.pendingMigrations && diagnostics.pendingMigrations.length > 0 && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">
                      {diagnostics.pendingMigrations.length} Migrações Pendentes Detectadas
                    </h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Clique no botão ao lado para aplicar as alterações de esquema automaticamente.
                    </p>
                  </div>
                  <button
                    onClick={handleRunMigrations}
                    disabled={actionLoading !== null}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-bold hover:bg-amber-700"
                  >
                    Aplicar Pendentes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Custom Schema Expansion Console */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="text-acite-blue" size={18} />
                <h3 className="font-bold text-gray-800 text-base">Consola de Expansão de Esquema (Novas Funcionalidades)</h3>
              </div>
              <button
                onClick={() => setShowSqlEditor(!showSqlEditor)}
                className="text-xs font-semibold text-acite-blue hover:underline"
              >
                {showSqlEditor ? 'Ocultar Editor' : 'Abrir Editor'}
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-600 mb-3">
                Adicione novas tabelas ou colunas à medida que desenvolve novos módulos no portal da ACITE. As alterações são executadas de forma transacional e segura.
              </p>

              {/* Template quick tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-gray-400 self-center">Modelos rápidos:</span>
                <button
                  type="button"
                  onClick={() => setSqlTemplate('new_feature_table')}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors"
                >
                  + Nova Tabela (Ex: Bolsas de Estudo)
                </button>
                <button
                  type="button"
                  onClick={() => setSqlTemplate('add_column')}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors"
                >
                  + Adicionar Coluna (Ex: Vídeo em Notícias)
                </button>
              </div>

              {showSqlEditor && (
                <form onSubmit={handleExecuteCustomSql} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Comando SQL / DDL:
                    </label>
                    <textarea
                      rows={5}
                      value={customSql}
                      onChange={(e) => setCustomSql(e.target.value)}
                      placeholder="Ex: CREATE TABLE IF NOT EXISTS parceiros (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, logo_url TEXT);"
                      className="w-full font-mono text-sm p-3 bg-gray-900 text-emerald-400 rounded-lg border border-gray-700 focus:ring-2 focus:ring-acite-blue focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomSql('')}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading === 'customSql' || !customSql.trim()}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                    >
                      <Play size={14} />
                      {actionLoading === 'customSql' ? 'A Executar...' : 'Executar Instrução SQL'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Tables & Column Schema Explorer */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="text-acite-blue" size={16} />
                <h3 className="font-bold text-gray-800 text-sm">Explorador de Tabelas ({diagnostics?.tables.length})</h3>
              </div>
            </div>

            <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-100">
              {diagnostics?.tables.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTable(t.name)}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-xs transition-colors ${
                    selectedTable === t.name ? 'bg-blue-50 text-acite-blue font-bold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode2 size={14} className={selectedTable === t.name ? 'text-acite-blue' : 'text-gray-400'} />
                    <span className="font-mono">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                      {t.rowCount} {t.rowCount === 1 ? 'linha' : 'linhas'}
                    </span>
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Table Columns Detail */}
          {activeTableData && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-blue-50/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-acite-blue">{activeTableData.name}</span>
                  <span className="text-[11px] text-gray-500">({activeTableData.columnCount} colunas)</span>
                </div>
                <span className="text-[11px] font-bold text-gray-600">
                  {activeTableData.rowCount} registos
                </span>
              </div>

              <div className="p-3 max-h-[300px] overflow-y-auto space-y-1.5">
                {activeTableData.columns.map((col) => (
                  <div key={col.name} className="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-100 text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono font-medium text-gray-800">{col.name}</span>
                      {col.isPrimary && (
                        <span className="px-1 py-0.2 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">
                          PK
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-gray-500 shrink-0 uppercase">{col.type || 'TEXT'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Info Box */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-gray-800">
              <Info size={14} className="text-acite-blue" />
              <span>Como Funciona o Auto-Update</span>
            </div>
            <p>
              Ao adicionar novas entidades ou campos no código (`server/migrations.ts`), a base de dados executa automaticamente as migrações sequenciais no arranque do servidor sem perda de dados.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
