import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Cake,
  Droplets,
  MessageCircle,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  CreditCard,
  QrCode,
  Printer,
  Send,
} from 'lucide-react';

interface MembersPageProps {
  members: any[];
  churches: any[];
  cells: any[];
  onRefresh: () => void;
  onSendWhatsApp: (memberId: string, type: 'BIRTHDAY' | 'BAPTISM' | 'CUSTOM', customText?: string) => Promise<void>;
}

export const Members: React.FC<MembersPageProps> = ({
  members,
  churches,
  cells,
  onRefresh,
  onSendWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [viewingCardMember, setViewingCardMember] = useState<any>(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    churchId: churches[0]?.id || '',
    cellId: '',
    phone: '',
    email: '',
    birthDate: '',
    baptismDate: '',
    role: 'MEMBRO',
    maritalStatus: 'SOLTEIRO',
    address: '',
    status: 'ATIVO',
  });

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === '' || m.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      churchId: churches[0]?.id || '',
      cellId: '',
      phone: '55',
      email: '',
      birthDate: '',
      baptismDate: '',
      role: 'MEMBRO',
      maritalStatus: 'SOLTEIRO',
      address: '',
      status: 'ATIVO',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: any) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      churchId: m.churchId,
      cellId: m.cellId || '',
      phone: m.phone,
      email: m.email || '',
      birthDate: m.birthDate || '',
      baptismDate: m.baptismDate || '',
      role: m.role,
      maritalStatus: m.maritalStatus || 'SOLTEIRO',
      address: m.address || '',
      status: m.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members';
    const method = editingMember ? 'PUT' : 'POST';

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
    if (confirm('Tem certeza que deseja excluir este membro?')) {
      await fetch(`/api/members/${id}`, { method: 'DELETE' });
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight">
            Gestão de Membros & Liderança
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cadastro geral de membros, datas de nascimento, batismo nas águas e cargos ministeriais.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Membro
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="p-4 rounded-2xl admin-card border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 text-white pl-10 pr-4 py-2 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2 border border-slate-800 focus:outline-none"
          >
            <option value="">Todos os Cargos</option>
            <option value="PASTOR">Pastor</option>
            <option value="PRESBITERO">Presbítero</option>
            <option value="DIACONO">Diácono</option>
            <option value="LIDER_CELULA">Líder de Célula</option>
            <option value="MUSICO">Músico / Louvor</option>
            <option value="MEMBRO">Membro</option>
            <option value="VISITANTE">Visitante</option>
          </select>
        </div>
      </div>

      {/* Tabela de Membros */}
      <div className="rounded-2xl admin-card border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Membro</th>
                <th className="px-5 py-3.5">WhatsApp / Contato</th>
                <th className="px-5 py-3.5">Congregação / Célula</th>
                <th className="px-5 py-3.5">Aniversários</th>
                <th className="px-5 py-3.5">Cargo</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-white text-sm">{m.name}</div>
                    <div className="text-[11px] text-slate-400 font-light">{m.address || 'Endereço não informado'}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-mono text-emerald-400 font-medium">{m.phone}</div>
                    <div className="text-[11px] text-slate-500">{m.email || '-'}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-white font-medium">{m.church?.name}</div>
                    <div className="text-[11px] text-indigo-400">
                      {m.cell?.name ? `Célula: ${m.cell.name}` : 'Sem célula'}
                    </div>
                  </td>
                  <td className="px-5 py-4 space-y-1">
                    {m.birthDate && (
                      <div className="flex items-center gap-1.5 text-amber-300 text-[11px]">
                        <Cake className="w-3.5 h-3.5 text-amber-400" />
                        <span>Nasc: {m.birthDate.split('-').reverse().join('/')}</span>
                      </div>
                    )}
                    {m.baptismDate && (
                      <div className="flex items-center gap-1.5 text-indigo-300 text-[11px]">
                        <Droplets className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Batismo: {m.baptismDate.split('-').reverse().join('/')}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-200 border border-slate-700">
                      {m.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Visualizar Credencial / Carteirinha Digital"
                        onClick={() => setViewingCardMember(m)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-[11px] font-bold transition-all hover:scale-105"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span>Carteirinha</span>
                      </button>

                      <button
                        title="Enviar Mensagem de Parabéns"
                        onClick={() => onSendWhatsApp(m.id, 'BIRTHDAY')}
                        className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        title="Editar"
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        title="Excluir"
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar / Editar Membro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingMember ? 'Editar Dados do Membro' : 'Novo Membro da Igreja'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp (com DDI e DDD) *</label>
                  <input
                    type="text"
                    required
                    placeholder="5511999999999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1">Data de Nascimento (AAAA-MM-DD)</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-indigo-400 mb-1">Data do Batismo nas Águas</label>
                  <input
                    type="date"
                    value={formData.baptismDate}
                    onChange={(e) => setFormData({ ...formData, baptismDate: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Congregação</label>
                  <select
                    value={formData.churchId}
                    onChange={(e) => setFormData({ ...formData, churchId: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-indigo-500"
                  >
                    {churches.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Célula / Grupo Pequeno</label>
                  <select
                    value={formData.cellId}
                    onChange={(e) => setFormData({ ...formData, cellId: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-indigo-500"
                  >
                    <option value="">Nenhuma Célula</option>
                    {cells.map((cell) => (
                      <option key={cell.id} value={cell.id}>{cell.name} ({cell.neighborhood})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo Ministerial</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-indigo-500"
                  >
                    <option value="PASTOR">Pastor</option>
                    <option value="PRESBITERO">Presbítero</option>
                    <option value="DIACONO">Diácono</option>
                    <option value="LIDER_CELULA">Líder de Célula</option>
                    <option value="MUSICO">Músico / Louvor</option>
                    <option value="MEMBRO">Membro</option>
                    <option value="VISITANTE">Visitante</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estado Civil</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-indigo-500"
                  >
                    <option value="SOLTEIRO">Solteiro(a)</option>
                    <option value="CASADO">Casado(a)</option>
                    <option value="VIUVO">Viúvo(a)</option>
                    <option value="DIVORCIADO">Divorciado(a)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Endereço Residencial</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs focus:border-indigo-500"
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
                  Salvar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Carteirinha Digital de Membro com QR Code */}
      {viewingCardMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Credencial Eclesiástica Digital</h3>
              </div>
              <button
                onClick={() => setViewingCardMember(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-semibold"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Cartão Visual - Estilo Crachá Premium */}
            <div className="p-6">
              <div
                id="digital-member-card"
                className="relative rounded-2xl overflow-hidden p-6 border border-amber-500/30 shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white"
              >
                {/* Glow decorativo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Cabeçalho do Cartão */}
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                      CONECTIGREJA ESTADUAL
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-100">
                      {viewingCardMember.church?.name || 'Igreja Local'}
                    </h4>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg font-black text-xs text-white">
                    ✞
                  </div>
                </div>

                {/* Conteúdo Central */}
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-20 h-24 rounded-xl bg-slate-800 border-2 border-amber-500/40 overflow-hidden flex flex-col items-center justify-center text-slate-400 shadow-inner flex-shrink-0">
                    <span className="text-2xl font-bold text-white">
                      {viewingCardMember.name.charAt(0)}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">FOTO</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 uppercase font-semibold">Nome do Membro</div>
                    <div className="font-black text-base text-white truncate">{viewingCardMember.name}</div>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {viewingCardMember.role}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        ● ATIVO
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400">
                      {viewingCardMember.cell?.name ? `Célula: ${viewingCardMember.cell.name}` : 'Membro Geral'}
                    </div>
                  </div>
                </div>

                {/* Informações de Registro e QR Code */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Matrícula / ID</span>
                    <span className="font-mono text-white font-bold">
                      MEM-{viewingCardMember.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Batismo nas Águas</span>
                    <span className="text-indigo-300 font-medium">
                      {viewingCardMember.baptismDate ? viewingCardMember.baptismDate.split('-').reverse().join('/') : 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Nascimento</span>
                    <span className="text-slate-300 font-medium">
                      {viewingCardMember.birthDate ? viewingCardMember.birthDate.split('-').reverse().join('/') : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Telefone</span>
                    <span className="text-emerald-400 font-mono font-medium">
                      {viewingCardMember.phone}
                    </span>
                  </div>
                </div>

                {/* Rodapé da Carteirinha com QR Code de Validação Oficial */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400">
                    <span className="block font-semibold text-slate-300">Autenticidade Verificada</span>
                    <span className="text-slate-500">Aponte a câmera para checar status</span>
                  </div>
                  <div className="bg-white p-1 rounded-lg shadow-md">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(
                        `https://conectigreja.cristiansancore.com.br/validar?membro=${viewingCardMember.id}&igreja=${viewingCardMember.church?.id}`
                      )}`}
                      alt="QR Code Carteirinha"
                      className="w-14 h-14"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const msg = `Olá ${viewingCardMember.name}! Segue sua *Credencial Digital Eclesiástica* da ${viewingCardMember.church?.name || 'Igreja'}:\n\n` +
                      `🪪 *Matrícula:* MEM-${viewingCardMember.id.slice(0, 8).toUpperCase()}\n` +
                      `✝ *Cargo:* ${viewingCardMember.role}\n` +
                      `⛪ *Congregação:* ${viewingCardMember.church?.name}\n\n` +
                      `Apresente sua carteirinha na secretaria ou nos eventos oficiais! Deus abençoe!`;
                    await onSendWhatsApp(viewingCardMember.id, 'CUSTOM', msg);
                    alert(`Carteirinha digital enviada via WhatsApp para ${viewingCardMember.phone}!`);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-emerald-900/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar no WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
