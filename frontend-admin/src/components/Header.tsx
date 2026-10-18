import React, { useState } from 'react';
import { Building2, Bell, Zap, CheckCircle2, UserCheck, MessageSquare } from 'lucide-react';

interface ChurchItem {
  id: string;
  name: string;
  isMain: boolean;
}

interface HeaderProps {
  churches: ChurchItem[];
  selectedChurchId: string;
  onSelectChurch: (id: string) => void;
  todayBirthdaysCount?: number;
  onTriggerDailyBirthdays: () => Promise<void>;
  currentUser?: {
    name: string;
    role: string;
    title: string;
    email?: string;
  };
  onSwitchUserRole?: (role: string, name: string, title: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  churches,
  selectedChurchId,
  onSelectChurch,
  todayBirthdaysCount = 0,
  onTriggerDailyBirthdays,
  currentUser = {
    name: 'Cristhian Sancore',
    role: 'SUPER_ADMIN_ESTADUAL',
    title: 'Super Administrador Estadual',
    email: 'cristhian@conectigreja.com.br',
  },
  onSwitchUserRole,
}) => {
  const [triggering, setTriggering] = useState(false);
  const [triggeredSuccess, setTriggeredSuccess] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN_ESTADUAL' || currentUser.role === 'SUPER_ADMIN';

  const handleTrigger = async () => {
    setTriggering(true);
    setTriggeredSuccess(false);
    try {
      await onTriggerDailyBirthdays();
      setTriggeredSuccess(true);
      setTimeout(() => setTriggeredSuccess(false), 5000);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Seletor de Congregação */}
      <div className="flex items-center gap-3">
        <Building2 className="w-5 h-5 text-indigo-400" />
        <span className="text-xs font-semibold text-slate-400">Congregação Ativa:</span>
        <select
          value={selectedChurchId}
          onChange={(e) => onSelectChurch(e.target.value)}
          className="bg-slate-950 text-xs font-bold text-white rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="">Todas as Congregações (Consolidado)</option>
          {churches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.isMain ? '★ Sede' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Ações Rápidas & Perfil */}
      <div className="flex items-center gap-4">
        {/* Botão de Disparo do Robô de Aniversários */}
        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 disabled:opacity-50"
        >
          {triggeredSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Disparado!</span>
            </>
          ) : triggering ? (
            <span>Enviando mensagens...</span>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Disparar Aniversários no WhatsApp</span>
            </>
          )}
        </button>

        {/* Notificação de Aniversariantes */}
        <div className="relative">
          <div className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <Bell className="w-4 h-4" />
          </div>
          {todayBirthdaysCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center animate-bounce">
              {todayBirthdaysCount}
            </span>
          )}
        </div>

        {/* Perfil do Usuário com Destaque para Super Admin */}
        <div className="relative pl-4 border-l border-slate-800">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/80 transition-all text-left group"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg transition-transform group-hover:scale-105 ${
              isSuperAdmin
                ? 'bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400/50'
                : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-indigo-500/20'
            }`}>
              {isSuperAdmin ? '👑' : '👤'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white leading-tight">
                  {currentUser.name}
                </span>
                {isSuperAdmin && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    SUPER ADMIN
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block">
                {currentUser.title}
              </span>
            </div>
          </button>

          {/* Dropdown de Simulação / Alternância de Perfil */}
          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-scaleUp">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Perfil de Acesso do Sistema
                </span>
                <span className="text-xs text-amber-300 font-semibold mt-0.5 block">
                  {isSuperAdmin
                    ? '👑 Apenas você pode cadastrar a Evolution em todas as igrejas'
                    : '🔒 Perfil restrito a congregação local'}
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    onSwitchUserRole?.(
                      'SUPER_ADMIN_ESTADUAL',
                      'Cristhian Sancore',
                      'Super Administrador Estadual'
                    );
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                    isSuperAdmin ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-base mt-0.5">👑</span>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Super Admin Estadual</span>
                      {isSuperAdmin && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Cristhian Sancore (Cadastra Evolution em todas as cidades)
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSwitchUserRole?.(
                      'PASTOR_LOCAL',
                      'Pastor Marcos Silva',
                      'Pastor da Filial Campinas'
                    );
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                    currentUser.role === 'PASTOR_LOCAL' ? 'bg-indigo-500/10 border border-indigo-500/30' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-base mt-0.5">👤</span>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Pastor Local (Campinas)</span>
                      {currentUser.role === 'PASTOR_LOCAL' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Acesso apenas à filial local (Bloqueado de criar Evolution)
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
