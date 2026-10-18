import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Listar todas as congregações
router.get('/', async (req, res) => {
  try {
    const churches = await prisma.church.findMany({
      orderBy: [{ isMain: 'desc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { members: true, cells: true, events: true },
        },
      },
    });
    res.json(churches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Detalhes de uma igreja
router.get('/:id', async (req, res) => {
  try {
    const church = await prisma.church.findUnique({
      where: { id: req.params.id },
      include: {
        automations: true,
        _count: {
          select: { members: true, cells: true },
        },
      },
    });
    if (!church) return res.status(404).json({ error: 'Igreja não encontrada' });
    res.json(church);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cadastrar nova igreja / filial
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const church = await prisma.church.create({
      data: {
        name: data.name,
        slug,
        isMain: data.isMain || false,
        pastorName: data.pastorName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        pixKey: data.pixKey,
        pixType: data.pixType || 'ALEATORIA',
        pixRecipient: data.pixRecipient,
        youtubeChannelId: data.youtubeChannelId,
        youtubeLiveUrl: data.youtubeLiveUrl,
        instagramHandle: data.instagramHandle,
        facebookUrl: data.facebookUrl,
        welcomeMessage: data.welcomeMessage,
      },
    });

    // Cria automação padrão para a nova igreja
    await prisma.automationConfig.create({
      data: {
        churchId: church.id,
      },
    });

    res.status(201).json(church);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar dados da congregação
router.put('/:id', async (req, res) => {
  try {
    const updated = await prisma.church.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Excluir igreja
router.delete('/:id', async (req, res) => {
  try {
    await prisma.church.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Igreja removida com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
