import React, { useState } from 'react';
import { Home, Users, Plus, Clock, MapPin, Calendar, ClipboardCheck, Trash2, Edit2, DollarSign } from 'lucide-react';

interface CellsPageProps {
  cells: any[];
  churches: any[];
  onRefresh: () => void;
}

export const Cells: React.FC<CellsPageProps> = ({ cells, churches, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<any>(null);

  // Formulário de Célula
  const [cellForm, setCellForm] = useState({
    churchId: churches[0]?.id || '',
    name: '',
    leaderName: '',
    leaderPhone: '55',
    hostName: '',
    weekday: 'TERCA',
    time: '20:00',
    neighborhood: '',
    address: '',
    targetAudience: 'GERAL',
  });

  // Formulário de Relatório
  const [reportForm, setReportForm] = useState({
    meetingDate: new Date().toISOString().split('T')[0],
    membersCount: '5',
    visitorsCount: '1',
    decisionsCount: '0',
    offeringAmount: '0',
    notes: '',
  });

  const handleSaveCell = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cellForm),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setCellForm({
          churchId: churches[0]?.id || '',
          name: '',
          leaderName: '',
          leaderPhone: '55',
          hostName: '',
          weekday: 'TERCA',
          time: '20:00',
          neighborhood: '',
          address: '',
          targetAudience: 'GERAL',
        });
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;

    try {
      const res = await fetch(`/api/cells/${selectedCell.id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm),
      });
      if (res.ok) {
        setIsReportModalOpen(false);
        alert('Relatório da reunião de célula registrado com sucesso!');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir esta célula?')) {
      await fetch(`/api/cells/${id}`, { method: 'DELETE' });
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight">
            Gestão de Células & Grupos nos Lares
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe o crescimento das células, líderes, anfitriões e relatórios de frequência semanal.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Nova Célula
        </button>
      </div>

      {/* Grid de Células */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cells.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-2xl admin-card border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  {c.targetAudience || 'GERAL'}
                </span>
                <span className="text-xs text-amber-400 font-mono font-semibold">
                  {c.weekday} às {c.time}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{c.name}</h3>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">{c.neighborhood}</span>
                    <p className="text-slate-400 text-[11px] font-light">{c.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Líder: <strong className="text-white">{c.leaderName}</strong></span>
                </div>

                {c.hostName && (
                  <div className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Anfitrião: <span className="text-slate-300">{c.hostName}</span></span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedCell(c);
                  setIsReportModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                Lançar Relatório
              </button>

              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Célula */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-4">Cadastrar Nova Célula</h3>

            <form onSubmit={handleSaveCell} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Célula *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Célula Emanuel"
                  value={cellForm.name}
                  onChange={(e) => setCellForm({ ...cellForm, name: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Líder *</label>
                  <input
                    type="text"
                    required
                    value={cellForm.leaderName}
                    onChange={(e) => setCellForm({ ...cellForm, leaderName: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp do Líder</label>
                  <input
                    type="text"
                    value={cellForm.leaderPhone}
                    onChange={(e) => setCellForm({ ...cellForm, leaderPhone: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dia da Semana</label>
                  <select
                    value={cellForm.weekday}
                    onChange={(e) => setCellForm({ ...cellForm, weekday: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  >
                    <option value="SEGUNDA">Segunda</option>
                    <option value="TERCA">Terça</option>
                    <option value="QUARTA">Quarta</option>
                    <option value="QUINTA">Quinta</option>
                    <option value="SEXTA">Sexta</option>
                    <option value="SABADO">Sábado</option>
                    <option value="DOMINGO">Domingo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horário</label>
                  <input
                    type="time"
                    value={cellForm.time}
                    onChange={(e) => setCellForm({ ...cellForm, time: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Público</label>
                  <select
                    value={cellForm.targetAudience}
                    onChange={(e) => setCellForm({ ...cellForm, targetAudience: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  >
                    <option value="GERAL">Geral</option>
                    <option value="FAMILIAS">Famílias</option>
                    <option value="JOVENS">Jovens</option>
                    <option value="MULHERES">Mulheres</option>
                    <option value="HOMENS">Homens</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bairro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Centro"
                    value={cellForm.neighborhood}
                    onChange={(e) => setCellForm({ ...cellForm, neighborhood: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Anfitrião</label>
                  <input
                    type="text"
                    placeholder="Casa do irmão..."
                    value={cellForm.hostName}
                    onChange={(e) => setCellForm({ ...cellForm, hostName: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  placeholder="Rua, número, complemento"
                  value={cellForm.address}
                  onChange={(e) => setCellForm({ ...cellForm, address: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Salvar Célula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Relatório Semanal */}
      {isReportModalOpen && selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-white mb-1">
              Relatório de Reunião: {selectedCell.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Lançamento de frequência e estatísticas da semana.</p>

            <form onSubmit={handleSaveReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Data da Reunião *</label>
                <input
                  type="date"
                  required
                  value={reportForm.meetingDate}
                  onChange={(e) => setReportForm({ ...reportForm, meetingDate: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Membros</label>
                  <input
                    type="number"
                    value={reportForm.membersCount}
                    onChange={(e) => setReportForm({ ...reportForm, membersCount: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Visitantes</label>
                  <input
                    type="number"
                    value={reportForm.visitorsCount}
                    onChange={(e) => setReportForm({ ...reportForm, visitorsCount: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Decisões</label>
                  <input
                    type="number"
                    value={reportForm.decisionsCount}
                    onChange={(e) => setReportForm({ ...reportForm, decisionsCount: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono text-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Oferta Recolhida na Reunião (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={reportForm.offeringAmount}
                  onChange={(e) => setReportForm({ ...reportForm, offeringAmount: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Testemunhos / Observações</label>
                <textarea
                  rows={2}
                  value={reportForm.notes}
                  onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Salvar Relatório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
