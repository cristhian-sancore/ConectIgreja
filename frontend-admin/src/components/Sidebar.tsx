import React from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Home,
  Calendar,
  MessageSquare,
  Building2,
  Heart,
  Globe,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  evolutionStatus?: string;
  todayBirthdaysCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  evolutionStatus = 'open',
  todayBirthdaysCount = 0,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Membros & Liderança', icon: Users, badge: todayBirthdaysCount > 0 ? `${todayBirthdaysCount} hoje` : undefined },
    { id: 'finances', label: 'Fluxo de Caixa', icon: DollarSign },
    { id: 'cells', label: 'Células / Grupos', icon: Home },
    { id: 'events', label: 'Agenda & Cultos', icon: Calendar },
    { id: 'automation', label: 'Evolution API (WhatsApp)', icon: MessageSquare, highlight: true },
    { id: 'prayer', label: 'Pedidos de Oração', icon: Heart },
    { id: 'churches', label: 'Igrejas & Filiais', icon: Building2 },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Topo / Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-base tracking-tight text-white leading-tight">
            ConectIgreja
          </h1>
          <span className="text-[11px] font-medium text-amber-400">
            Painel do Pastor & Líder
          </span>
        </div>
      </div>

      {/* Status da Evolution API */}
      <div className="px-5 py-3 mx-4 my-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {evolutionStatus === 'open' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 text-amber-400" />
          )}
          <span className="text-xs font-semibold text-slate-300">WhatsApp API</span>
        </div>
        <span
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
            evolutionStatus === 'open'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}
        >
          {evolutionStatus === 'open' ? 'Conectado' : 'Aguardando'}
        </span>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 px-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Rodapé / Link do Site Público */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all hover:scale-102"
        >
          <Globe className="w-4 h-4 text-indigo-400" />
          Ver Site Público da Igreja
        </a>
      </div>
    </aside>
  );
};
