import React, { useState, useEffect } from 'react';
import { Play, Sparkles, MapPin, ArrowRight, Heart } from 'lucide-react';

interface HeroProps {
  churchName: string;
  pastorName?: string;
  welcomeMessage?: string;
  address?: string;
  city?: string;
  nextEvent?: {
    title: string;
    startDate: string;
    startTime?: string;
  };
}

export const Hero: React.FC<HeroProps> = ({
  churchName,
  pastorName = 'Pastor Samuel Oliveira',
  welcomeMessage = 'Seja bem-vindo à nossa casa! Uma comunidade viva para você e toda a sua família.',
  address = 'Av. das Nações, 1500',
  city = 'São Paulo - SP',
  nextEvent,
}) => {
  // Contagem regressiva simulada ou baseada no próximo culto
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background com imagem de iluminação de culto e overlay com gradientes escuros ricos */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=2000&q=80"
          alt="Adoração e Culto"
          className="w-full h-full object-cover opacity-25 scale-105 filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/90 to-slate-950" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Badge Superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-amber-500/30 text-amber-300 text-xs font-medium mb-6 shadow-lg shadow-amber-500/10 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Cultos Presenciais e Transmissão Ao Vivo</span>
        </div>

        {/* Título Principal */}
        <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          Venha viver o extraordinário <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-indigo-300 to-indigo-500">
            na presença de Deus
          </span>
        </h1>

        {/* Subtítulo & Mensagem do Pastor */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed font-light">
          {welcomeMessage}
        </p>

        {/* Card do Próximo Culto com Contagem Regressiva */}
        <div className="w-full max-w-2xl mb-10 p-5 rounded-2xl glass-panel-glow text-left flex flex-col sm:flex-row items-center justify-between gap-5 border border-slate-700/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Play className="w-6 h-6 text-indigo-400 fill-indigo-400" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-400 block">
                Próximo Encontro
              </span>
              <h4 className="text-white font-bold text-base sm:text-lg">
                {nextEvent?.title || 'Culto da Família & Louvor'}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{address}, {city}</span>
              </div>
            </div>
          </div>

          {/* Relógio Regressivo */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800">
            <div className="text-center">
              <span className="text-lg font-bold text-white font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[10px] text-slate-500 uppercase block">Horas</span>
            </div>
            <span className="text-slate-600 font-bold">:</span>
            <div className="text-center">
              <span className="text-lg font-bold text-white font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[10px] text-slate-500 uppercase block">Min</span>
            </div>
            <span className="text-slate-600 font-bold">:</span>
            <div className="text-center">
              <span className="text-lg font-bold text-amber-400 font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[10px] text-slate-500 uppercase block">Seg</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#aovivo"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold text-sm shadow-xl shadow-red-600/30 hover:scale-105 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            Assistir Culto Ao Vivo
          </a>
          <a
            href="#celulas"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium text-sm border border-slate-700 hover:border-slate-600 transition-all hover:scale-105"
          >
            Encontrar uma Célula
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </a>
          <a
            href="#oracao"
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 font-medium text-sm border border-indigo-800/40 transition-all hover:scale-105"
          >
            <Heart className="w-4 h-4 text-pink-400" />
            Pedir Oração
          </a>
        </div>
      </div>
    </section>
  );
};
