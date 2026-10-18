import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Plus,
  Edit2,
  Trash2,
  Key,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  Lock,
  Globe,
  Sliders,
} from 'lucide-react';

interface UsersPageProps {
  churches: any[];
}

export const UsersPage: React.FC<UsersPageProps> = ({ churches }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');

  // Modais
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  // Form Usuário
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'PASTOR_CIDADE',
    groupId: '',
    churchId: '', // vazio = Acesso Estadual a todas as igrejas
    status: 'ATIVO',
  });

  // Form Grupo
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const availablePermissions = [
    { id: 'ALL', label: 'Acesso Total / Super Admin (Todas as Cidades e Funções)' },
    { id: 'MANAGE_LOCAL_CHURCH', label: 'Gerenciar Dados da Igreja Local / Filial' },
    { id: 'MEMBERS', label: 'Gerenciar Membros & Aniversariantes' },
    { id: 'FINANCES', label: 'Gerenciar Fluxo de Caixa, Dízimos & Despesas' },
    { id: 'CELLS', label: 'Gerenciar Células & Relatórios Semanais' },
    { id: 'EVENTS', label: 'Gerenciar Agenda de Cultos & Programações' },
    { id: 'LOCAL_WHATSAPP', label: 'Controlar Instância Local do WhatsApp (Evolution API)' },
    { id: 'PRAYER_REQUESTS', label: 'Acolher e Interceder em Pedidos de Oração' },
  ];

  const loadData = async () => {
    try {
      const [uRes, gRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/users/groups/list'),
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (gRes.ok) setGroups(await gRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      password: 'mudar123',
      phone: '55',
      role: 'PASTOR_CIDADE',
      groupId: groups[0]?.id || '',
      churchId: '',
      status: 'ATIVO',
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: any) => {
    setEditingUser(u);
    setUserForm({
      name: u.name,
      email: u.email,
      password: '',
      phone: u.phone || '',
      role: u.role,
      groupId: u.groupId || '',
      churchId: u.churchId || '',
      status: u.status,
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });
      if (res.ok) {
        setIsUserModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  const handleOpenCreateGroup = () => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      description: '',
      permissions: ['MEMBERS', 'CELLS'],
    });
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingGroup ? `/api/users/groups/${editingGroup.id}` : '/api/users/groups';
    const method = editingGroup ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm),
      });
      if (res.ok) {
        setIsGroupModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (confirm('Deseja excluir este grupo de usuários?')) {
      await fetch(`/api/users/groups/${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Topo com Alternância de Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight">
            Controle de Usuários & Níveis de Acesso
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Centralize os pastores e líderes de todo o estado. Cada pastor acessa apenas sua cidade, ou os líderes estaduais acessam todas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'users' ? (
            <button
              onClick={handleOpenCreateUser}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Novo Usuário
            </button>
          ) : (
            <button
              onClick={handleOpenCreateGroup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Novo Grupo de Permissões
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'users' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Usuários do Sistema ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'groups' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          Grupos & Permissões ({groups.length})
        </button>
      </div>

      {/* Aba de Usuários */}
      {activeTab === 'users' && (
        <div className="rounded-2xl admin-card border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Usuário / Nome</th>
                  <th className="px-5 py-3.5">E-mail & WhatsApp</th>
                  <th className="px-5 py-3.5">Grupo / Perfil</th>
                  <th className="px-5 py-3.5">Escopo de Atuação (Cidade/Igreja)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm block">{u.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">ID: {u.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-white font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {u.email}
                      </div>
                      <div className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5" />
                        {u.phone || '-'}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {u.group?.name || u.role}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {u.churchId ? (
                        <div className="flex items-center gap-1.5 text-white font-medium">
                          <Building2 className="w-4 h-4 text-amber-400" />
                          <span>{u.church?.name} ({u.church?.city || 'Local'})</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 text-[10px] uppercase tracking-wider">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Acesso Estadual (Todas as Cidades)</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'ATIVO'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30"
                          title="Editar Usuário"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aba de Grupos & Permissões */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((g) => {
            let perms: string[] = [];
            try {
              perms = JSON.parse(g.permissions || '[]');
            } catch {
              perms = [];
            }

            return (
              <div
                key={g.id}
                className="p-6 rounded-2xl admin-card border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-bold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-indigo-400" />
                      {g.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {g._count?.users || 0} usuários
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-light mb-4">
                    {g.description || 'Sem descrição.'}
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Privilégios Habilitados:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {perms.includes('ALL') ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          ★ ACESSO IRRESTRITO A TODO O ESTADO
                        </span>
                      ) : (
                        perms.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]"
                          >
                            {p}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => handleDeleteGroup(g.id)}
                    className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Usuário */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingUser ? 'Editar Usuário do Sistema' : 'Novo Usuário do Sistema'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail de Acesso *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {editingUser ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha Inicial *'}
                </label>
                <input
                  type="password"
                  placeholder="******"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Grupo de Permissão *</label>
                  <select
                    value={userForm.groupId}
                    onChange={(e) => setUserForm({ ...userForm, groupId: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1">
                    Escopo / Cidade da Igreja *
                  </label>
                  <select
                    value={userForm.churchId}
                    onChange={(e) => setUserForm({ ...userForm, churchId: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-semibold"
                  >
                    <option value="">★ Acesso Estadual (Todas as Congregações)</option>
                    {churches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city || 'Filial'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Grupo de Permissões */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-4">Novo Grupo de Permissões</h3>

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Grupo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pastor Titular da Cidade"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Breve descrição das responsabilidades deste perfil..."
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Permissões Permitidas</label>
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                  {availablePermissions.map((p) => {
                    const isChecked = groupForm.permissions.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGroupForm({ ...groupForm, permissions: [...groupForm.permissions, p.id] });
                            } else {
                              setGroupForm({
                                ...groupForm,
                                permissions: groupForm.permissions.filter((x) => x !== p.id),
                              });
                            }
                          }}
                          className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <span>{p.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Salvar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
