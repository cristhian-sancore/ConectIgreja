import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface FinancesPageProps {
  summary: any;
  transactions: any[];
  churches: any[];
  members: any[];
  onRefresh: () => void;
}

export const Finances: React.FC<FinancesPageProps> = ({
  summary,
  transactions,
  churches,
  members,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    churchId: churches[0]?.id || '',
    memberId: '',
    type: 'RECEITA',
    category: 'DIZIMO',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'PIX',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finances/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          churchId: churches[0]?.id || '',
          memberId: '',
          type: 'RECEITA',
          category: 'DIZIMO',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          paymentMethod: 'PIX',
        });
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este lançamento financeiro?')) {
      await fetch(`/api/finances/transactions/${id}`, { method: 'DELETE' });
      onRefresh();
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === '' || t.type === filterType;
    const matchesCategory = filterCategory === '' || t.category === filterCategory;
    return matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight">
            Fluxo de Caixa & Finanças
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle de dízimos de membros, ofertas de cultos, campanhas de missões e despesas fixas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl admin-card border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Entradas</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            R$ {(summary?.totalIncome || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400/80 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Dízimos & Ofertas</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl admin-card border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Saídas</span>
          <span className="text-2xl font-black text-rose-400 font-mono">
            R$ {(summary?.totalExpense || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-rose-400/80 mt-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Despesas e Manutenção</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl admin-card border border-indigo-500/30 bg-indigo-500/5">
          <span className="text-xs font-semibold text-indigo-300 block mb-1">Saldo Atual</span>
          <span className="text-2xl font-black text-white font-mono">
            R$ {(summary?.netBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <div className="text-[11px] text-indigo-400 mt-1 font-medium">
            Saldo Disponível em Conta
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 rounded-2xl admin-card border border-slate-800 flex flex-wrap gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2 border border-slate-800"
        >
          <option value="">Todos os Tipos (Receitas e Despesas)</option>
          <option value="RECEITA">Somente Receitas (Entradas)</option>
          <option value="DESPESA">Somente Despesas (Saídas)</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2 border border-slate-800"
        >
          <option value="">Todas as Categorias</option>
          <option value="DIZIMO">Dízimos</option>
          <option value="OFERTA">Ofertas de Culto</option>
          <option value="OFERTA_MISSOES">Missões</option>
          <option value="CAMPANHA">Campanhas</option>
          <option value="ALUGUEL">Aluguel</option>
          <option value="ENERGIA">Energia Elétrica</option>
          <option value="MANUTENCAO">Manutenção & Som</option>
        </select>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="rounded-2xl admin-card border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Data</th>
                <th className="px-5 py-3.5">Tipo / Categoria</th>
                <th className="px-5 py-3.5">Descrição / Membro</th>
                <th className="px-5 py-3.5">Pagamento</th>
                <th className="px-5 py-3.5">Valor (R$)</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 font-mono text-slate-400">
                    {t.date.split('-').reverse().join('/')}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        t.type === 'RECEITA'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {t.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{t.description || t.category}</div>
                    {t.member && (
                      <div className="text-[11px] text-amber-300 font-light">
                        Membro: {t.member.name}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-slate-400 uppercase text-[11px] font-medium">{t.paymentMethod}</span>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-sm">
                    <span className={t.type === 'RECEITA' ? 'text-emerald-400' : 'text-rose-400'}>
                      {t.type === 'RECEITA' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      title="Excluir Lançamento"
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-4">Novo Lançamento Financeiro</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData({
                        ...formData,
                        type: newType,
                        category: newType === 'RECEITA' ? 'DIZIMO' : 'DESPESA_FIXA',
                      });
                    }}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  >
                    <option value="RECEITA">Entrada (Receita)</option>
                    <option value="DESPESA">Saída (Despesa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  >
                    {formData.type === 'RECEITA' ? (
                      <>
                        <option value="DIZIMO">Dízimo</option>
                        <option value="OFERTA">Oferta de Culto</option>
                        <option value="OFERTA_MISSOES">Missões</option>
                        <option value="CAMPANHA">Campanha</option>
                        <option value="EVENTO">Inscrição de Evento</option>
                        <option value="OUTROS">Outras Receitas</option>
                      </>
                    ) : (
                      <>
                        <option value="ALUGUEL">Aluguel do Templo</option>
                        <option value="ENERGIA">Energia Elétrica</option>
                        <option value="AGUA">Água / Saneamento</option>
                        <option value="INTERNET">Internet & Telefonia</option>
                        <option value="MANUTENCAO">Manutenção & Equipamentos</option>
                        <option value="PRELETORES">Preletores Convidados</option>
                        <option value="ACAO_SOCIAL">Ação Social</option>
                        <option value="OUTROS">Outras Despesas</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
              </div>

              {formData.type === 'RECEITA' && formData.category === 'DIZIMO' && (
                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1">Membro Dizimista (Opcional)</label>
                  <select
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  >
                    <option value="">Dízimo Anônimo / Não cadastrado</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Forma de Pagamento</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  >
                    <option value="PIX">PIX</option>
                    <option value="DINHEIRO">Dinheiro em Espécie</option>
                    <option value="CARTAO">Cartão de Débito/Crédito</option>
                    <option value="TRANSFERENCIA">Transferência Bancária</option>
                    <option value="BOLETO">Boleto Bancário</option>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição / Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Oferta especial culto de santa ceia"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
