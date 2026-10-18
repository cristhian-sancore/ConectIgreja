import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Finances } from './pages/Finances';
import { Cells } from './pages/Cells';
import { Events } from './pages/Events';
import { Automation } from './pages/Automation';
import { Churches } from './pages/Churches';
import { Prayer } from './pages/Prayer';
import { UsersPage } from './pages/Users';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedChurchId, setSelectedChurchId] = useState('');
  const [churches, setChurches] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [cells, setCells] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [birthdays, setBirthdays] = useState<any>({ birthdays: [], baptisms: [], total: 0 });
  const [prayerRequests, setPrayerRequests] = useState<any[]>([]);
  const [evolutionStatus, setEvolutionStatus] = useState('open');

  const loadAllData = async () => {
    try {
      const q = selectedChurchId ? `?churchId=${selectedChurchId}` : '';

      const [cRes, mRes, cellRes, evRes, transRes, sumRes, bRes, pRes, stRes] = await Promise.all([
        fetch('/api/churches'),
        fetch(`/api/members${q}`),
        fetch(`/api/cells${q}`),
        fetch(`/api/events${q}`),
        fetch(`/api/finances/transactions${q}`),
        fetch(`/api/finances/summary${q}`),
        fetch(`/api/members/birthdays/today${q}`),
        fetch(`/api/prayer-requests${q}`),
        fetch('/api/automation/status'),
      ]);

      if (cRes.ok) setChurches(await cRes.json());
      if (mRes.ok) setMembers(await mRes.json());
      if (cellRes.ok) setCells(await cellRes.json());
      if (evRes.ok) setEvents(await evRes.json());
      if (transRes.ok) setTransactions(await transRes.json());
      if (sumRes.ok) setSummary(await sumRes.json());
      if (bRes.ok) setBirthdays(await bRes.json());
      if (pRes.ok) setPrayerRequests(await pRes.json());

      if (stRes.ok) {
        const stData = await stRes.json();
        setEvolutionStatus(stData.data?.instance?.state || 'open');
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do admin:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedChurchId]);

  const handleSendMemberWhatsApp = async (memberId: string, type: 'BIRTHDAY' | 'BAPTISM' | 'CUSTOM', customText?: string) => {
    try {
      const res = await fetch(`/api/members/${memberId}/send-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, text: customText }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Mensagem enviada com sucesso no WhatsApp do membro!');
      } else {
        alert(`Aviso: ${data.error || 'Falha ao enviar'}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleTriggerDailyBirthdays = async () => {
    try {
      const res = await fetch('/api/automation/trigger-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId: selectedChurchId || undefined }),
      });
      const data = await res.json();
      alert(`Robô de Aniversários executado com sucesso: ${data.count} mensagens enviadas.`);
      loadAllData();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Barra Lateral de Navegação */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        evolutionStatus={evolutionStatus}
        todayBirthdaysCount={birthdays?.total || 0}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          churches={churches}
          selectedChurchId={selectedChurchId}
          onSelectChurch={setSelectedChurchId}
          todayBirthdaysCount={birthdays?.total || 0}
          onTriggerDailyBirthdays={handleTriggerDailyBirthdays}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              summary={summary}
              birthdays={birthdays}
              onSendMemberWhatsApp={handleSendMemberWhatsApp}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'members' && (
            <Members
              members={members}
              churches={churches}
              cells={cells}
              onRefresh={loadAllData}
              onSendWhatsApp={handleSendMemberWhatsApp}
            />
          )}

          {currentTab === 'finances' && (
            <Finances
              summary={summary}
              transactions={transactions}
              churches={churches}
              members={members}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'cells' && (
            <Cells
              cells={cells}
              churches={churches}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'events' && (
            <Events
              events={events}
              churches={churches}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'automation' && (
            <Automation
              churches={churches}
              currentSelectedChurchId={selectedChurchId}
              onSelectChurch={setSelectedChurchId}
            />
          )}

          {currentTab === 'users' && (
            <UsersPage
              churches={churches}
            />
          )}

          {currentTab === 'prayer' && (
            <Prayer
              requests={prayerRequests}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'churches' && (
            <Churches
              churches={churches}
              onRefresh={loadAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
