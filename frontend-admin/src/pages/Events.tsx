import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Share2,
  Trash2,
  CheckCircle2,
  Edit2,
  Upload,
  Image as ImageIcon,
  Ticket,
  DollarSign,
  Users,
  Sparkles,
  X,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface EventsPageProps {
  events: any[];
  churches: any[];
  onRefresh: () => void;
}

export const Events: React.FC<EventsPageProps> = ({ events, churches, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const initialForm = {
    churchId: churches[0]?.id || '',
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '19:30',
    endDate: '',
    endTime: '',
    location: '',
    category: 'CULTO',
    isPublic: true,
    bannerUrl: '',
    allowRegistration: false,
    maxAttendees: 0,
    registrationFee: 0,
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      ...initialForm,
      churchId: churches[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: any) => {
    setEditingEvent(ev);
    setFormData({
      churchId: ev.churchId || churches[0]?.id || '',
      title: ev.title || '',
      description: ev.description || '',
      startDate: ev.startDate || new Date().toISOString().split('T')[0],
      startTime: ev.startTime || '19:30',
      endDate: ev.endDate || '',
      endTime: ev.endTime || '',
      location: ev.location || '',
      category: ev.category || 'CULTO',
      isPublic: ev.isPublic !== undefined ? ev.isPublic : true,
      bannerUrl: ev.bannerUrl || '',
      allowRegistration: Boolean(ev.allowRegistration),
      maxAttendees: ev.maxAttendees || 0,
      registrationFee: ev.registrationFee || 0,
    });
    setIsModalOpen(true);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    setIsUploadingBanner(true);
    const body = new FormData();
    body.append('banner', file);

    try {
      const res = await fetch('/api/upload?type=banner', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, bannerUrl: data.url }));
      } else {
        alert(`Erro no upload: ${data.error || 'Não foi possível salvar o arquivo.'}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        maxAttendees: formData.allowRegistration ? Number(formData.maxAttendees) || 0 : 0,
        registrationFee: Number(formData.registrationFee) || 0,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingEvent(null);
        setFormData(initialForm);
        onRefresh();
      } else {
        const data = await res.json();
        alert(`Erro ao salvar: ${data.error || 'Falha na operação'}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
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
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            Agenda de Cultos & Eventos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre eventos com upload de cartaz oficial, controle de vagas, valores de inscrição e disparo automático nos grupos do WhatsApp.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Novo Culto ou Evento
        </button>
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="p-12 text-center rounded-3xl admin-card border border-slate-800 text-slate-400">
            <Calendar className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-white">Nenhum evento ou culto cadastrado</p>
            <p className="text-xs text-slate-500 mt-1">Clique em "Novo Culto ou Evento" para começar.</p>
          </div>
        ) : (
          events.map((ev) => {
            const registeredCount = ev._count?.registrations || 0;
            const maxSpots = ev.maxAttendees || 0;
            const hasLimit = maxSpots > 0;
            const spotsRemaining = hasLimit ? Math.max(0, maxSpots - registeredCount) : null;
            const isFull = hasLimit && spotsRemaining === 0;

            return (
              <div
                key={ev.id}
                className="p-5 rounded-2xl admin-card border border-slate-800 hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all group"
              >
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  {/* Banner Miniatura ou Data Badge */}
                  {ev.bannerUrl ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0 relative shadow-md">
                      <img
                        src={ev.bannerUrl}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as any).style.display = 'none';
                        }}
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-xs py-0.5 text-center text-[9px] font-mono text-amber-300 font-bold">
                        {ev.startDate ? ev.startDate.split('-').slice(1).reverse().join('/') : ''}
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase">
                        {ev.startDate ? new Date(ev.startDate).toLocaleDateString('pt-BR', { month: 'short' }) : 'DATA'}
                      </span>
                      <span className="text-lg font-black text-white font-mono">
                        {ev.startDate ? ev.startDate.split('-')[2] : '01'}
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    {/* Badges de Categoria, Público, Vagas e Custo */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {ev.category}
                      </span>

                      {ev.isPublic && (
                        <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Público no Portal
                        </span>
                      )}

                      {/* Badge de Vagas */}
                      {ev.allowRegistration ? (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                            isFull
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          <Ticket className="w-3 h-3" />
                          {hasLimit ? (
                            isFull ? (
                              'Esgotado'
                            ) : (
                              `${registeredCount}/${maxSpots} Vagas (${spotsRemaining} rest.)`
                            )
                          ) : (
                            `${registeredCount} Inscritos (Livre)`
                          )}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Sem Inscrição Prévia</span>
                      )}

                      {/* Badge de Custo */}
                      {ev.registrationFee && Number(ev.registrationFee) > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3" />
                          R$ {Number(ev.registrationFee).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          Entrada Franca
                        </span>
                      )}

                      {ev.sentToWhatsapp && (
                        <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Enviado nos Grupos
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                      {ev.title}
                    </h4>

                    {ev.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-light">
                        {ev.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {ev.startDate} às {ev.startTime || '19:30'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {ev.location || ev.church?.address || 'Templo Sede'}
                      </span>
                      {ev.church?.name && (
                        <span className="text-[11px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-800/80">
                          {ev.church.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
                  <button
                    onClick={() => handleOpenEdit(ev)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hover:scale-105"
                    title="Editar informações, banner, vagas e custo"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Editar</span>
                  </button>

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
                    className="p-2 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30 transition-all"
                    title="Excluir evento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Criar ou Editar Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Topo do Modal */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingEvent ? 'Editar Culto ou Evento' : 'Adicionar Culto ou Evento'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Defina título, banner oficial, limite de vagas e custo da programação.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário com Scroll Suave */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título do Evento ou Culto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Grande Culto de Santa Ceia ou Retiro Espiritual 2026"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Data *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Horário *</label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="CULTO">Culto Regular</option>
                      <option value="CONFERENCIA">Conferência / Congresso</option>
                      <option value="RETIRO">Retiro Espiritual / Acampamento</option>
                      <option value="ENSAIO">Ensaio Louvor / Dança</option>
                      <option value="VIGILIA">Vigília de Oração</option>
                      <option value="BATISMO">Batismo nas Águas</option>
                      <option value="JOVENS">Ministério de Jovens</option>
                      <option value="CASAIS">Encontro de Casais</option>
                      <option value="KIDS">Culto Kids / Infantil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Congregação</label>
                    <select
                      value={formData.churchId}
                      onChange={(e) => setFormData({ ...formData, churchId: e.target.value })}
                      className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      {churches.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.city || 'SP'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Local do Evento</label>
                  <input
                    type="text"
                    placeholder="Ex: Templo Sede - Auditório Principal ou Chácara Recanto da Paz"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição e Detalhes</label>
                  <textarea
                    rows={2}
                    placeholder="Tema da ministração, pregador convidado, informações importantes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SEÇÃO 2: UPLOAD DO CARTAZ / BANNER OFICIAL */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                    <ImageIcon className="w-4 h-4" />
                    <span>Cartaz / Banner Oficial do Evento</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Upload direto de imagem ou modelos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Botão de Upload de Imagem */}
                  <div className="sm:col-span-2">
                    <label
                      className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                        isUploadingBanner
                          ? 'bg-amber-500/10 border-amber-500/50 animate-pulse'
                          : 'bg-slate-900 border-slate-700 hover:border-amber-500/60 hover:bg-slate-850'
                      }`}
                    >
                      <Upload className="w-6 h-6 text-amber-400 mb-1.5" />
                      <span className="text-xs font-bold text-white mb-0.5">
                        {isUploadingBanner ? 'Enviando Imagem...' : '📁 Clique para Fazer Upload do Cartaz'}
                      </span>
                      <span className="text-[10px] text-slate-400 text-center">
                        PNG, JPG, SVG ou WebP (até 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                        disabled={isUploadingBanner}
                        onChange={handleBannerUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Prévia do Cartaz */}
                  <div className="rounded-2xl bg-slate-900 border border-slate-700 p-2 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Prévia do Banner
                    </span>
                    <div className="w-full h-20 rounded-xl bg-slate-950 border border-amber-500/30 overflow-hidden flex items-center justify-center">
                      {formData.bannerUrl ? (
                        <img
                          src={formData.bannerUrl}
                          alt="Prévia do Banner"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold">Sem Cartaz</span>
                      )}
                    </div>
                    {formData.bannerUrl && (
                      <span className="text-[9px] text-emerald-400 font-mono mt-1 truncate max-w-[160px]" title={formData.bannerUrl}>
                        {formData.bannerUrl}
                      </span>
                    )}
                  </div>
                </div>

                {/* Campo URL direta */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ou cole a URL direta da imagem (https://... ou /uploads/...)"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                    className="w-full bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                  {formData.bannerUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, bannerUrl: '' })}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs whitespace-nowrap"
                    >
                      ✕ Limpar
                    </button>
                  )}
                </div>

                {/* Modelos Prontos de Banners */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-medium">Modelos Prontos:</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bannerUrl: '/uploads/banners/banner-culto-santa-ceia.svg' })}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] text-amber-300 font-bold"
                  >
                    🍷 Santa Ceia (SVG)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bannerUrl: '/uploads/banners/banner-retiro-espiritual.svg' })}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold"
                  >
                    ⛰️ Retiro Espiritual (SVG)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80' })}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-[10px] text-indigo-300 font-semibold"
                  >
                    🔥 Avivamento
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' })}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-[10px] text-purple-300 font-semibold"
                  >
                    🎸 ConectJovem
                  </button>
                </div>
              </div>

              {/* SEÇÃO 3 & 4: VAGAS & CUSTO DO EVENTO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* QUANTIDADE DE VAGAS */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Ticket className="w-4 h-4" />
                      <span>Inscrições & Vagas</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="allowRegCheckbox"
                      checked={formData.allowRegistration}
                      onChange={(e) => setFormData({ ...formData, allowRegistration: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <label htmlFor="allowRegCheckbox" className="text-xs text-slate-300 cursor-pointer font-medium">
                      Habilitar Inscrição Online no Portal
                    </label>
                  </div>

                  {formData.allowRegistration && (
                    <div className="animate-in fade-in space-y-1.5 pt-1">
                      <label className="block text-[11px] font-semibold text-slate-400">
                        Quantidade Máxima de Vagas (0 = Sem Limite)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          placeholder="Ex: 100"
                          value={formData.maxAttendees || ''}
                          onChange={(e) => setFormData({ ...formData, maxAttendees: Number(e.target.value) })}
                          className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">
                          {Number(formData.maxAttendees) > 0 ? 'vagas limitadas' : 'ilimitado'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Quando atingir o limite, o portal bloqueará novas inscrições automaticamente com o aviso "Vagas Esgotadas".
                      </p>
                    </div>
                  )}
                </div>

                {/* CUSTO DO EVENTO */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      <DollarSign className="w-4 h-4" />
                      <span>Custo / Investimento</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Valor por Vaga (R$) — 0 = Gratuito
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2 text-xs text-emerald-400 font-bold">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.registrationFee || ''}
                        onChange={(e) => setFormData({ ...formData, registrationFee: Number(e.target.value) })}
                        className="w-full bg-slate-900 text-white pl-10 pr-3.5 py-2 rounded-xl border border-slate-700 text-xs font-mono font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    {Number(formData.registrationFee) > 0 ? (
                      <span className="text-emerald-400 font-semibold">
                        Evento Pago: R$ {Number(formData.registrationFee).toFixed(2)}. As instruções e chave Pix da congregação serão enviadas ao participante.
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Entrada Franca: Inscrição 100% gratuita para membros e convidados.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Checkbox Público no Portal */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                <input
                  type="checkbox"
                  id="isPublicCheckbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                />
                <label htmlFor="isPublicCheckbox" className="text-xs text-slate-300 cursor-pointer">
                  Exibir esta programação na página pública da igreja
                </label>
              </div>

              {/* Rodapé do Modal */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                >
                  {editingEvent ? 'Salvar Alterações' : 'Salvar Programação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
