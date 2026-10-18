import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LiveStream } from './components/LiveStream';
import { Schedule } from './components/Schedule';
import { FindCell } from './components/FindCell';
import { SocialGallery } from './components/SocialGallery';
import { PrayerSection } from './components/PrayerSection';
import { GiveSection } from './components/GiveSection';
import { Footer } from './components/Footer';

export default function App() {
  const [churches, setChurches] = useState<any[]>([]);
  const [selectedChurchId, setSelectedChurchId] = useState<string>('');
  const [church, setChurch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [cells, setCells] = useState<any[]>([]);
  const [media, setMedia] = useState<any>({ live: { isLive: false }, videos: [], socialGallery: [] });
  const [loading, setLoading] = useState(true);

  // Carrega a lista de congregações
  useEffect(() => {
    async function loadChurches() {
      try {
        const res = await fetch('/api/public/churches');
        if (res.ok) {
          const data = await res.json();
          setChurches(data);
          const main = data.find((c: any) => c.isMain) || data[0];
          if (main) {
            setSelectedChurchId(main.id);
            setChurch(main);
          }
        }
      } catch (err) {
        console.warn('Usando dados locais da congregação', err);
        // Fallback elegante
        const mockChurch = {
          id: '1',
          name: 'Igreja Conectada - Sede Central',
          isMain: true,
          pastorName: 'Pastor Samuel Oliveira',
          phone: '5511988887777',
          email: 'contato@conectigreja.cristhiansancore.com.br',
          address: 'Av. das Nações, 1500',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          pixKey: 'contato@conectigreja.cristhiansancore.com.br',
          pixType: 'E-mail',
          pixRecipient: 'Igreja Conectada Sede',
          instagramHandle: '@conectigreja.oficial',
          facebookUrl: 'https://facebook.com',
          welcomeMessage: 'Seja bem-vindo à nossa casa! Uma comunidade viva para você e toda a sua família.',
        };
        setChurches([mockChurch]);
        setSelectedChurchId('1');
        setChurch(mockChurch);
      } finally {
        setLoading(false);
      }
    }
    loadChurches();
  }, []);

  // Carrega eventos, células e mídias quando mudar a igreja selecionada
  useEffect(() => {
    async function loadData() {
      if (!selectedChurchId) return;

      try {
        const [evRes, cellRes, mediaRes] = await Promise.all([
          fetch(`/api/public/events?churchId=${selectedChurchId}`),
          fetch(`/api/public/cells?churchId=${selectedChurchId}`),
          fetch(`/api/public/media`),
        ]);

        if (evRes.ok) setEvents(await evRes.json());
        if (cellRes.ok) setCells(await cellRes.json());
        if (mediaRes.ok) setMedia(await mediaRes.json());
      } catch (e) {
        console.warn('Erro ao carregar dados complementares', e);
      }
    }
    loadData();
  }, [selectedChurchId]);

  const handleSelectChurch = (id: string) => {
    setSelectedChurchId(id);
    const found = churches.find((c) => c.id === id);
    if (found) setChurch(found);
  };

  const nextEvent = events.length > 0 ? events[0] : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        churchName={church?.name || 'ConectIgreja'}
        phone={church?.phone}
        churches={churches}
        selectedChurchId={selectedChurchId}
        onSelectChurch={handleSelectChurch}
      />

      <main className="flex-1">
        <Hero
          churchName={church?.name || 'ConectIgreja'}
          pastorName={church?.pastorName}
          welcomeMessage={church?.welcomeMessage}
          address={church?.address}
          city={church?.city ? `${church?.city} - ${church?.state || 'SP'}` : undefined}
          nextEvent={nextEvent}
        />

        <LiveStream
          isLive={media?.live?.isLive || false}
          liveUrl={media?.live?.liveUrl}
          videoId={media?.live?.videoId}
          videos={media?.videos || []}
          channelId={church?.youtubeChannelId}
        />

        <Schedule
          events={events}
          churchAddress={church?.address ? `${church.address}, ${church.neighborhood || ''}` : undefined}
        />

        <FindCell cells={cells} />

        <SocialGallery
          gallery={media?.socialGallery}
          instagramHandle={church?.instagramHandle}
          facebookUrl={church?.facebookUrl}
        />

        <PrayerSection churchId={church?.id} />

        <GiveSection
          pixKey={church?.pixKey}
          pixType={church?.pixType}
          pixRecipient={church?.pixRecipient}
          churchName={church?.name}
        />
      </main>

      <Footer
        churchName={church?.name}
        pastorName={church?.pastorName}
        address={church?.address ? `${church.address} - ${church.city || ''} / ${church.state || ''}` : undefined}
        phone={church?.phone}
        email={church?.email}
        instagramHandle={church?.instagramHandle}
        facebookUrl={church?.facebookUrl}
        youtubeChannelId={church?.youtubeChannelId}
      />
    </div>
  );
}
