import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Music,
  Plus,
  Send,
  Users,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Trash2,
  Phone,
  Shield,
  Layers,
  Building2,
} from 'lucide-react';

interface RostersPageProps {
  churches: any[];
  allMembers?: any[];
  currentSelectedChurchId?: string;
}

export const Rosters: React.FC<RostersPageProps> = ({
  churches = [],
  allMembers = [],
  currentSelectedChurchId,
}) => {
  const [activeChurchId, setActiveChurchId] = useState<string>(
    currentSelectedChurchId || churches[0]?.id || ''
  );
  const [ministries, setMinistries] = useState<any[]>([]);
  const [rosters, setRosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modais
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isMinistryModalOpen, setIsMinistryModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedRosterForAssign, setSelectedRosterForAssign] = useState<any>(null);

  // Forms
  const [rosterForm, setRosterForm] = useState({
    ministryId: '',
    title: 'Culto de Celebração & Ceia',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    notes: 'Chegada com 1h de antecedência para ensaio, oração e passagem de som.',
  });

  const [ministryForm, setMinistryForm] = useState({
    name: '',
    description: '',
    leaderName: '',
    leaderPhone: '',
    color: '#6366f1',
  });

  const [assignmentForm, setAssignmentForm] = useState({
    memberId: '',
    roleInRoster: 'Violão & Voz',
    notes: '',
  });

  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const selectedChurch = churches.find((c) => c.id === activeChurchId) || churches[0];

  const loadData = async () => {
    if (!activeChurchId) return;
    setLoading(true);
    try {
      const [mRes, rRes] = await Promise.all([
        fetch(`/api/rosters/ministries?churchId=${activeChurchId}`),
        fetch(`/api/rosters?churchId=${activeChurchId}`),
      ]);
      if (mRes.ok) setMinistries(await mRes.json());
      if (rRes.ok) setRosters(await rRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeChurchId]);

  const handleCreateMinistry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ministryForm.name || !activeChurchId) return;

    try {
      const res = await fetch('/api/rosters/ministries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ministryForm, churchId: activeChurchId }),
      });
      if (res.ok) {
        setIsMinistryModalOpen(false);
        setMinistryForm({ name: '', description: '', leaderName: '', leaderPhone: '', color: '#6366f1' });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rosterForm.ministryId || !rosterForm.title || !activeChurchId) return;

    try {
      const res = await fetch('/api/rosters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rosterForm, churchId: activeChurchId }),
      });
      if (res.ok) {
        setIsRosterModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRosterForAssign || !assignmentForm.memberId || !assignmentForm.roleInRoster) return;

    try {
      const res = await fetch(`/api/rosters/${selectedRosterForAssign.id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentForm),
      });
      if (res.ok) {
        setIsAssignmentModalOpen(false);
        setAssignmentForm({ memberId: '', roleInRoster: '', notes: '' });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (confirm('Remover voluntário desta escala?')) {
      await fetch(`/api/rosters/assignments/${assignmentId}`, { method: 'DELETE' });
      loadData();
    }
  };

  const handleDeleteRoster = async (id: string) => {
    if (confirm('Excluir esta escala de culto?')) {
      await fetch(`/api/rosters/${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  const handleNotifyWhatsApp = async (rosterId: string) => {
    setNotifyingId(rosterId);
    try {
      const res = await fetch(`/api/rosters/${rosterId}/notify-whatsapp`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert(`Sucesso! ${data.message}`);
      } else {
        alert(`Aviso: ${data.error || 'Falha ao notificar'}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setNotifyingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Gestão Operacional de Culto & Ministérios
          </span>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-indigo-400" />
            Escalas de Ministérios & Voluntários
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize quem toca, canta, opera o som, cuida das crianças no Kids e recepciona na porta em cada culto.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeChurchId}
            onChange={(e) => setActiveChurchId(e.target.value)}
            className="bg-slate-900 text-xs font-bold text-white px-3.5 py-2 rounded-xl border border-slate-700 cursor-pointer"
          >
            {churches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.isMain ? '★ Sede' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsMinistryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            Novo Ministério
          </button>

          <button
            onClick={() => {
              if (ministries.length === 0) {
                alert('Cadastre um ministério primeiro (ex: Louvor, Kids, Mídia)');
                return;
              }
              setRosterForm({ ...rosterForm, ministryId: ministries[0]?.id || '' });
              setIsRosterModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Criar Nova Escala
          </button>
        </div>
      </div>

      {/* Ministérios Ativos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ministries.map((m) => (
          <div
            key={m.id}
            className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: m.color || '#6366f1' }}
              />
              <div>
                <span className="text-xs font-bold text-white block truncate max-w-[120px] sm:max-w-[150px]">
                  {m.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  Líder: {m.leaderName || 'Não definido'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300">
              {m._count?.rosters || 0} escalas
            </span>
          </div>
        ))}
      </div>

      {/* Lista de Escalas dos Cultos */}
      <div className="space-y-4">
        {rosters.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40">
            <CalendarCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">Nenhuma escala cadastrada para esta congregação</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Clique em "Criar Nova Escala" para organizar a equipe de louvor, mídia, kids ou recepção do próximo culto.
            </p>
          </div>
        ) : (
          rosters.map((r) => {
            const formattedDate = r.date.split('-').reverse().join('/');
            const assignments = r.assignments || [];

            return (
              <div
                key={r.id}
                className="p-6 rounded-2xl admin-card border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md"
                      style={{ backgroundColor: r.ministry?.color || '#6366f1' }}
                    >
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          {r.ministry?.name}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formattedDate} {r.time ? `às ${r.time}` : ''}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">{r.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Botão de Disparo no WhatsApp */}
                    <button
                      onClick={() => handleNotifyWhatsApp(r.id)}
                      disabled={notifyingId === r.id || assignments.length === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 disabled:opacity-50"
                      title="Disparar aviso para os WhatsApps de todos os voluntários escalados"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      <span>{notifyingId === r.id ? 'Disparando...' : 'Avisar no WhatsApp'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedRosterForAssign(r);
                        setIsAssignmentModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold border border-indigo-500/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Escalar Voluntário
                    </button>

                    <button
                      onClick={() => handleDeleteRoster(r.id)}
                      className="p-1.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Observações da Escala */}
                {r.notes && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    💡 <strong>Orientações:</strong> {r.notes}
                  </p>
                )}

                {/* Grid de Voluntários Escalados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {assignments.length === 0 ? (
                    <div className="col-span-full text-center py-4 text-xs text-slate-500">
                      Nenhum voluntário escalado ainda. Clique em "Escalar Voluntário".
                    </div>
                  ) : (
                    assignments.map((a: any) => (
                      <div
                        key={a.id}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 flex items-center justify-center text-xs font-bold font-mono">
                            {a.member.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block leading-tight">
                              {a.member.name}
                            </span>
                            <span className="text-[11px] text-amber-300 font-semibold">
                              {a.roleInRoster}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRemoveAssignment(a.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Remover da escala"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Criar Ministério */}
      {isMinistryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-white mb-4">Cadastrar Novo Ministério</h3>
            <form onSubmit={handleCreateMinistry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Ministério *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ministério de Louvor, ConectKids, Diaconato"
                  value={ministryForm.name}
                  onChange={(e) => setMinistryForm({ ...ministryForm, name: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Líder Responsável</label>
                <input
                  type="text"
                  placeholder="Nome do líder"
                  value={ministryForm.leaderName}
                  onChange={(e) => setMinistryForm({ ...ministryForm, leaderName: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cor de Destaque</label>
                <input
                  type="color"
                  value={ministryForm.color}
                  onChange={(e) => setMinistryForm({ ...ministryForm, color: e.target.value })}
                  className="w-16 h-9 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMinistryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Salvar Ministério
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar Escala */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-white mb-4">Criar Escala de Culto</h3>
            <form onSubmit={handleCreateRoster} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ministério *</label>
                <select
                  required
                  value={rosterForm.ministryId}
                  onChange={(e) => setRosterForm({ ...rosterForm, ministryId: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                >
                  {ministries.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Culto / Evento *</label>
                <input
                  type="text"
                  required
                  value={rosterForm.title}
                  onChange={(e) => setRosterForm({ ...rosterForm, title: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={rosterForm.date}
                    onChange={(e) => setRosterForm({ ...rosterForm, date: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horário</label>
                  <input
                    type="time"
                    value={rosterForm.time}
                    onChange={(e) => setRosterForm({ ...rosterForm, time: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Instruções / Repertório / Observações</label>
                <textarea
                  rows={2}
                  value={rosterForm.notes}
                  onChange={(e) => setRosterForm({ ...rosterForm, notes: e.target.value })}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRosterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Salvar Escala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Escalar Voluntário */}
      {isAssignmentModalOpen && selectedRosterForAssign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-white mb-1">
              Escalar Voluntário: {selectedRosterForAssign.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Ministério: {selectedRosterForAssign.ministry?.name}
            </p>

            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Selecione o Membro / Voluntário *</label>
                <select
                  required
                  value={assignmentForm.memberId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, memberId: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                >
                  <option value="">Selecione um voluntário...</option>
                  {allMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role}) - {m.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Função / Instrumento na Escala *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Violão, Bateria, Vocal Principal, Mesa de Som, Tia do Kids"
                  value={assignmentForm.roleInRoster}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, roleInRoster: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Adicionar à Escala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
