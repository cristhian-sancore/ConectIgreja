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
  Sparkles,
  Image,
  Video,
  Share2,
  Palette,
  Shield,
  Upload,
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
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

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
    customDomain: '',
    isMain: false,
    logoUrl: '',
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

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    setIsUploadingLogo(true);
    const body = new FormData();
    body.append('logo', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, logoUrl: data.url }));
      } else {
        alert(`Erro no upload: ${data.error || 'Não foi possível salvar o arquivo.'}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingChurch(null);
    setFormData({
      name: '',
      slug: '',
      customDomain: '',
      isMain: false,
      logoUrl: '',
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
      customDomain: c.customDomain || '',
      isMain: c.isMain,
      logoUrl: c.logoUrl || '',
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

  const getPublicUrl = (church: any) => {
    if (church?.customDomain) {
      return church.customDomain.startsWith('http') ? church.customDomain : `https://${church.customDomain}`;
    }
    const origin = window.location.origin;
    if (origin.includes('admin-conectigreja') || origin.includes('conectigreja')) {
      return `https://conectigreja.cristhiansancore.com.br/?igreja=${church?.slug || ''}`;
    }
    return `http://localhost:3000/?igreja=${church?.slug || ''}`;
  };

  const handleCopyUrl = (church: any) => {
    const url = getPublicUrl(church);
    navigator.clipboard.writeText(url);
    setCopiedSlug(church.id || church.slug);
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
          const publicUrl = getPublicUrl(c);

          return (
            <div
              key={c.id}
              className="p-6 rounded-2xl admin-card border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {c.logoUrl ? (
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-amber-500/30 p-1 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                        <img src={c.logoUrl} alt={c.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-amber-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-white">{c.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block line-clamp-1 font-light">
                        {c.welcomeMessage || 'Uma família para pertencer no amor de Cristo.'}
                      </span>
                    </div>
                  </div>

                  {c.isMain ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full shrink-0 shadow-sm">
                      ★ Sede Matriz
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full shrink-0">
                      Filial {c.city}
                    </span>
                  )}
                </div>

                {/* Box de URL Pública Independente */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className={`w-3.5 h-3.5 ${c.customDomain ? 'text-emerald-400' : 'text-indigo-400'}`} />
                      {c.customDomain ? (
                        <span className="text-emerald-400 font-black">
                          ✨ Link Próprio Exclusivo da Filial:
                        </span>
                      ) : (
                        <span className="text-indigo-400">
                          URL Pública Independente:
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => handleCopyUrl(c)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      {copiedSlug === (c.id || c.slug) ? (
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
                    <code className={`text-xs font-mono truncate font-medium ${c.customDomain ? 'text-emerald-300' : 'text-slate-300'}`}>
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
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ver Site</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenLinkModal(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold border border-emerald-500/30 transition-all hover:scale-102"
                    title="Vincular membros diretamente a esta congregação"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Membros ({membersList.length})</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all hover:scale-105"
                    title="Editar nome da igreja, logo oficial e customizar o site público"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Editar Site & Logo</span>
                  </button>
                  {!c.isMain && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
                      title="Excluir congregação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
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

      {/* Modal Criar / Editar Congregação & Editor do Site Público */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full p-6 shadow-2xl animate-scaleUp max-h-[92vh] overflow-y-auto">
            {/* Topo do Modal */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      {editingChurch ? 'Editar Igreja, Logo Oficial & Site Público' : 'Cadastrar Nova Congregação'}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Personalize o nome da congregação, a logo oficial e tudo o que é exibido no portal público dos membros e visitantes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* SEÇÃO 1: IDENTIDADE VISUAL & LOGOMARCA OFICIAL */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                  <Palette className="w-4 h-4" />
                  <span>1. Identidade Visual & Logo Oficial</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nome Oficial da Igreja *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Igreja Conectada - Templo Central"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/--+/g, '-');
                        setFormData({ ...formData, name, slug: editingChurch ? formData.slug : slug });
                      }}
                      className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-400 mb-1">
                      Slug da URL Pública Independente *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: filial-esperanca"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full bg-slate-900 text-amber-300 px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs font-mono font-medium focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                    <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        Link Próprio / Domínio Oficial da Filial (Exclusivo)
                      </span>
                      <span className="text-[10px] text-emerald-300/80 font-mono">
                        Acesso direto sem /filial ou parâmetros
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: https://esperanca.conectigreja.cristhiansancore.com.br ou https://igrejacampinas.com.br"
                      value={formData.customDomain}
                      onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                      className="w-full bg-slate-950 text-emerald-300 px-3.5 py-2.5 rounded-xl border border-emerald-500/40 text-xs font-medium focus:border-emerald-400 focus:outline-none placeholder:text-slate-600 font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <span>💡</span>
                      <span>Se preenchido, a filial terá este link exclusivo para divulgar aos membros, abrindo diretamente a página dela sem parâmetros na URL.</span>
                    </p>
                  </div>
                </div>

                {/* LOGO OFICIAL COM UPLOAD E PREVIEW */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5 text-indigo-400" />
                      Logo Oficial da Igreja (Upload de Arquivo ou URL)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Aparece no topo do site e na barra de navegação
                    </span>
                  </label>

                  {/* Card de Upload e Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    {/* Botão de Upload de Arquivo */}
                    <div className="sm:col-span-2">
                      <label
                        className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                          isUploadingLogo
                            ? 'bg-amber-500/10 border-amber-500/50 animate-pulse'
                            : 'bg-slate-900 border-slate-700 hover:border-amber-500/60 hover:bg-slate-850'
                        }`}
                      >
                        <Upload className="w-6 h-6 text-amber-400 mb-1.5" />
                        <span className="text-xs font-bold text-white mb-0.5">
                          {isUploadingLogo ? 'Fazendo Upload da Imagem...' : '📁 Clique para Fazer Upload da Logo Oficial'}
                        </span>
                        <span className="text-[10px] text-slate-400 text-center">
                          Formatos aceitos: PNG transparente, SVG, JPG, WebP (até 10MB)
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                          disabled={isUploadingLogo}
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Preview da Logo */}
                    <div className="rounded-2xl bg-slate-900 border border-slate-700 p-3 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Prévia da Logo
                      </span>
                      <div className="w-16 h-16 rounded-xl bg-slate-950 border border-amber-500/30 p-1 flex items-center justify-center shadow-inner overflow-hidden">
                        {formData.logoUrl ? (
                          <img
                            src={formData.logoUrl}
                            alt="Prévia da Logo"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as any).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[9px] text-slate-500 font-bold">SEM LOGO</span>
                        )}
                      </div>
                      {formData.logoUrl && (
                        <span className="text-[9px] text-emerald-400 font-mono mt-1 truncate max-w-[150px]" title={formData.logoUrl}>
                          {formData.logoUrl}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Campo de URL Manual / Link Direto */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ou cole a URL da imagem (https://... ou /uploads/...)"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: '' })}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs whitespace-nowrap"
                      >
                        ✕ Remover
                      </button>
                    )}
                  </div>

                  {/* Sugestões de Logos Rápidas para Teste */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">Modelos Prontos:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: '/uploads/logos/conectigreja-official-logo.svg' })}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] text-amber-300 font-bold"
                    >
                      👑 Logo Oficial ConectIgreja
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=300&q=80' })}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-[10px] text-amber-300 font-semibold"
                    >
                      ✞ Cruz Dourada
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=300&q=80' })}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-[10px] text-amber-300 font-semibold"
                    >
                      🔥 Chama Avivamento
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=300&q=80' })}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-[10px] text-amber-300 font-semibold"
                    >
                      📖 Palavra & Luz
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isMainCheckbox"
                    checked={formData.isMain}
                    onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="isMainCheckbox" className="text-xs text-slate-300 cursor-pointer">
                    Definir esta igreja como <strong>Sede Matriz Estadual</strong> (Principal)
                  </label>
                </div>
              </div>

              {/* SEÇÃO 2: CONTEÚDO DO SITE PÚBLICO */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-400">
                  <Globe className="w-4 h-4" />
                  <span>2. Conteúdo do Portal Público da Congregação</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mensagem de Boas-Vindas / Slogan da Igreja
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Texto de acolhimento que aparece no topo da página pública..."
                    value={formData.welcomeMessage}
                    onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                    className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-700 text-xs leading-relaxed focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Pastor Presidente / Titular</label>
                    <input
                      type="text"
                      placeholder="Pr. Nome Sobrenome"
                      value={formData.pastorName}
                      onChange={(e) => setFormData({ ...formData, pastorName: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp de Atendimento</label>
                    <input
                      type="text"
                      placeholder="5565996772226"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail de Contato</label>
                    <input
                      type="email"
                      placeholder="contato@igreja.com.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Endereço (Rua e Número)</label>
                    <input
                      type="text"
                      placeholder="Av. Principal, 1234"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Bairro</label>
                    <input
                      type="text"
                      placeholder="Centro"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade / UF</label>
                    <input
                      type="text"
                      placeholder="São Paulo - SP"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: MÍDIAS, TRANSMISSÕES AO VIVO & REDES SOCIAIS */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-400">
                  <Video className="w-4 h-4" />
                  <span>3. Transmissão Ao Vivo & Redes Sociais no Site</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Link do Culto Ao Vivo no YouTube
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.youtubeLiveUrl}
                      onChange={(e) => setFormData({ ...formData, youtubeLiveUrl: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ID do Canal do YouTube (para listar pregações)
                    </label>
                    <input
                      type="text"
                      placeholder="UC_x5XG1OV2P6uZZ5FSM9Ttw"
                      value={formData.youtubeChannelId}
                      onChange={(e) => setFormData({ ...formData, youtubeChannelId: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Instagram Oficial da Igreja
                    </label>
                    <input
                      type="text"
                      placeholder="@conectigreja.oficial"
                      value={formData.instagramHandle}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Facebook da Igreja
                    </label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/conectigreja"
                      value={formData.facebookUrl}
                      onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 4: DÍZIMOS & CHAVE PIX NO SITE */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                  <QrCode className="w-4 h-4" />
                  <span>4. Dízimos, Ofertas & Chave PIX Oficial</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Chave PIX Oficial</label>
                    <input
                      type="text"
                      placeholder="email@igreja.com.br ou CNPJ"
                      value={formData.pixKey}
                      onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo da Chave</label>
                    <select
                      value={formData.pixType}
                      onChange={(e) => setFormData({ ...formData, pixType: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs"
                    >
                      <option value="EMAIL">E-mail</option>
                      <option value="CNPJ">CNPJ</option>
                      <option value="TELEFONE">Telefone</option>
                      <option value="CPF">CPF</option>
                      <option value="ALEATORIA">Chave Aleatória</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Favorecido</label>
                    <input
                      type="text"
                      placeholder="Igreja Conectada Central"
                      value={formData.pixRecipient}
                      onChange={(e) => setFormData({ ...formData, pixRecipient: e.target.value })}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 5: VINCULAR MEMBROS À CONGREGAÇÃO */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-400">
                    <Users className="w-4 h-4" />
                    <span>5. Vincular Membros a esta Congregação</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {formData.memberIds.length} membros vinculados
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Buscar membro por nome ou WhatsApp..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-700 text-xs placeholder:text-slate-500"
                />

                <div className="flex items-center justify-between text-[11px] px-1">
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

                <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 max-h-40 overflow-y-auto space-y-1.5">
                  {allMembers.length === 0 ? (
                    <span className="text-xs text-slate-500 block text-center py-3">Nenhum membro cadastrado.</span>
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
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                              isLinked
                                ? 'bg-indigo-950/40 border-indigo-500/40'
                                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
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
                              <span className="font-semibold text-white">{m.name}</span>
                              <span className="text-[10px] text-emerald-400 font-mono">({m.phone})</span>
                            </div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              {m.role}
                            </span>
                          </label>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {formData.slug && (
                  <a
                    href={getPublicUrl(formData.slug)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Visualizar Página Pública da Igreja</span>
                  </a>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[3]" />
                    <span>Salvar Alterações da Igreja & Site</span>
                  </button>
                </div>
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
