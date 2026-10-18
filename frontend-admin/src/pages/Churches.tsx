import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, MapPin, Phone, Mail, QrCode, Globe, CheckCircle2 } from 'lucide-react';

interface ChurchesPageProps {
  churches: any[];
  onRefresh: () => void;
}

export const Churches: React.FC<ChurchesPageProps> = ({ churches, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChurch, setEditingChurch] = useState<any>(null);

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
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingChurch(c);
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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight">
            Gestão Multi-Igreja: Sede e Filiais
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre congregações, pastores locais, canais de transmissão do YouTube e contas PIX.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {churches.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-2xl admin-card border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-base text-white">{c.name}</span>
                </div>
                {c.isMain && (
                  <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    Igreja Matriz (Sede)
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-300 mt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.address ? `${c.address}, ${c.neighborhood || ''} - ${c.city || ''}` : 'Endereço não cadastrado'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pastor: <strong>{c.pastorName || 'Não informado'}</strong> ({c.phone || 'Sem telefone'})</span>
                </div>

                {c.pixKey && (
                  <div className="flex items-center gap-2 text-amber-300">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Chave PIX: {c.pixKey}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(c)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold border border-indigo-500/30"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar Dados
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
        ))}
      </div>

      {/* Modal Criar / Editar Congregação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingChurch ? 'Editar Congregação' : 'Cadastrar Nova Congregação'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Igreja *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pastor Responsável</label>
                  <input
                    type="text"
                    value={formData.pastorName}
                    onChange={(e) => setFormData({ ...formData, pastorName: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Chave PIX</label>
                  <input
                    type="text"
                    value={formData.pixKey}
                    onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Favorecido PIX</label>
                  <input
                    type="text"
                    value={formData.pixRecipient}
                    onChange={(e) => setFormData({ ...formData, pixRecipient: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Instagram (@handle)</label>
                  <input
                    type="text"
                    value={formData.instagramHandle}
                    onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Link do Culto Ao Vivo no YouTube</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.youtubeLiveUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeLiveUrl: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mensagem de Boas-Vindas</label>
                <textarea
                  rows={2}
                  value={formData.welcomeMessage}
                  onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
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
                  Salvar Congregação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
