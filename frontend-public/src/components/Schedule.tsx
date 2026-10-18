import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Sparkles,
  CheckCircle2,
  Ticket,
  Users,
  Send,
  DollarSign,
  Copy,
  AlertCircle,
  X,
} from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  startTime?: string;
  location?: string;
  category: string;
  bannerUrl?: string;
  isRecurring?: boolean;
  recurringDay?: string;
  allowRegistration?: boolean;
  maxAttendees?: number;
  registrationFee?: number;
  church?: {
    name?: string;
    address?: string;
    pixKey?: string;
    pixType?: string;
    pixRecipient?: string;
  };
  _count?: {
    registrations?: number;
  };
}

interface ScheduleProps {
  events: EventItem[];
  churchAddress?: string;
}

export const Schedule: React.FC<ScheduleProps> = ({ events = [], churchAddress = 'Templo Sede' }) => {
  const [copiedPix, setCopiedPix] = useState(false);
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
      if (res.ok && (data.success || data.id || data.registration)) {
        setRegSuccess(data.registration || data);
      } else {
        alert(`Não foi possível concluir a inscrição: ${data.error || data.message || 'Erro ao processar inscrição'}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleShareWhatsApp = (event: EventItem) => {
    let custoTxt = event.registrationFee && event.registrationFee > 0 ? `💰 Investimento: R$ ${Number(event.registrationFee).toFixed(2)}` : '🎟️ Entrada Franca';
    const text = `🕊️ *${event.title}*\n🗓️ Data: ${event.startDate} ${event.startTime ? `às ${event.startTime}` : ''}\n📍 Local: ${event.location || churchAddress}\n${custoTxt}\n\n${event.description || ''}\n\nVenha adorar a Deus conosco! Esperamos por você e sua família!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
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
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {c.horario}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {c.nome}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  {c.descricao}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {churchAddress}
                </span>
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Presencial
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Eventos e Cultos Especiais com Vagas e Banner */}
        {events.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-heading font-black text-white tracking-tight flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-amber-400" />
                  Eventos Especiais, Retiros & Conferências
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Garanta sua vaga com antecedência nos nossos retiros e eventos especiais com capacidade limitada.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((ev) => {
                const registeredCount = ev._count?.registrations || 0;
                const maxSpots = ev.maxAttendees || 0;
                const hasLimit = maxSpots > 0;
                const spotsRemaining = hasLimit ? Math.max(0, maxSpots - registeredCount) : null;
                const isFull = hasLimit && spotsRemaining === 0;

                return (
                  <div
                    key={ev.id}
                    className="rounded-3xl glass-panel-glow border border-slate-700/60 hover:border-amber-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xl"
                  >
                    {/* Banner do Evento (se houver) */}
                    {ev.bannerUrl && (
                      <div className="w-full h-44 sm:h-52 bg-slate-950 relative overflow-hidden">
                        <img
                          src={ev.bannerUrl}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as any).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                        {/* Badges Flutuantes sobre o Banner */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 shadow-md">
                            {ev.category}
                          </span>

                          {/* Custo Badge */}
                          {ev.registrationFee && Number(ev.registrationFee) > 0 ? (
                            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-600/90 text-white backdrop-blur-md border border-emerald-400/40 shadow-md flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              R$ {Number(ev.registrationFee).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/90 text-emerald-300 backdrop-blur-md border border-emerald-500/30 shadow-md">
                              Entrada Franca
                            </span>
                          )}
                        </div>

                        {/* Vagas Restantes Badge */}
                        {ev.allowRegistration && (
                          <div className="absolute bottom-3 left-3">
                            <span
                              className={`text-[11px] font-bold px-3 py-1 rounded-xl backdrop-blur-md border flex items-center gap-1.5 shadow-md ${
                                isFull
                                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              {hasLimit ? (isFull ? 'VAGAS ESGOTADAS' : `${spotsRemaining} vagas disponíveis`) : 'Vagas Abertas'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Conteúdo do Card */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Se não tinha banner, exibe categoria e custo aqui */}
                        {!ev.bannerUrl && (
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {ev.category}
                            </span>
                            {ev.registrationFee && Number(ev.registrationFee) > 0 ? (
                              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                R$ {Number(ev.registrationFee).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                Entrada Franca
                              </span>
                            )}
                          </div>
                        )}

                        <h4 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                          {ev.title}
                        </h4>

                        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mt-1.5 font-light">
                          {ev.description || 'Reunião especial para edificação espiritual, comunhão e busca da presença de Deus.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
                          <span className="flex items-center gap-1 text-slate-300 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            {ev.startDate ? ev.startDate.split('-').reverse().join('/') : 'Data a confirmar'}
                          </span>
                          {ev.startTime && (
                            <span className="flex items-center gap-1 text-slate-300">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              {ev.startTime}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {ev.location || churchAddress}
                          </span>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex items-center gap-3 pt-2">
                        {ev.allowRegistration && (
                          <button
                            onClick={() => {
                              if (!isFull) {
                                setRegisteringEvent(ev);
                                setRegSuccess(null);
                                setRegForm({ name: '', phone: '', email: '', notes: '' });
                              }
                            }}
                            disabled={isFull}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg ${
                              isFull
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 hover:scale-102'
                            }`}
                          >
                            <Ticket className="w-4 h-4 stroke-[2.5]" />
                            <span>{isFull ? 'Vagas Esgotadas' : 'Garantir Minha Vaga'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleShareWhatsApp(ev)}
                          className="px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105"
                          title="Convidar amigos pelo WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Inscrição em Eventos e Retiros */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
            {/* Topo com Banner se existir */}
            {registeringEvent.bannerUrl ? (
              <div className="relative h-32 bg-slate-950 shrink-0">
                <img
                  src={registeringEvent.bannerUrl}
                  alt={registeringEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                <button
                  onClick={() => setRegisteringEvent(null)}
                  className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/80 p-1.5 rounded-full text-sm backdrop-blur-xs"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-6 right-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                    Inscrição Oficial
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {registeringEvent.title}
                  </h3>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gradient-to-r from-amber-500/20 via-slate-900 to-indigo-900/30 border-b border-slate-800 flex items-center justify-between shrink-0">
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
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Conteúdo com Scroll */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {regSuccess ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Inscrição Confirmada!</h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                      Sua vaga para o evento <strong>{registeringEvent.title}</strong> foi reservada com sucesso.
                    </p>
                  </div>

                  {/* Resumo da Inscrição */}
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
                      <span className="text-amber-400 font-bold uppercase">{regSuccess.status || 'CONFIRMADA'}</span>
                    </div>
                  </div>

                  {/* Detalhes de Pagamento se o Evento for Pago */}
                  {regSuccess.registrationFee && Number(regSuccess.registrationFee) > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Valor da Inscrição:
                        </span>
                        <span className="text-sm font-black text-amber-400 font-mono">
                          R$ {Number(regSuccess.registrationFee).toFixed(2)}
                        </span>
                      </div>

                      {regSuccess.pixKey && (
                        <div className="pt-2 border-t border-amber-500/20">
                          <span className="text-[11px] text-slate-300 block mb-1">
                            Chave Pix da Congregação ({regSuccess.pixType || 'Chave'}):
                          </span>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-amber-300 select-all truncate">
                              {regSuccess.pixKey}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(regSuccess.pixKey)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shrink-0"
                            >
                              {copiedPix ? 'Copiado!' : 'Copiar'}
                            </button>
                          </div>
                          {regSuccess.pixRecipient && (
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              Favorecido: <strong>{regSuccess.pixRecipient}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 justify-center">
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>Comprovante e instruções enviados no seu WhatsApp!</span>
                  </div>

                  <button
                    onClick={() => setRegisteringEvent(null)}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
                  >
                    Concluir
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Resumo do Evento e Valor */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>
                        {registeringEvent.startDate ? registeringEvent.startDate.split('-').reverse().join('/') : ''}{' '}
                        {registeringEvent.startTime ? `às ${registeringEvent.startTime}` : ''}
                      </span>
                    </div>

                    <span className="font-extrabold text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                      {registeringEvent.registrationFee && Number(registeringEvent.registrationFee) > 0
                        ? `R$ ${Number(registeringEvent.registrationFee).toFixed(2)}`
                        : 'Entrada Franca'}
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
                      placeholder="Ex: 5565996772226"
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
                      Observações / Necessidades Especiais
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Alguma restrição alimentar, transporte ou necessidade especial?"
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
