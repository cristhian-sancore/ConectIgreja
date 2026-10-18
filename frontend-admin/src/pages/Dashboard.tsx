import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Home,
  Cake,
  Droplets,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface DashboardProps {
  summary: any;
  birthdays: any;
  onSendMemberWhatsApp: (memberId: string, type: 'BIRTHDAY' | 'BAPTISM') => Promise<void>;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summary,
  birthdays,
  onSendMemberWhatsApp,
  onNavigateTab,
}) => {
  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSend = async (memberId: string, type: 'BIRTHDAY' | 'BAPTISM') => {
    setSendingId(memberId);
    try {
      await onSendMemberWhatsApp(memberId, type);
    } finally {
      setSendingId(null);
    }
  };

  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const netBalance = summary?.netBalance || 0;

  const birthToday = birthdays?.birthdays || [];
  const baptismToday = birthdays?.baptisms || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
            Painel Geral & Indicadores
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Visão executiva em tempo real de congregações, membros, fluxo de caixa e automações.
          </p>
        </div>
      </div>

      {/* Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Entradas */}
        <div className="p-6 rounded-2xl admin-card border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Entradas do Mês</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400/80 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Dízimos & Ofertas</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Saídas */}
        <div className="p-6 rounded-2xl admin-card border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Saídas / Despesas</span>
            <span className="text-2xl font-black text-rose-400 font-mono">
              R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-rose-400/80 mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Custos & Manutenção</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        {/* Saldo Líquido */}
        <div className="p-6 rounded-2xl admin-card border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Saldo Atual</span>
            <span className={`text-2xl font-black font-mono ${netBalance >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-indigo-300 mt-1">
              <span>Superávit em caixa</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Aniversariantes de Hoje */}
        <div className="p-6 rounded-2xl admin-card border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-400 block mb-1">Aniversariantes Hoje</span>
            <span className="text-2xl font-black text-white font-mono">
              {birthToday.length + baptismToday.length}
            </span>
            <div className="text-[11px] text-amber-300/80 mt-1">
              {birthToday.length} nascimento, {baptismToday.length} batismo
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Cake className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Seção de Aniversariantes de Hoje com Botão WhatsApp de 1 clique */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aniversário de Nascimento Hoje */}
        <div className="p-6 rounded-2xl admin-card border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                <Cake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Aniversariantes de Nascimento (Hoje)</h3>
                <span className="text-[11px] text-slate-400">Disparo via Evolution API no WhatsApp</span>
              </div>
            </div>
            <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full">
              {birthToday.length}
            </span>
          </div>

          {birthToday.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Nenhum aniversariante de nascimento registrado para hoje.
            </div>
          ) : (
            <div className="space-y-3">
              {birthToday.map((m: any) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{m.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{m.church?.name}</span>
                      <span>•</span>
                      <span className="text-emerald-400">{m.phone}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSend(m.id, 'BIRTHDAY')}
                    disabled={sendingId === m.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all hover:scale-105 disabled:opacity-50"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{sendingId === m.id ? 'Enviando...' : 'Felicitar'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aniversário de Batismo Hoje */}
        <div className="p-6 rounded-2xl admin-card border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Aniversário de Batismo nas Águas (Hoje)</h3>
                <span className="text-[11px] text-slate-400">Celebrando a aliança pública com Cristo</span>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
              {baptismToday.length}
            </span>
          </div>

          {baptismToday.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Nenhum aniversário de batismo registrado para hoje.
            </div>
          ) : (
            <div className="space-y-3">
              {baptismToday.map((m: any) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{m.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{m.church?.name}</span>
                      <span>•</span>
                      <span className="text-indigo-400 font-semibold">
                        Batismo em {m.baptismDate?.split('-')[0]}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSend(m.id, 'BAPTISM')}
                    disabled={sendingId === m.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all hover:scale-105 disabled:opacity-50"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{sendingId === m.id ? 'Enviando...' : 'Felicitar'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Histórico Financeiro dos Últimos Meses */}
      <div className="p-6 rounded-2xl admin-card border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Evolução Financeira (Últimos Meses)</h3>
            <span className="text-xs text-slate-400">Comparativo de Receitas vs Despesas</span>
          </div>
          <button
            onClick={() => onNavigateTab('finances')}
            className="text-xs font-bold text-indigo-400 hover:underline"
          >
            Ver Detalhes do Fluxo de Caixa →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {(summary?.monthlyHistory || []).map((h: any, i: number) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-400 block mb-2">{h.month}</span>
              <div className="space-y-1 text-[11px] font-mono">
                <div className="text-emerald-400 font-semibold">
                  +R$ {h.receitas.toFixed(0)}
                </div>
                <div className="text-rose-400">
                  -R$ {h.despesas.toFixed(0)}
                </div>
                <div className="pt-1 border-t border-slate-800 text-white font-bold">
                  R$ {h.saldo.toFixed(0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
