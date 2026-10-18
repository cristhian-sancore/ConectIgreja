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
  const [isIndependentUrl, setIsIndependentUrl] = useState(false);

  // Carrega a igreja baseada na URL independente (?igreja=slug ou /igreja/slug)
  useEffect(() => {
    async function initChurch() {
      // 1. Detecta slug na URL (ex: ?igreja=filial-esperanca ou /igreja/filial-esperanca ou /filial-esperanca)
      const searchParams = new URLSearchParams(window.location.search);
      const querySlug = searchParams.get('igreja') || searchParams.get('slug');
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const pathSlug = pathSegments[0] === 'igreja' ? pathSegments[1] : (pathSegments[0] && !pathSegments[0].includes('.') ? pathSegments[0] : null);
      const targetSlug = querySlug || pathSlug;

      try {
        // Carrega todas as congregações
        const allRes = await fetch('/api/public/churches');
        let allChurches: any[] = [];
        if (allRes.ok) {
          allChurches = await allRes.json();
          setChurches(allChurches);
        }

        // Se a URL especificou uma igreja independente:
        if (targetSlug) {
          setIsIndependentUrl(true);
          const slugRes = await fetch(`/api/public/church?slug=${encodeURIComponent(targetSlug)}`);
          if (slugRes.ok) {
            const specificChurch = await slugRes.json();
            setSelectedChurchId(specificChurch.id);
            setChurch(specificChurch);
            document.title = `${specificChurch.name} | ConectIgreja`;
            return;
          }
        }

        // Caso contrário, carrega a Sede ou a primeira congregação
        const main = allChurches.find((c: any) => c.isMain) || allChurches[0];
        if (main) {
          setSelectedChurchId(main.id);
          setChurch(main);
          document.title = `${main.name} | ConectIgreja`;
        }
      } catch (err) {
        console.warn('Usando fallback da congregação', err);
      } finally {
        setLoading(false);
      }
    }

    initChurch();
  }, []);

  // Carrega eventos, células e mídias exclusivos da igreja selecionada
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
    if (found) {
      setChurch(found);
      document.title = `${found.name} | ConectIgreja`;
      // Atualiza a URL no navegador sem recarregar para manter URL independente
      const newUrl = `${window.location.pathname}?igreja=${found.slug}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const nextEvent = events.length > 0 ? events[0] : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        churchName={church?.name || 'ConectIgreja'}
        phone={church?.phone}
        churches={isIndependentUrl ? [church].filter(Boolean) : churches}
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
          liveUrl={church?.youtubeLiveUrl || media?.live?.liveUrl}
          videoId={media?.live?.videoId}
          videos={media?.videos || []}
          channelId={church?.youtubeChannelId}
        />

        <Schedule
          events={events}
          churchAddress={church?.address ? `${church.address}, ${church.neighborhood || ''} - ${church.city || ''}` : undefined}
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
