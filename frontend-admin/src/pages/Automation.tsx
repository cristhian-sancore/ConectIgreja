import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Zap,
  CheckCircle2,
  XCircle,
  Send,
  Save,
  QrCode,
  Building2,
  Plus,
  RefreshCw,
  Phone,
  Sparkles,
  Shield,
} from 'lucide-react';

interface AutomationPageProps {
  churches: any[];
  currentSelectedChurchId?: string;
  onSelectChurch?: (id: string) => void;
  currentUser?: {
    name: string;
    role: string;
    title: string;
    email?: string;
  };
}

export const Automation: React.FC<AutomationPageProps> = ({
  churches = [],
  currentSelectedChurchId,
  onSelectChurch,
  currentUser = {
    name: 'Cristhian Sancore',
    role: 'SUPER_ADMIN_ESTADUAL',
    title: 'Super Administrador Estadual',
  },
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN_ESTADUAL' || currentUser.role === 'SUPER_ADMIN';

  // Igreja/Cidade ativa para configuração da Evolution
  const [activeChurchId, setActiveChurchId] = useState<string>(
    currentSelectedChurchId || churches[0]?.id || ''
  );

  const [config, setConfig] = useState<any>({
    evolutionUrl: 'https://api.cristhiansancore.com.br',
    evolutionApiKey: 'EAC94E310E46-4D87-8AAD-4262C45AF665',
    instanceName: '',
    instancePhone: '',
    instanceStatus: 'close',
    whatsappGroups: '[]',
    notifyBirthdays: true,
    notifyBaptisms: true,
    notifySchedules: true,
    birthdayTemplate: '',
    baptismTemplate: '',
    scheduleTemplate: '',
  });

  const [connectionStatus, setConnectionStatus] = useState<string>('verificando...');
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Graça e Paz! Mensagem de teste enviada pela Evolution API da nossa igreja.');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modal de Criação de Instância
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [creatingInstance, setCreatingInstance] = useState(false);

  // Modal de QR Code para Conectar WhatsApp
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const selectedChurch = churches.find((c) => c.id === activeChurchId) || churches[0];

  // Carrega configurações da igreja selecionada
  const loadConfig = async () => {
    if (!activeChurchId) return;

    try {
      const res = await fetch(`/api/automation/config/${activeChurchId}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);

        // Checa status de conexão da instância dessa igreja
        if (data.instanceName) {
          checkStatus(data.instanceName, data.evolutionUrl, data.evolutionApiKey);
        } else {
          setConnectionStatus('sem_instancia');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkStatus = async (instanceName: string, url: string, apiKey: string) => {
    setConnectionStatus('verificando...');
    try {
      const res = await fetch(`/api/automation/status?instance=${instanceName}&url=${encodeURIComponent(url)}&apiKey=${apiKey}`);
      const data = await res.json();
      if (data.success && data.data?.instance?.state) {
        setConnectionStatus(data.data.instance.state);
      } else {
        setConnectionStatus('offline');
      }
    } catch {
      setConnectionStatus('offline');
    }
  };

  useEffect(() => {
    loadConfig();
  }, [activeChurchId]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChurchId) return;

    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch(`/api/automation/config/${activeChurchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify({ ...config, userRole: currentUser.role }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        const data = await res.json();
        alert(`Aviso: ${data.error || 'Erro ao salvar configurações'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstanceName.trim() || !activeChurchId) return;

    setCreatingInstance(true);
    try {
      const res = await fetch('/api/automation/instances/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify({
          churchId: activeChurchId,
          instanceName: newInstanceName.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
          userRole: currentUser.role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setNewInstanceName('');
        alert('Instância criada na Evolution API! Agora conecte o WhatsApp via QR Code.');
        loadConfig();
      } else {
        alert(`Aviso: ${data.error || 'Erro ao criar instância'}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setCreatingInstance(false);
    }
  };

  const handleConnectQr = async () => {
    if (!activeChurchId) return;

    setIsQrModalOpen(true);
    setLoadingQr(true);
    setQrCodeData(null);

    try {
      const res = await fetch(`/api/automation/instances/connect/${activeChurchId}`);
      const data = await res.json();
      if (data.success) {
        setQrCodeData(data.data);
      } else {
        alert(`Aviso: ${data.error || 'Não foi possível gerar o QR Code no momento.'}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setLoadingQr(false);
    }
  };

  const handleSendTest = async () => {
    if (!testNumber.trim()) {
      alert('Informe o número com DDD (ex: 5511999999999)');
      return;
    }

    setTesting(true);
    try {
      const res = await fetch('/api/automation/test-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: testNumber,
          text: testMessage,
          churchId: activeChurchId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Mensagem de teste enviada com sucesso pelo número exclusivo desta cidade!');
      } else {
        alert(`Erro no envio: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleTriggerDaily = async () => {
    try {
      const res = await fetch('/api/automation/trigger-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId: activeChurchId }),
      });
      const data = await res.json();
      alert(`Processamento da cidade ${selectedChurch?.name} concluído: ${data.count} mensagens enviadas.`);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      {/* Banner de Controle de Permissão - Super Admin */}
      {isSuperAdmin ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl border border-amber-500/40 shadow-inner shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Acesso Exclusivo de Super Admin Ativo
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentUser.name}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Apenas você possui autorização total para cadastrar, configurar e conectar as instâncias da Evolution API em todas as igrejas e cidades do estado.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setNewInstanceName(`igreja-${selectedChurch?.city ? selectedChurch.city.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'filial'}`);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            Cadastrar Nova Instância
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3.5 shadow-xl">
          <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-2xl border border-rose-500/40 shrink-0">
            🔒
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                Acesso Restrito: Cadastro de Instâncias Bloqueado
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                {currentUser.title}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              O cadastro de novas instâncias da Evolution API é exclusivo do <strong>Super Admin</strong>. Como pastor local, você pode apenas visualizar e sincronizar o WhatsApp da sua filial.
            </p>
          </div>
        </div>
      )}

      {/* Topo com Seletor da Cidade / Congregação */}
      <div className="p-5 rounded-2xl admin-card border border-indigo-500/30 bg-indigo-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Gestão Estadual de WhatsApp (Multi-Instância)
          </span>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
            WhatsApp Exclusivo por Cidade
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Cada igreja municipal tem seu próprio número de WhatsApp, grupos e robô de atendimento.
          </p>
        </div>

        {/* Dropdown de Cidade / Igreja */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <select
            value={activeChurchId}
            onChange={(e) => setActiveChurchId(e.target.value)}
            className="bg-slate-900 text-xs font-bold text-white px-3.5 py-2.5 rounded-xl border border-indigo-500/40 focus:outline-none focus:border-indigo-400 cursor-pointer shadow-lg"
          >
            {churches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.city || 'Cidade'}) {c.isMain ? '★ Sede' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Card da Instância da Cidade Selecionada */}
      <div className="p-6 rounded-2xl admin-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <MessageSquare className="w-7 h-7" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-base font-bold text-white">
                {selectedChurch?.name}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  connectionStatus === 'open'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : connectionStatus === 'connecting'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {connectionStatus === 'open' ? 'WhatsApp Conectado' : connectionStatus}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
              <span>Instância: <strong className="text-white">{config.instanceName || 'Nenhuma'}</strong></span>
              {config.instancePhone && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Phone className="w-3.5 h-3.5" />
                  {config.instancePhone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ações de Instância */}
        <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
          {isSuperAdmin ? (
            <button
              onClick={() => {
                setNewInstanceName(`igreja-${selectedChurch?.city ? selectedChurch.city.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'filial'}`);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all hover:scale-102"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              Nova Instância
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-slate-500 text-xs font-semibold border border-slate-800 cursor-not-allowed select-none"
              title="Apenas o Super Admin tem permissão para cadastrar novas instâncias"
            >
              <Shield className="w-3.5 h-3.5 text-slate-600" />
              <span>Instância Exclusiva Super Admin</span>
            </div>
          )}

          <button
            onClick={handleConnectQr}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            Conectar / QR Code
          </button>

          <button
            onClick={handleTriggerDaily}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
            title="Disparar felicitações para aniversariantes desta congregação agora"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            Disparar Aniversários
          </button>
        </div>
      </div>

      {/* Teste de Envio com o Número da Cidade */}
      <div className="p-6 rounded-2xl admin-card border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-400" />
          Testar Disparo com o Número de {selectedChurch?.name}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          A mensagem será enviada a partir da instância exclusiva desta cidade ({config.instanceName}).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp de Destino</label>
            <input
              type="text"
              placeholder="5511999999999"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono"
            />
          </div>
          <div className="sm:col-span-2 flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Texto de Teste</label>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
              />
            </div>
            <button
              onClick={handleSendTest}
              disabled={testing}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow shrink-0 disabled:opacity-50"
            >
              {testing ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>

      {/* Configuração dos Dados da Instância e Templates */}
      <div className="p-6 rounded-2xl admin-card border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Parâmetros da Conexão & Modelos de Mensagem de {selectedChurch?.city || selectedChurch?.name}
            </h3>
            <span className="text-xs text-slate-400">
              Personalize o nome da instância, número e templates para esta congregação.
            </span>
          </div>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              Salvo com Sucesso!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Instância *</label>
              <input
                type="text"
                value={config.instanceName}
                onChange={(e) => setConfig({ ...config, instanceName: e.target.value })}
                className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Número Conectado (Identificação)</label>
              <input
                type="text"
                placeholder="Ex: 5519977776666"
                value={config.instancePhone || ''}
                onChange={(e) => setConfig({ ...config, instancePhone: e.target.value })}
                className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>URL da Evolution API</span>
                {!isSuperAdmin && <span className="text-[10px] text-amber-400 font-bold">🔒 Super Admin</span>}
              </label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={config.evolutionUrl}
                onChange={(e) => setConfig({ ...config, evolutionUrl: e.target.value })}
                className={`w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono ${
                  !isSuperAdmin ? 'opacity-60 cursor-not-allowed bg-slate-900/50' : ''
                }`}
              />
            </div>
          </div>

          {/* Template Aniversário */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-amber-300">
                🎂 Template: Aniversário de Nascimento ({selectedChurch?.name})
              </label>
              <span className="text-[10px] text-slate-500 font-mono">&#123;nome&#125;, &#123;igreja&#125;</span>
            </div>
            <textarea
              rows={3}
              value={config.birthdayTemplate}
              onChange={(e) => setConfig({ ...config, birthdayTemplate: e.target.value })}
              className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 text-xs font-mono leading-relaxed"
            />
          </div>

          {/* Template Batismo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-indigo-300">
                🌊 Template: Aniversário de Batismo nas Águas ({selectedChurch?.name})
              </label>
              <span className="text-[10px] text-slate-500 font-mono">&#123;nome&#125;, &#123;igreja&#125;, &#123;anos&#125;</span>
            </div>
            <textarea
              rows={3}
              value={config.baptismTemplate}
              onChange={(e) => setConfig({ ...config, baptismTemplate: e.target.value })}
              className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 text-xs font-mono leading-relaxed"
            />
          </div>

          {/* Template Agenda */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-emerald-300">
                📢 Template: Programação dos Cultos nos Grupos da Cidade
              </label>
              <span className="text-[10px] text-slate-500 font-mono">&#123;igreja&#125;, &#123;eventos&#125;, &#123;endereco&#125;</span>
            </div>
            <textarea
              rows={3}
              value={config.scheduleTemplate}
              onChange={(e) => setConfig({ ...config, scheduleTemplate: e.target.value })}
              className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 text-xs font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar Alterações desta Cidade'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal Criar Instância */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-white mb-2">
              Criar Instância na Evolution API
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Cada cidade terá sua própria instância e número do WhatsApp para atender a congregação.
            </p>

            <form onSubmit={handleCreateInstance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Instância (sem espaços ou acentos) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: igreja-campinas"
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingInstance}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  {creatingInstance ? 'Criando na API...' : 'Criar Instância'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp text-center">
            <h3 className="text-base font-bold text-white mb-1">
              Conectar WhatsApp: {selectedChurch?.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Abra o WhatsApp no aparelho desta cidade, vá em <strong>Aparelhos Conectados</strong> e aponte para a tela:
            </p>

            {loadingQr ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <span className="text-xs text-slate-400">Solicitando QR Code à Evolution API...</span>
              </div>
            ) : qrCodeData?.base64 ? (
              <div className="p-4 bg-white rounded-2xl inline-block mx-auto mb-4 shadow-xl">
                <img
                  src={qrCodeData.base64}
                  alt="QR Code WhatsApp"
                  className="w-64 h-64 mx-auto object-contain"
                />
              </div>
            ) : qrCodeData?.pairingCode ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 mb-4">
                <span className="text-xs text-slate-400 block mb-1">Código de Pareamento:</span>
                <span className="text-2xl font-black text-amber-400 font-mono tracking-widest">
                  {qrCodeData.pairingCode}
                </span>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs mb-4">
                Instância conectada ou aguardando status. Verifique se o aparelho já está autenticado!
              </div>
            )}

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Fechar
              </button>
              <button
                onClick={handleConnectQr}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Atualizar QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
