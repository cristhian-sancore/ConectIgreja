import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Share2, Sparkles, CheckCircle2 } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  startTime?: string;
  location?: string;
  category: string;
  isRecurring?: boolean;
  recurringDay?: string;
}

interface ScheduleProps {
  events: EventItem[];
  churchAddress?: string;
}

export const Schedule: React.FC<ScheduleProps> = ({ events = [], churchAddress = 'Templo Sede' }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShareWhatsApp = (event: EventItem) => {
    const text = `🕊️ *${event.title}*\n🗓️ Data: ${event.startDate} ${event.startTime ? `às ${event.startTime}` : ''}\n📍 Local: ${event.location || churchAddress}\n\n${event.description || ''}\n\nVenha cultuar a Deus conosco! Esperamos por você e sua família!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const regularCultos = [
    {
      dia: 'Domingo',
      horario: '10:00 & 19:00',
      nome: 'Culto de Celebração & Família',
      descricao: 'Adoração calorosa, ministração da Palavra de Deus e Escola Bíblica para todas as idades.',
      badge: 'Principal',
    },
    {
      dia: 'Quarta-feira',
      horario: '19:30',
      nome: 'Quarta Profética & Clamor',
      descricao: 'Estudo expositivo da Bíblia Sagrada e intercessão pela cura, libertação e restauração.',
      badge: 'Doutrina',
    },
    {
      dia: 'Sábado',
      horario: '19:30',
      nome: 'ConectJovem / Ministério de Casais',
      descricao: 'Encontros temáticos de fortalecimento espiritual, comunhão e integração.',
      badge: 'Juventude',
    },
  ];

  return (
    <section id="programacao" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>AGENDA & CULTOS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight">
            Nossa Programação Oficial
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3 font-light">
            Nossas portas e corações estão abertos para você. Escolha o melhor dia e venha celebrar a vida e adorar ao Senhor!
          </p>
        </div>

        {/* Cultos Regulares da Semana */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {regularCultos.map((c, i) => (
            <div
              key={i}
              className="p-7 rounded-3xl glass-panel-glow border border-slate-700/60 hover:border-amber-500/40 transition-all duration-300 relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                    {c.dia}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {c.horario}
                  </div>
                </div>

                <h3 className="text-white font-bold text-xl mb-2 group-hover:text-amber-300 transition-colors">
                  {c.nome}
                </h3>
                <p className="text-sm text-slate-300 font-light leading-relaxed">
                  {c.descricao}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {churchAddress}
                </span>
                <span className="text-xs font-semibold text-indigo-400 group-hover:underline cursor-pointer">
                  Presencial e Online
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Próximos Eventos Especiais & Conferências */}
        {events.length > 0 && (
          <div className="mt-12 bg-slate-900/40 p-8 rounded-3xl border border-slate-800">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Eventos e Conferências Especiais
            </h3>

            <div className="space-y-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-indigo-300 uppercase">
                        {ev.startDate ? new Date(ev.startDate).toLocaleDateString('pt-BR', { month: 'short' }) : 'DATA'}
                      </span>
                      <span className="text-xl font-black text-white font-mono">
                        {ev.startDate ? ev.startDate.split('-')[2] : '01'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {ev.category}
                        </span>
                        {ev.startTime && (
                          <span className="text-xs text-slate-400 font-mono">
                            {ev.startTime}
                          </span>
                        )}
                      </div>
                      <h4 className="text-white font-bold text-base sm:text-lg">
                        {ev.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-1 mt-0.5 font-light">
                        {ev.description || 'Reunião especial para edificação espiritual.'}
                      </p>
                    </div>
                  </div>

                  {/* Ação de Compartilhar */}
                  <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                    <button
                      onClick={() => handleShareWhatsApp(ev)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105"
                    >
                      <Share2 className="w-4 h-4" />
                      Convidar no WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
