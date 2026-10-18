import React, { useState } from 'react';
import { Play, Video, ExternalLink, Radio, Clock, Eye, Sparkles } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
  isLive?: boolean;
}

interface LiveStreamProps {
  isLive: boolean;
  liveUrl?: string;
  videoId?: string;
  videos: YouTubeVideo[];
  channelId?: string;
}

export const LiveStream: React.FC<LiveStreamProps> = ({
  isLive = false,
  liveUrl,
  videoId,
  videos = [],
  channelId,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  // ID padrão para o player de culto gravado caso não haja live
  const featuredVideoId = isLive ? (videoId || 'dQw4w9WgXcQ') : (videos[0]?.id || 'dQw4w9WgXcQ');

  return (
    <section id="aovivo" className="py-20 relative bg-slate-900/60 border-t border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-3">
              <Radio className={`w-3.5 h-3.5 ${isLive ? 'animate-live' : ''}`} />
              <span>{isLive ? 'TRANSMISSÃO EM TEMPO REAL' : 'TRANSMISSÕES & MENSAGENS'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Cultos Ao Vivo & Palavras Ministradas
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              Assista de onde estiver. Conecte-se conosco em adoração e receba uma palavra profética para o seu coração.
            </p>
          </div>

          <a
            href={channelId ? `https://youtube.com/channel/${channelId}?sub_confirmation=1` : "https://youtube.com"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-800/40 px-4 py-2.5 rounded-xl transition-all self-start md:self-auto"
          >
            <Video className="w-4 h-4 text-red-500" />
            Inscrever-se no Canal
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>

        {/* Player Principal de Destaque */}
        <div className="relative rounded-3xl overflow-hidden glass-panel-glow border border-slate-700/80 shadow-2xl mb-14">
          {/* Tarja de Status da Transmissão */}
          <div className="bg-slate-950/90 px-6 py-3.5 flex flex-wrap items-center justify-between border-b border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              {isLive ? (
                <div className="flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg shadow-red-600/40">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  🔴 AO VIVO AGORA
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-800 text-slate-300 text-xs font-medium px-3 py-1 rounded-full border border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Última Transmissão Gravada
                </div>
              )}
              <span className="text-slate-300 text-sm font-semibold truncate max-w-md">
                {isLive ? 'Culto de Adoração & Ceia do Senhor - Templo Sede' : (videos[0]?.title || 'Culto da Família')}
              </span>
            </div>

            <a
              href={liveUrl || (videos[0]?.url) || "https://youtube.com"}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir no YouTube
            </a>
          </div>

          {/* Iframe do YouTube com Proporção 16:9 */}
          <div className="relative w-full aspect-video bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${featuredVideoId}?autoplay=0&rel=0`}
              title="Transmissão do Culto"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Grade de Vídeos / Mensagens Recentes */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Pregações e Estudos Recentes
            </h3>
            <span className="text-xs text-slate-400">Canal Oficial da Igreja</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="group rounded-2xl glass-panel overflow-hidden border border-slate-800 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col cursor-pointer"
                onClick={() => setSelectedVideo(vid)}
              >
                <div className="relative aspect-video overflow-hidden bg-slate-950">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h4 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-amber-300 transition-colors mb-2">
                      {vid.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 font-light">
                      {vid.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-500">
                    <span>{new Date(vid.publishedAt).toLocaleDateString('pt-BR')}</span>
                    <span className="text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Assistir
                      <Play className="w-3 h-3 fill-indigo-400" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Vídeo */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl animate-scaleUp">
              <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
                <h4 className="text-white font-bold text-sm sm:text-base truncate max-w-xl">
                  {selectedVideo.title}
                </h4>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-slate-400 hover:text-white px-3 py-1 rounded-lg hover:bg-slate-800"
                >
                  ✕ Fechar
                </button>
              </div>
              <div className="aspect-video w-full bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
