import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Share2, Sparkles, CheckCircle2, Ticket, Users, Send } from 'lucide-react';

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
  allowRegistration?: boolean;
  maxAttendees?: number;
  registrationFee?: number;
  _count?: {
    registrations?: number;
  };
}

interface ScheduleProps {
  events: EventItem[];
  churchAddress?: string;
}

export const Schedule: React.FC<ScheduleProps> = ({ events = [], churchAddress = 'Templo Sede' }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [registeringEvent, setRegisteringEvent] = useState<EventItem | null>(null);
  const [regForm, setRegForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState<any>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringEvent) return;

    setSubmittingReg(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: registeringEvent.id,
          name: regForm.name,
          phone: regForm.phone,
          email: regForm.email,
          notes: regForm.notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        setRegSuccess(data);
      } else {
        alert(`Não foi possível concluir a inscrição: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setSubmittingReg(false);
    }
  };

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

                  {/* Ação de Compartilhar e Inscrição */}
                  <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0 flex-wrap">
                    {ev.allowRegistration && (
                      <button
                        onClick={() => {
                          setRegisteringEvent(ev);
                          setRegSuccess(null);
                          setRegForm({ name: '', phone: '', email: '', notes: '' });
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                      >
                        <Ticket className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                        <span>Garantir Vaga</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleShareWhatsApp(ev)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105"
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

      {/* Modal de Inscrição em Eventos e Retiros */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            {/* Topo do Modal */}
            <div className="p-6 bg-gradient-to-r from-amber-500/20 via-slate-900 to-indigo-900/30 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                    Inscrição Oficial
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {registeringEvent.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setRegisteringEvent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              {regSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Inscrição Confirmada!</h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                      Sua vaga para o evento <strong>{registeringEvent.title}</strong> foi reservada com sucesso.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Participante:</span>
                      <span className="text-white font-bold">{regSuccess.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>WhatsApp:</span>
                      <span className="text-emerald-400 font-mono font-bold">{regSuccess.phone}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Status da Vaga:</span>
                      <span className="text-amber-400 font-bold uppercase">{regSuccess.status}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 justify-center">
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>Comprovante e detalhes enviados via WhatsApp!</span>
                  </div>

                  <button
                    onClick={() => setRegisteringEvent(null)}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>{registeringEvent.startDate} {registeringEvent.startTime ? `às ${registeringEvent.startTime}` : ''}</span>
                    </div>
                    <span className="text-amber-400 font-bold">
                      {registeringEvent.registrationFee && registeringEvent.registrationFee > 0
                        ? `R$ ${Number(registeringEvent.registrationFee).toFixed(2)}`
                        : 'Entrada Franca / Gratuito'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome completo"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      WhatsApp com DDD (para envio da confirmação) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 5511999998888"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Observações / Restrições
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Alguma restrição alimentar ou necessidade especial?"
                      value={regForm.notes}
                      onChange={(e) => setRegForm({ ...regForm, notes: e.target.value })}
                      className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRegisteringEvent(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReg}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                    >
                      {submittingReg ? 'Garantindo Vaga...' : 'Confirmar Inscrição'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
