import React, { useState } from 'react';
import { Calendar, Plus, Clock, MapPin, Share2, Trash2, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';

interface EventsPageProps {
  events: any[];
  churches: any[];
  onRefresh: () => void;
}

export const Events: React.FC<EventsPageProps> = ({ events, churches, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    churchId: churches[0]?.id || '',
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '19:30',
    location: '',
    category: 'CULTO',
    isPublic: true,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          churchId: churches[0]?.id || '',
          title: '',
          description: '',
          startDate: new Date().toISOString().split('T')[0],
          startTime: '19:30',
          location: '',
          category: 'CULTO',
          isPublic: true,
        });
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = async (eventId: string) => {
    setBroadcastingId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/broadcast-whatsapp`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Programação disparada com sucesso para os grupos do WhatsApp!');
        onRefresh();
      } else {
        alert(`Aviso: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Erro no disparo: ${err.message}`);
    } finally {
      setBroadcastingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este culto/evento?')) {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight">
            Agenda de Cultos & Programações
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie os cultos presenciais e transmita os comunicados diretamente nos grupos do WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Culto ou Evento
        </button>
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-4">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="p-5 rounded-2xl admin-card border border-slate-800 hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-indigo-300 uppercase">
                  {ev.startDate ? new Date(ev.startDate).toLocaleDateString('pt-BR', { month: 'short' }) : 'DATA'}
                </span>
                <span className="text-lg font-black text-white font-mono">
                  {ev.startDate ? ev.startDate.split('-')[2] : '01'}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {ev.category}
                  </span>
                  {ev.isPublic && (
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Público no Site
                    </span>
                  )}
                  {ev.sentToWhatsapp && (
                    <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Enviado no WhatsApp
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white">{ev.title}</h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {ev.startDate} às {ev.startTime || '19:30'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {ev.location || ev.church?.address || 'Templo Sede'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
              <button
                onClick={() => handleBroadcast(ev.id)}
                disabled={broadcastingId === ev.id}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{broadcastingId === ev.id ? 'Disparando...' : 'Divulgar no WhatsApp'}</span>
              </button>

              <button
                onClick={() => handleDelete(ev.id)}
                className="p-2 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Criar Culto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-4">Adicionar Culto ou Evento</h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Culto de Santa Ceia"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horário *</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  >
                    <option value="CULTO">Culto Regular</option>
                    <option value="CONFERENCIA">Conferência / Congresso</option>
                    <option value="ENSAIO">Ensaio Louvor</option>
                    <option value="VIGILIA">Vigília</option>
                    <option value="BATISMO">Batismo</option>
                    <option value="JOVENS">Jovens</option>
                    <option value="CASAIS">Casais</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Congregação</label>
                  <select
                    value={formData.churchId}
                    onChange={(e) => setFormData({ ...formData, churchId: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  >
                    {churches.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Local</label>
                <input
                  type="text"
                  placeholder="Ex: Templo Sede - Auditório Principal"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes, pregador convidado, tema da mensagem..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Salvar Programação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
