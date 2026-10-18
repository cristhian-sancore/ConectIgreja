import React, { useState, useEffect } from 'react';
import { Menu, X, Flame, Calendar, Users, HeartHandshake, ShieldCheck, Video, MessageCircle } from 'lucide-react';

interface NavbarProps {
  churchName?: string;
  phone?: string;
  churches: Array<{ id: string; name: string; isMain: boolean }>;
  selectedChurchId: string;
  onSelectChurch: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  churchName = 'ConectIgreja',
  phone,
  churches,
  selectedChurchId,
  onSelectChurch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-panel py-3 border-b border-slate-800 shadow-xl' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Seletor de Congregação */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  {churchName}
                </span>
                <span className="text-[11px] font-medium tracking-wider uppercase text-amber-400">
                  Uma Família Para Pertencer
                </span>
              </div>
            </a>

            {/* Dropdown de Congregações / Filiais */}
            {churches.length > 1 && (
              <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-slate-800">
                <select
                  value={selectedChurchId}
                  onChange={(e) => onSelectChurch(e.target.value)}
                  className="bg-slate-900 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {churches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.isMain ? '(Sede)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Links Desktop */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <a
              href="#aovivo"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Video className="w-4 h-4 text-red-500 animate-pulse" />
              Ao Vivo
            </a>
            <a
              href="#programacao"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              Cultos
            </a>
            <a
              href="#celulas"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              Células
            </a>
            <a
              href="#social"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Fotos & Vídeos
            </a>
            <a
              href="#oracao"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Oração
            </a>
            <a
              href="#contribuir"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <HeartHandshake className="w-4 h-4 text-pink-400" />
              Dízimos
            </a>
          </nav>

          {/* Ações Direitas (WhatsApp & Painel do Líder) */}
          <div className="hidden md:flex items-center gap-3">
            {phone && (
              <a
                href={`https://wa.me/${phone.replace(/\D/g, '')}?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20igreja`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition-all hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all hover:scale-105"
            >
              <ShieldCheck className="w-4 h-4" />
              Painel do Líder
            </a>
          </div>

          {/* Botão Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-3 pb-6 mt-3 space-y-2 animate-fadeIn">
          {churches.length > 1 && (
            <div className="mb-3 pb-3 border-b border-slate-800">
              <label className="text-xs text-slate-400 block mb-1">Congregação Ativa:</label>
              <select
                value={selectedChurchId}
                onChange={(e) => {
                  onSelectChurch(e.target.value);
                  setIsOpen(false);
                }}
                className="w-full bg-slate-900 text-sm text-slate-200 rounded-lg p-2 border border-slate-700"
              >
                {churches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isMain ? '(Sede)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <a
            href="#aovivo"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            <Video className="w-4 h-4 text-red-500" />
            Culto Ao Vivo
          </a>
          <a
            href="#programacao"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            Programação e Cultos
          </a>
          <a
            href="#celulas"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            Encontre uma Célula
          </a>
          <a
            href="#social"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Fotos & Vídeos do YouTube
          </a>
          <a
            href="#oracao"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Pedidos de Oração
          </a>
          <a
            href="#contribuir"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            <HeartHandshake className="w-4 h-4 text-pink-400" />
            Dízimos e Ofertas
          </a>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
            >
              <ShieldCheck className="w-4 h-4" />
              Acessar Painel do Líder
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
