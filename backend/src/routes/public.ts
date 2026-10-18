import { Router } from 'express';
import prisma from '../prisma';
import { YouTubeService } from '../services/youtube';

const router = Router();

// Informações da Igreja Principal (ou por query ?slug=...)
router.get('/church', async (req, res) => {
  try {
    const { slug } = req.query;
    let church = null;

    if (slug) {
      church = await prisma.church.findUnique({
        where: { slug: String(slug) },
      });
    }

    if (!church) {
      church = await prisma.church.findFirst({
        where: { isMain: true },
      });
    }

    if (!church) {
      church = await prisma.church.findFirst();
    }

    if (!church) {
      return res.status(404).json({ error: 'Nenhuma congregação cadastrada.' });
    }

    res.json(church);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Informações da Igreja por parâmetro direto na URL (/api/public/church/:slug)
router.get('/church/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const church = await prisma.church.findUnique({
      where: { slug },
    });
    if (!church) {
      return res.status(404).json({ error: `Congregação com slug '${slug}' não encontrada.` });
    }
    res.json(church);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Todas as congregações (Sede e Filiais)
router.get('/churches', async (req, res) => {
  try {
    const churches = await prisma.church.findMany({
      orderBy: [{ isMain: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        isMain: true,
        pastorName: true,
        phone: true,
        email: true,
        address: true,
        neighborhood: true,
        city: true,
        state: true,
        pixKey: true,
        pixType: true,
        pixRecipient: true,
        logoUrl: true,
        welcomeMessage: true,
        youtubeLiveUrl: true,
        instagramHandle: true,
        facebookUrl: true,
      },
    });
    res.json(churches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cultos e Programações públicas
router.get('/events', async (req, res) => {
  try {
    const { churchId } = req.query;
    const where: any = { isPublic: true };
    if (churchId) where.churchId = String(churchId);

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        church: { select: { name: true, address: true, city: true } },
      },
    });

    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Células abertas para o público
router.get('/cells', async (req, res) => {
  try {
    const { churchId, neighborhood } = req.query;
    const where: any = { isActive: true };
    if (churchId) where.churchId = String(churchId);
    if (neighborhood) where.neighborhood = { contains: String(neighborhood) };

    const cells = await prisma.cell.findMany({
      where,
      orderBy: { neighborhood: 'asc' },
      select: {
        id: true,
        name: true,
        leaderName: true,
        leaderPhone: true,
        hostName: true,
        weekday: true,
        time: true,
        neighborhood: true,
        address: true,
        targetAudience: true,
        church: { select: { name: true } },
      },
    });

    res.json(cells);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mídias: Transmissão ao vivo e vídeos do YouTube + Fotos das Redes Sociais
router.get('/media', async (req, res) => {
  try {
    const church = await prisma.church.findFirst({
      where: { isMain: true },
    });

    const liveStatus = await YouTubeService.checkLiveStream(
      church?.youtubeChannelId || undefined,
      undefined,
      church?.youtubeLiveUrl || undefined
    );

    const videos = await YouTubeService.getChannelVideos(church?.youtubeChannelId || undefined);

    // Fotos de eventos e cultos recentes (Instagram / Facebook feed)
    const socialGallery = [
      {
        id: 'soc-1',
        title: 'Culto de Celebração de Domingo',
        caption: 'Uma noite inesquecível na presença de Deus com nossa família reunida.',
        imageUrl: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=1000&q=80',
        date: 'Ontem',
        platform: 'instagram',
        likes: 184,
      },
      {
        id: 'soc-2',
        title: 'Batismo nas Águas',
        caption: 'Novas vidas declarando publicamente sua fé em Jesus Cristo! Glórias ao Rei!',
        imageUrl: 'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=1000&q=80',
        date: '3 dias atrás',
        platform: 'instagram',
        likes: 247,
      },
      {
        id: 'soc-3',
        title: 'Multiplicação de Célula no Bairro Primavera',
        caption: 'O evangelho avançando de casa em casa com muito amor e alegria.',
        imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1000&q=80',
        date: '5 dias atrás',
        platform: 'facebook',
        likes: 92,
      },
      {
        id: 'soc-4',
        title: 'Noite de Clamor dos Jovens',
        caption: 'Geração apaixonada por Jesus se rendendo ao chamado do Senhor.',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
        date: '1 semana atrás',
        platform: 'instagram',
        likes: 310,
      },
    ];

    res.json({
      live: liveStatus,
      videos,
      socialGallery,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Envio de Pedido de Oração a partir do site público
router.post('/prayer-request', async (req, res) => {
  try {
    const { churchId, name, phone, email, message, isConfidential } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: 'Nome e mensagem de oração são obrigatórios.' });
    }

    let targetChurchId = churchId;
    if (!targetChurchId) {
      const mainChurch = await prisma.church.findFirst({ where: { isMain: true } });
      targetChurchId = mainChurch?.id;
    }

    if (!targetChurchId) {
      const anyChurch = await prisma.church.findFirst();
      targetChurchId = anyChurch?.id;
    }

    const prayer = await prisma.prayerRequest.create({
      data: {
        churchId: targetChurchId,
        name,
        phone,
        email,
        message,
        isConfidential: isConfidential || false,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Seu pedido de oração foi recebido com muito amor por nossa equipe de intercessão!',
      id: prayer.id,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
