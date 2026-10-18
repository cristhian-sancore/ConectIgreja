import React, { useState } from 'react';
import { Users, Search, MapPin, Clock, MessageCircle, Heart, Home } from 'lucide-react';

interface CellItem {
  id: string;
  name: string;
  leaderName: string;
  leaderPhone?: string;
  hostName?: string;
  weekday: string;
  time: string;
  neighborhood: string;
  address: string;
  targetAudience?: string;
  church?: { name: string };
}

interface FindCellProps {
  cells: CellItem[];
}

export const FindCell: React.FC<FindCellProps> = ({ cells = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('TODOS');

  const filteredCells = cells.filter((c) => {
    const matchesSearch =
      c.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.leaderName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAudience =
      selectedAudience === 'TODOS' ||
      (c.targetAudience && c.targetAudience.toUpperCase() === selectedAudience);

    return matchesSearch && matchesAudience;
  });

  const getWeekdayName = (day: string) => {
    const map: Record<string, string> = {
      SEGUNDA: 'Segunda-feira',
      TERCA: 'Terça-feira',
      QUARTA: 'Quarta-feira',
      QUINTA: 'Quinta-feira',
      SEXTA: 'Sexta-feira',
      SABADO: 'Sábado',
      DOMINGO: 'Domingo',
    };
    return map[day.toUpperCase()] || day;
  };

  const handleContactLeader = (cell: CellItem) => {
    const phone = cell.leaderPhone || '5511999999999';
    const cleanPhone = phone.replace(/\D/g, '');
    const text = `Graça e Paz, ${cell.leaderName}! Encontrei a célula *${cell.name}* no site da igreja e gostaria de saber mais informações para participar com vocês!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="celulas" className="py-24 relative bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>GRUPOS PEQUENOS NOS LARES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight">
            Encontre uma Célula Perto de Você
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3 font-light">
            Igreja é mais do que os cultos de domingo: é vida compartilhada de casa em casa! Participe de uma célula e faça novos amigos na fé.
          </p>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="max-w-3xl mx-auto mb-12 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Digite seu bairro, cidade ou nome do líder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 text-white pl-12 pr-4 py-3.5 rounded-2xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm shadow-inner"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['TODOS', 'FAMILIAS', 'JOVENS', 'MULHERES'].map((aud) => (
              <button
                key={aud}
                onClick={() => setSelectedAudience(aud)}
                className={`px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedAudience === aud
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {aud === 'TODOS' ? 'Todos os Públicos' : aud}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Células */}
        {filteredCells.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-3xl max-w-lg mx-auto">
            <Home className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-white font-bold text-lg">Nenhuma célula encontrada</h4>
            <p className="text-slate-400 text-sm mt-1">
              Tente buscar por outro bairro ou fale diretamente com a nossa secretaria no WhatsApp!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCells.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-3xl glass-panel border border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                      {c.targetAudience || 'GERAL'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{getWeekdayName(c.weekday)} às {c.time}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1.5">
                    {c.name}
                  </h3>

                  <div className="space-y-2 mt-4 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white font-semibold">{c.neighborhood}</strong>
                        <p className="text-slate-400 font-light">{c.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Líder: <strong className="text-white font-medium">{c.leaderName}</strong></span>
                    </div>

                    {c.hostName && (
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>Anfitrião: <span className="text-slate-300 font-medium">{c.hostName}</span></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800">
                  <button
                    onClick={() => handleContactLeader(c)}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all hover:scale-102"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Quero Visitar esta Célula
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
