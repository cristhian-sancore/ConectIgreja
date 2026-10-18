import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Zap,
  CheckCircle2,
  XCircle,
  Send,
  Save,
  RotateCcw,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface AutomationPageProps {
  churchId?: string;
}

export const Automation: React.FC<AutomationPageProps> = ({ churchId }) => {
  const [config, setConfig] = useState<any>({
    evolutionUrl: 'https://api.cristhiansancore.com.br',
    evolutionApiKey: 'EAC94E310E46-4D87-8AAD-4262C45AF665',
    instanceName: 'teste',
    whatsappGroups: '[]',
    notifyBirthdays: true,
    notifyBaptisms: true,
    notifySchedules: true,
    birthdayTemplate: '',
    baptismTemplate: '',
    scheduleTemplate: '',
  });

  const [status, setStatus] = useState<string>('verificando...');
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Graça e Paz! Esta é uma mensagem de teste enviada pelo ConectIgreja via Evolution API. 🙏');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Carrega status e configurações
  useEffect(() => {
    async function checkApi() {
      try {
        const res = await fetch('/api/automation/status');
        const data = await res.json();
        if (data.success && data.data?.instance?.state) {
          setStatus(data.data.instance.state);
        } else {
          setStatus('offline');
        }
      } catch {
        setStatus('offline');
      }
    }

    async function loadConfig() {
      if (!churchId) return;
      try {
        const res = await fetch(`/api/automation/config/${churchId}`);
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    checkApi();
    loadConfig();
  }, [churchId]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId) return;

    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch(`/api/automation/config/${churchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testNumber.trim()) {
      alert('Por favor, informe o número de WhatsApp com DDI e DDD (ex: 5511999999999)');
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
          churchId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Mensagem enviada com sucesso no WhatsApp!');
      } else {
        alert(`Falha no envio: ${data.error || 'Erro desconhecido'}`);
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
        body: JSON.stringify({ churchId }),
      });
      const data = await res.json();
      alert(`Processamento concluído: ${data.count} mensagens de aniversário enviadas.`);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      <div>
        <h2 className="text-2xl font-heading font-black text-white tracking-tight">
          Central de Automação & Evolution API (WhatsApp)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Gerenciamento da conexão com o WhatsApp, robô de aniversariantes e modelos de mensagens oficiais.
        </p>
      </div>

      {/* Card de Status da Instância */}
      <div className="p-6 rounded-2xl admin-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Instância: {config.instanceName}</span>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  status === 'open'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {status === 'open' ? 'Conectado (Open)' : status}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono mt-0.5 block truncate max-w-md">
              {config.evolutionUrl}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerDaily}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            Executar Robô Diário Agora
          </button>
        </div>
      </div>

      {/* Teste de Disparo Imediato */}
      <div className="p-6 rounded-2xl admin-card border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-400" />
          Testar Envio Imediato de Mensagem
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Envie uma mensagem de teste para o seu próprio WhatsApp para validar a conexão.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Número com DDD</label>
            <input
              type="text"
              placeholder="Ex: 5511999999999"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs font-mono"
            />
          </div>
          <div className="sm:col-span-2 flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mensagem de Teste</label>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs"
              />
            </div>
            <button
              onClick={handleSendTest}
              disabled={testing}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow shrink-0 disabled:opacity-50"
            >
              {testing ? 'Enviando...' : 'Enviar Teste'}
            </button>
          </div>
        </div>
      </div>

      {/* Configuração de Templates de Mensagens */}
      <div className="p-6 rounded-2xl admin-card border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Modelos de Mensagens Automáticas
            </h3>
            <span className="text-xs text-slate-400">
              Personalize o texto que o robô do WhatsApp enviará aos membros.
            </span>
          </div>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              Configurações Salvas!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-6">
          {/* Template Aniversário de Nascimento */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-amber-300">
                🎂 Template: Aniversário de Nascimento
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Tags disponíveis: &#123;nome&#125;, &#123;igreja&#125;
              </span>
            </div>
            <textarea
              rows={4}
              value={config.birthdayTemplate}
              onChange={(e) => setConfig({ ...config, birthdayTemplate: e.target.value })}
              className="w-full bg-slate-950 text-white p-3.5 rounded-xl border border-slate-800 text-xs font-mono leading-relaxed focus:border-amber-500"
            />
          </div>

          {/* Template Aniversário de Batismo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-indigo-300">
                🌊 Template: Aniversário de Batismo nas Águas
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Tags disponíveis: &#123;nome&#125;, &#123;igreja&#125;, &#123;anos&#125;
              </span>
            </div>
            <textarea
              rows={4}
              value={config.baptismTemplate}
              onChange={(e) => setConfig({ ...config, baptismTemplate: e.target.value })}
              className="w-full bg-slate-950 text-white p-3.5 rounded-xl border border-slate-800 text-xs font-mono leading-relaxed focus:border-indigo-500"
            />
          </div>

          {/* Template Programação para Grupos */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-emerald-300">
                📢 Template: Programação da Semana para Grupos
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Tags disponíveis: &#123;igreja&#125;, &#123;eventos&#125;, &#123;endereco&#125;
              </span>
            </div>
            <textarea
              rows={4}
              value={config.scheduleTemplate}
              onChange={(e) => setConfig({ ...config, scheduleTemplate: e.target.value })}
              className="w-full bg-slate-950 text-white p-3.5 rounded-xl border border-slate-800 text-xs font-mono leading-relaxed focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
