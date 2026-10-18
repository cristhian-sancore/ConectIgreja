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
}

export const Header: React.FC<HeaderProps> = ({
  churches,
  selectedChurchId,
  onSelectChurch,
  todayBirthdaysCount = 0,
  onTriggerDailyBirthdays,
}) => {
  const [triggering, setTriggering] = useState(false);
  const [triggeredSuccess, setTriggeredSuccess] = useState(false);

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

      {/* Ações Rápidas */}
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

        {/* Perfil Pastoral */}
        <div className="flex items-center gap-2.5 pl-4 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
            P
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-white block leading-tight">Pastor Samuel</span>
            <span className="text-[10px] text-slate-400">Pastor Presidente</span>
          </div>
        </div>
      </div>
    </header>
  );
};
