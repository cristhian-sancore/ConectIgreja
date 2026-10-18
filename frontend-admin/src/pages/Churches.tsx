import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Mail,
  QrCode,
  Globe,
  CheckCircle2,
  Users,
  Copy,
  ExternalLink,
  MessageSquare,
  Cake,
} from 'lucide-react';

interface ChurchesPageProps {
  churches: any[];
  allMembers?: any[];
  onRefresh: () => void;
}

export const Churches: React.FC<ChurchesPageProps> = ({ churches, allMembers = [], onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChurch, setEditingChurch] = useState<any>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Busca e filtros de membros
  const [memberSearch, setMemberSearch] = useState('');

  // Modal para Visualizar Membros da Igreja
  const [viewingMembersChurch, setViewingMembersChurch] = useState<any>(null);

  // Modal Dedicado de Vincular Membros
  const [linkModalChurch, setLinkModalChurch] = useState<any>(null);
  const [linkModalMemberIds, setLinkModalMemberIds] = useState<string[]>([]);
  const [savingLink, setSavingLink] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    isMain: false,
    pastorName: '',
    phone: '',
    email: '',
    address: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    pixKey: '',
    pixType: 'EMAIL',
    pixRecipient: '',
    youtubeChannelId: '',
    youtubeLiveUrl: '',
    instagramHandle: '',
    facebookUrl: '',
    welcomeMessage: '',
    memberIds: [] as string[],
  });

  const handleOpenCreate = () => {
    setEditingChurch(null);
    setFormData({
      name: '',
      slug: '',
      isMain: false,
      pastorName: '',
      phone: '',
      email: '',
      address: '',
      neighborhood: '',
      city: '',
      state: 'SP',
      pixKey: '',
      pixType: 'EMAIL',
      pixRecipient: '',
      youtubeChannelId: '',
      youtubeLiveUrl: '',
      instagramHandle: '',
      facebookUrl: '',
      welcomeMessage: '',
      memberIds: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingChurch(c);
    const linkedMemberIds = (c.members || []).map((m: any) => m.id);

    setFormData({
      name: c.name,
      slug: c.slug,
      isMain: c.isMain,
      pastorName: c.pastorName || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      neighborhood: c.neighborhood || '',
      city: c.city || '',
      state: c.state || 'SP',
      pixKey: c.pixKey || '',
      pixType: c.pixType || 'EMAIL',
      pixRecipient: c.pixRecipient || '',
      youtubeChannelId: c.youtubeChannelId || '',
      youtubeLiveUrl: c.youtubeLiveUrl || '',
      instagramHandle: c.instagramHandle || '',
      facebookUrl: c.facebookUrl || '',
      welcomeMessage: c.welcomeMessage || '',
      memberIds: linkedMemberIds,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingChurch ? `/api/churches/${editingChurch.id}` : '/api/churches';
    const method = editingChurch ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta congregação?')) {
      await fetch(`/api/churches/${id}`, { method: 'DELETE' });
      onRefresh();
    }
  };

  const getPublicUrl = (slug: string) => {
    return `http://localhost:3000/?igreja=${slug}`;
  };

  const handleCopyUrl = (slug: string) => {
    const url = getPublicUrl(slug);
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  const handleOpenLinkModal = (c: any) => {
    setLinkModalChurch(c);
    const linkedIds = (c.members || []).map((m: any) => m.id);
    setLinkModalMemberIds(linkedIds);
    setMemberSearch('');
  };

  const handleSaveLinkModal = async () => {
    if (!linkModalChurch) return;
    setSavingLink(true);
    try {
      const res = await fetch(`/api/churches/${linkModalChurch.id}/link-members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberIds: linkModalMemberIds }),
      });
      if (res.ok) {
        setLinkModalChurch(null);
        onRefresh();
      } else {
        const data = await res.json();
        alert(`Aviso: ${data.error || 'Erro ao vincular membros'}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setSavingLink(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight">
            Igrejas, Filiais & Páginas Públicas Independentes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cada igreja possui seus membros vinculados, instância exclusiva de WhatsApp e uma <strong>página pública independente</strong> com URL própria.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Nova Filial
        </button>
      </div>

      {/* Grid de Congregações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {churches.map((c) => {
          const membersList = c.members || [];
          const publicUrl = getPublicUrl(c.slug);

          return (
            <div
              key={c.id}
              className="p-6 rounded-2xl admin-card border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <span className="font-bold text-base text-white">{c.name}</span>
                  </div>
                  {c.isMain ? (
                    <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      ★ Sede Matriz
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full">
                      Filial {c.city}
                    </span>
                  )}
                </div>

                {/* Box de URL Pública Independente */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      URL Pública Independente:
                    </span>
                    <button
                      onClick={() => handleCopyUrl(c.slug)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      {copiedSlug === c.slug ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copiar Link
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono text-slate-300 truncate font-medium">
                      {publicUrl}
                    </code>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-semibold flex items-center gap-1 border border-indigo-500/30"
                    >
                      <span>Abrir Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Informações da Igreja */}
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{c.address ? `${c.address}, ${c.neighborhood || ''} - ${c.city || ''}` : 'Endereço não cadastrado'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Pastor: <strong className="text-white">{c.pastorName || 'Não informado'}</strong> ({c.phone || 'Sem telefone'})</span>
                  </div>

                  <div className="flex items-center gap-2 text-amber-300">
                    <QrCode className="w-3.5 h-3.5 shrink-0" />
                    <span>Chave PIX: {c.pixKey || 'Não cadastrada'}</span>
                  </div>

                  {c.automations && (
                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] pt-1">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span>Instância WhatsApp: <strong>{c.automations.instanceName}</strong></span>
                    </div>
                  )}
                </div>

                {/* Seção de Membros Vinculados */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-white">
                      {membersList.length} membro(s) vinculado(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setViewingMembersChurch(c)}
                      className="text-xs text-slate-400 hover:text-white font-medium hover:underline"
                    >
                      Ver Lista
                    </button>
                    <button
                      onClick={() => handleOpenLinkModal(c)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold hover:underline flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Vincular Membros →
                    </button>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenLinkModal(c)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold border border-emerald-500/30 transition-all hover:scale-102"
                  title="Vincular membros diretamente a esta igreja"
                >
                  <Users className="w-3.5 h-3.5" />
                  Vincular Membros ({membersList.length})
                </button>
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold border border-indigo-500/30"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar Dados & Membros
                </button>
                {!c.isMain && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Visualizar Membros Vinculados à Congregação */}
      {viewingMembersChurch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Membros Vinculados: {viewingMembersChurch.name}
                </h3>
                <span className="text-xs text-slate-400">
                  Total de {viewingMembersChurch.members?.length || 0} membro(s) cadastrados nesta congregação.
                </span>
              </div>
              <button
                onClick={() => setViewingMembersChurch(null)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(viewingMembersChurch.members || []).length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Nenhum membro vinculado a esta congregação ainda. Clique em "Editar" para vincular membros.
                </div>
              ) : (
                viewingMembersChurch.members.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{m.name}</span>
                      <span className="text-[11px] text-emerald-400 font-mono">{m.phone}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {m.role}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={() => setViewingMembersChurch(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar / Editar Congregação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingChurch ? 'Editar Congregação & Membros' : 'Cadastrar Nova Congregação'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Igreja *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/--+/g, '-');
                      setFormData({ ...formData, name, slug: editingChurch ? formData.slug : slug });
                    }}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1">
                    Slug da URL Independente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: filial-campinas"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pastor Responsável</label>
                  <input
                    type="text"
                    value={formData.pastorName}
                    onChange={(e) => setFormData({ ...formData, pastorName: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Chave PIX Oficial</label>
                  <input
                    type="text"
                    value={formData.pixKey}
                    onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Link Culto Ao Vivo YouTube</label>
                  <input
                    type="text"
                    value={formData.youtubeLiveUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeLiveUrl: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Seção de VINCULAR MEMBROS à Igreja */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Vincular Membros a esta Congregação</span>
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {formData.memberIds.length} membro(s) selecionado(s)
                  </span>
                </div>

                {/* Filtro de Busca de Membros */}
                <input
                  type="text"
                  placeholder="Filtrar por nome ou telefone..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-800 text-xs mb-2 placeholder:text-slate-500"
                />

                <div className="flex items-center justify-between text-[11px] px-1 mb-2">
                  <span className="text-slate-400">Total no estado: {allMembers.length}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = allMembers.filter(
                          (m) =>
                            !memberSearch ||
                            m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                            m.phone.includes(memberSearch)
                        );
                        const ids = Array.from(new Set([...formData.memberIds, ...filtered.map((m) => m.id)]));
                        setFormData({ ...formData, memberIds: ids });
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                    >
                      Marcar Filtrados
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, memberIds: [] })}
                      className="text-rose-400 hover:text-rose-300 font-semibold underline"
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 max-h-48 overflow-y-auto space-y-2">
                  {allMembers.length === 0 ? (
                    <span className="text-xs text-slate-500 block text-center py-4">Nenhum membro cadastrado no sistema.</span>
                  ) : (
                    allMembers
                      .filter(
                        (m) =>
                          !memberSearch ||
                          m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          m.phone.includes(memberSearch)
                      )
                      .map((m) => {
                        const isLinked = formData.memberIds.includes(m.id);
                        return (
                          <label
                            key={m.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                              isLinked
                                ? 'bg-indigo-950/40 border-indigo-500/40'
                                : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isLinked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({ ...formData, memberIds: [...formData.memberIds, m.id] });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      memberIds: formData.memberIds.filter((id) => id !== m.id),
                                    });
                                  }
                                }}
                                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                              />
                              <div>
                                <span className="font-semibold text-white block">{m.name}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-emerald-400 font-mono">{m.phone}</span>
                                  {m.church && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                      {m.church.id === editingChurch?.id ? '★ Já nesta filial' : `Pertence à: ${m.church.name}`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800/70 px-2 py-0.5 rounded">
                              {m.role}
                            </span>
                          </label>
                        );
                      })
                  )}
                </div>
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
                  Salvar Congregação & Membros
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dedicado de Vincular Membros à Igreja */}
      {linkModalChurch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Vincular Membros: {linkModalChurch.name}
                </h3>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  Marque os membros que pertencem a esta congregação ({linkModalChurch.city || 'Cidade'}).
                </span>
              </div>
              <button
                onClick={() => setLinkModalChurch(null)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Campo de Filtro */}
            <input
              type="text"
              placeholder="Buscar membro por nome ou telefone..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs mb-3"
            />

            <div className="flex items-center justify-between text-xs px-1 mb-2">
              <span className="text-emerald-400 font-bold">
                {linkModalMemberIds.length} membro(s) vinculados a esta filial
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const filtered = allMembers.filter(
                      (m) =>
                        !memberSearch ||
                        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        m.phone.includes(memberSearch)
                    );
                    const ids = Array.from(new Set([...linkModalMemberIds, ...filtered.map((m) => m.id)]));
                    setLinkModalMemberIds(ids);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline text-[11px]"
                >
                  Marcar Filtrados
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => setLinkModalMemberIds([])}
                  className="text-rose-400 hover:text-rose-300 font-semibold underline text-[11px]"
                >
                  Desmarcar Todos
                </button>
              </div>
            </div>

            {/* Lista com Rolagem */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {allMembers
                .filter(
                  (m) =>
                    !memberSearch ||
                    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    m.phone.includes(memberSearch)
                )
                .map((m) => {
                  const isLinked = linkModalMemberIds.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-colors ${
                        isLinked
                          ? 'bg-indigo-950/40 border-indigo-500/40'
                          : 'bg-slate-950 border-slate-800/80 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLinkModalMemberIds([...linkModalMemberIds, m.id]);
                            } else {
                              setLinkModalMemberIds(linkModalMemberIds.filter((id) => id !== m.id));
                            }
                          }}
                          className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <div>
                          <span className="font-semibold text-white block">{m.name}</span>
                          <span className="text-[11px] text-emerald-400 font-mono">{m.phone}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        {m.church && (
                          <span className="text-[10px] text-slate-400 block">
                            {m.church.id === linkModalChurch.id ? '★ Já nesta congregação' : `Atual: ${m.church.name}`}
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                          {m.role}
                        </span>
                      </div>
                    </label>
                  );
                })}
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setLinkModalChurch(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={savingLink}
                onClick={handleSaveLinkModal}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {savingLink ? 'Salvando Vínculo...' : 'Salvar Vínculo de Membros'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
