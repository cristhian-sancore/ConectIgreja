import axios from 'axios';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
  isLive?: boolean;
}

export class YouTubeService {
  /**
   * Obtém os vídeos mais recentes do canal da igreja
   */
  static async getChannelVideos(channelId?: string, apiKey?: string): Promise<YouTubeVideo[]> {
    if (apiKey && channelId) {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=6`,
          { timeout: 8000 }
        );

        if (response.data && response.data.items) {
          return response.data.items
            .filter((item: any) => item.id.kind === 'youtube#video')
            .map((item: any) => ({
              id: item.id.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
              publishedAt: item.snippet.publishedAt,
              url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
              isLive: item.snippet.liveBroadcastContent === 'live',
            }));
        }
      } catch (err: any) {
        console.warn('[YouTubeService] Erro ao buscar via API, usando fallback:', err.message);
      }
    }

    // Vídeos de demonstração / fallback para garantir que o site nunca fique com buracos vazios
    return [
      {
        id: "live_culto_domingo",
        title: "Culto da Família: O Poder da Fé e Esperança que Transforma",
        description: "Mensagem inspiradora ministrada no Templo Sede para toda a família.",
        thumbnail: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        isLive: false,
      },
      {
        id: "culto_ensino_quarta",
        title: "Quarta Profética: Mergulhando nas Profundezas da Palavra",
        description: "Estudo bíblico e clamor pelas famílias.",
        thumbnail: "https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=1200&q=80",
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        isLive: false,
      },
      {
        id: "conferencia_jovens",
        title: "Conferência Aviva: Uma Geração Apaixonada por Cristo",
        description: "Louvor, adoração e comunhão com os jovens da nossa igreja.",
        thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
        publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        isLive: false,
      },
      {
        id: "louvor_adoracao",
        title: "Noite de Louvor & Adoração: Ministração ao Vivo",
        description: "Momento íntimo na presença do Espírito Santo.",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        isLive: false,
      }
    ];
  }

  /**
   * Verifica se há culto ao vivo acontecendo agora
   */
  static async checkLiveStream(channelId?: string, apiKey?: string, customLiveUrl?: string): Promise<{ isLive: boolean; videoId?: string; liveUrl?: string; title?: string }> {
    if (customLiveUrl && customLiveUrl.trim() !== '') {
      return {
        isLive: true,
        liveUrl: customLiveUrl,
        title: "Culto Ao Vivo no Templo Sede"
      };
    }

    if (apiKey && channelId) {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&type=video&eventType=live`,
          { timeout: 8000 }
        );
        if (response.data && response.data.items && response.data.items.length > 0) {
          const item = response.data.items[0];
          return {
            isLive: true,
            videoId: item.id.videoId,
            liveUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            title: item.snippet.title,
          };
        }
      } catch (err: any) {
        console.warn('[YouTubeService] Erro ao checar Live:', err.message);
      }
    }

    // Por padrão retorna status de live desativada se não estiver transmitindo
    return {
      isLive: false,
      videoId: undefined,
      liveUrl: undefined,
      title: undefined
    };
  }
}
