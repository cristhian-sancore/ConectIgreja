import React, { useState, useEffect } from 'react';
import {
  Award,
  FileText,
  Plus,
  Send,
  Printer,
  Calendar,
  User,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Trash2,
  Download,
} from 'lucide-react';

interface CertificatesPageProps {
  churches: any[];
  allMembers?: any[];
  currentSelectedChurchId?: string;
}

export const Certificates: React.FC<CertificatesPageProps> = ({
  churches = [],
  allMembers = [],
  currentSelectedChurchId,
}) => {
  const [activeTab, setActiveTab] = useState<'certificates' | 'dre'>('certificates');
  const [activeChurchId, setActiveChurchId] = useState<string>(
    currentSelectedChurchId || churches[0]?.id || ''
  );

  // Certificados
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [viewingCert, setViewingCert] = useState<any>(null);

  // Form Certificado
  const [certForm, setCertForm] = useState({
    memberId: '',
    type: 'BATISMO',
    title: 'Certificado de Batismo nas Águas',
    recipientName: '',
    date: new Date().toISOString().split('T')[0],
    pastorName: 'Pastor Samuel Oliveira',
    verse: '"Fomos, pois, sepultados com ele na morte pelo batismo; para que, como Cristo ressuscitou dentre os mortos, assim andemos nós também em novidade de vida." (Romanos 6:4)',
    notes: '',
  });

  // DRE / Prestação de Contas
  const [dreData, setDreData] = useState<any>(null);
  const [dreFilter, setDreFilter] = useState({
    startDate: '',
    endDate: '',
  });

  const selectedChurch = churches.find((c) => c.id === activeChurchId) || churches[0];

  const loadCertificates = async () => {
    try {
      const q = activeChurchId ? `?churchId=${activeChurchId}` : '';
      const res = await fetch(`/api/certificates${q}`);
      if (res.ok) setCertificates(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const loadDRE = async () => {
    try {
      const q = new URLSearchParams();
      if (activeChurchId) q.append('churchId', activeChurchId);
      if (dreFilter.startDate) q.append('startDate', dreFilter.startDate);
      if (dreFilter.endDate) q.append('endDate', dreFilter.endDate);

      const res = await fetch(`/api/reports/financial-statement?${q.toString()}`);
      if (res.ok) setDreData(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'certificates') loadCertificates();
    if (activeTab === 'dre') loadDRE();
  }, [activeTab, activeChurchId]);

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.recipientName || !activeChurchId) return;

    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...certForm, churchId: activeChurchId }),
      });
      if (res.ok) {
        setIsCertModalOpen(false);
        loadCertificates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendWhatsApp = async (cert: any) => {
    const phone = prompt('Informe o WhatsApp para envio com DDD (ex: 5511999999999):', '55');
    if (!phone) return;

    try {
      const res = await fetch(`/api/certificates/${cert.id}/send-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Certificado eclesiástico enviado com sucesso via WhatsApp!');
      } else {
        alert(`Aviso: ${data.error || 'Erro ao enviar'}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (confirm('Excluir este certificado?')) {
      await fetch(`/api/certificates/${id}`, { method: 'DELETE' });
      loadCertificates();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Topo com Alternador de Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Secretaria Eclesiástica & Conselho Fiscal
          </span>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            Certificados Eclesiásticos & Balanço DRE
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Emita certidões oficiais (Batismo, Apresentação) e gere o relatório contábil para Assembleia da Igreja.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeChurchId}
            onChange={(e) => setActiveChurchId(e.target.value)}
            className="bg-slate-900 text-xs font-bold text-white px-3.5 py-2 rounded-xl border border-slate-700 cursor-pointer"
          >
            <option value="">Todas as Congregações (Consolidado)</option>
            {churches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.isMain ? '★ Sede' : ''}
              </option>
            ))}
          </select>

          {activeTab === 'certificates' && (
            <button
              onClick={() => setIsCertModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Emitir Certificado
            </button>
          )}

          {activeTab === 'dre' && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              Imprimir Balanço para Assembleia
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'certificates'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          Certificados Eclesiásticos ({certificates.length})
        </button>

        <button
          onClick={() => setActiveTab('dre')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'dre'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Balanço DRE & Prestação de Contas (Assembleia)
        </button>
      </div>

      {/* ABA 1: CERTIFICADOS */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certificates.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40">
              <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">Nenhum certificado emitido ainda</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Clique em "Emitir Certificado" para gerar o certificado oficial de batismo nas águas ou apresentação de bebês.
              </p>
            </div>
          ) : (
            certificates.map((cert) => {
              const formattedDate = cert.date.split('-').reverse().join('/');

              return (
                <div
                  key={cert.id}
                  className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border-2 border-amber-500/30 shadow-xl relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        {cert.type === 'BATISMO' ? 'Batismo nas Águas' : cert.type === 'APRESENTACAO_BEBE' ? 'Apresentação ao Senhor' : 'Credencial Eclesiástica'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{formattedDate}</span>
                    </div>

                    <h3 className="font-heading font-black text-lg text-white mb-1">
                      {cert.recipientName}
                    </h3>
                    <span className="text-xs text-slate-300 block mb-3">
                      Congregação: <strong className="text-white">{cert.church?.name}</strong>
                    </span>

                    {cert.verse && (
                      <p className="text-xs text-amber-200/90 italic bg-slate-950/60 p-3 rounded-xl border border-amber-500/20 mb-3">
                        {cert.verse}
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400">
                      Pastor Celebrante: <strong className="text-white">{cert.pastorName}</strong>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setViewingCert(cert)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                    >
                      Visualizar Diploma →
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendWhatsApp(cert)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
                        title="Enviar no WhatsApp do membro"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Enviar no WhatsApp
                      </button>

                      <button
                        onClick={() => handleDeleteCert(cert.id)}
                        className="p-1.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ABA 2: BALANÇO FINANCEIRO DRE (ASSEMBLEIA) */}
      {activeTab === 'dre' && dreData && (
        <div className="space-y-6">
          {/* Card Resumo Consolidado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-400 uppercase">Receita Total (Entradas)</span>
              <div className="text-2xl font-black text-white mt-1">
                R$ {dreData.summary?.totalIncome?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-400">Dízimos, ofertas, campanhas e missões</span>
            </div>

            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30">
              <span className="text-xs font-bold text-rose-400 uppercase">Despesas Totais (Saídas)</span>
              <div className="text-2xl font-black text-white mt-1">
                R$ {dreData.summary?.totalExpense?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-400">Aluguel, manutenção, água, luz e insumos</span>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30">
              <span className="text-xs font-bold text-indigo-400 uppercase">Superávit / Saldo Líquido</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                R$ {dreData.summary?.netBalance?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-400">Resultado operacional do período</span>
            </div>
          </div>

          {/* Tabelas de Receitas e Despesas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Receitas */}
            <div className="p-6 rounded-2xl admin-card border border-slate-800">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Demonstrativo de Entradas por Categoria
              </h3>
              <div className="space-y-3">
                {dreData.incomeByCategory?.map((item: any) => (
                  <div key={item.category} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{item.category}</span>
                    <div className="text-right">
                      <span className="text-white font-mono font-bold block">
                        R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Despesas */}
            <div className="p-6 rounded-2xl admin-card border border-slate-800">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Demonstrativo de Saídas por Categoria
              </h3>
              <div className="space-y-3">
                {dreData.expenseByCategory?.map((item: any) => (
                  <div key={item.category} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{item.category}</span>
                    <div className="text-right">
                      <span className="text-white font-mono font-bold block">
                        R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-rose-400 font-mono">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campo de Assinaturas para Assembleia Geral */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-8">
              Aprovado em Assembleia Geral Ordinária pela Diretoria e Conselho Fiscal:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="border-t border-slate-700 pt-2">
                <span className="text-xs font-bold text-white block">Pastor Presidente</span>
                <span className="text-[10px] text-slate-400">{dreData.church?.pastorName || 'Pr. Samuel Oliveira'}</span>
              </div>
              <div className="border-t border-slate-700 pt-2">
                <span className="text-xs font-bold text-white block">1º Tesoureiro(a)</span>
                <span className="text-[10px] text-slate-400">Responsável Contábil</span>
              </div>
              <div className="border-t border-slate-700 pt-2">
                <span className="text-xs font-bold text-white block">Presidente do Conselho Fiscal</span>
                <span className="text-[10px] text-slate-400">Comissão de Membros</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Emitir Certificado */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-white mb-4">Emitir Certificado Eclesiástico Oficial</h3>
            <form onSubmit={handleCreateCertificate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Certificado *</label>
                <select
                  value={certForm.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    const defaultTitles: Record<string, string> = {
                      BATISMO: 'Certificado de Batismo nas Águas',
                      APRESENTACAO_BEBE: 'Certificado de Apresentação ao Senhor',
                      MEMBRESIA: 'Certificado de Membresia Congregacional',
                      CONSAGRACAO_OBREIRO: 'Certificado de Consagração Ministerial',
                    };
                    const defaultVerses: Record<string, string> = {
                      BATISMO: '"Fomos, pois, sepultados com ele na morte pelo batismo; para que, como Cristo ressuscitou dentre os mortos, assim andemos nós também em novidade de vida." (Romanos 6:4)',
                      APRESENTACAO_BEBE: '"Ensina a criança no caminho em que deve andar, e até quando envelhecer não se desviará dele." (Provérbios 22:6)',
                      MEMBRESIA: '"Assim nós, que somos muitos, somos um só corpo em Cristo, mas individualmente membros uns dos outros." (Romanos 12:5)',
                      CONSAGRACAO_OBREIRO: '"Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar." (2 Timóteo 2:15)',
                    };
                    setCertForm({
                      ...certForm,
                      type,
                      title: defaultTitles[type] || '',
                      verse: defaultVerses[type] || '',
                    });
                  }}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                >
                  <option value="BATISMO">Batismo nas Águas</option>
                  <option value="APRESENTACAO_BEBE">Apresentação de Criança / Bebê</option>
                  <option value="MEMBRESIA">Membresia Congregacional</option>
                  <option value="CONSAGRACAO_OBREIRO">Consagração de Obreiro / Diácono</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Homenageado / Membro *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo impresso no diploma"
                  value={certForm.recipientName}
                  onChange={(e) => setCertForm({ ...certForm, recipientName: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data da Celebração *</label>
                  <input
                    type="date"
                    required
                    value={certForm.date}
                    onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pastor Celebrante *</label>
                  <input
                    type="text"
                    required
                    value={certForm.pastorName}
                    onChange={(e) => setCertForm({ ...certForm, pastorName: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Versículo Bíblico do Diploma</label>
                <textarea
                  rows={2}
                  value={certForm.verse}
                  onChange={(e) => setCertForm({ ...certForm, verse: e.target.value })}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                >
                  Emitir Certificado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualização do Diploma / Impressão */}
      {viewingCert && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border-4 border-amber-500/60 rounded-3xl max-w-2xl w-full p-8 shadow-2xl animate-scaleUp text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg shadow-amber-500/10">
              🕊️
            </div>

            <span className="text-xs font-black tracking-widest text-amber-400 uppercase block mb-1">
              {viewingCert.church?.name}
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight mb-4">
              {viewingCert.title}
            </h2>

            <p className="text-xs text-slate-300 mb-3">Certificamos com júbilo espiritual que</p>
            <div className="text-2xl font-black text-amber-300 font-heading mb-4">
              {viewingCert.recipientName}
            </div>

            <p className="text-xs text-slate-300 max-w-lg mx-auto mb-6">
              Participou solemnemente deste marco de fé no dia{' '}
              <strong className="text-white">{viewingCert.date.split('-').reverse().join('/')}</strong>,
              comprometendo-se a caminhar em novidade de vida para a glória de Deus Pai.
            </p>

            {viewingCert.verse && (
              <div className="p-3 bg-slate-900/80 rounded-xl border border-amber-500/30 text-xs text-amber-200/90 italic max-w-md mx-auto mb-8">
                {viewingCert.verse}
              </div>
            )}

            <div className="flex justify-around items-center pt-6 border-t border-slate-800 mb-6">
              <div>
                <div className="text-xs font-bold text-white">{viewingCert.pastorName}</div>
                <span className="text-[10px] text-slate-400">Pastor Celebrante</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">{viewingCert.church?.city || 'São Paulo'} - SP</div>
                <span className="text-[10px] text-slate-400">Data da Celebração</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setViewingCert(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Fechar
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir Diploma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
