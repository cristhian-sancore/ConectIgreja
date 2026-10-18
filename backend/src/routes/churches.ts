import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Listar todas as congregações (com contagem e membros vinculados)
router.get('/', async (req, res) => {
  try {
    const churches = await prisma.church.findMany({
      orderBy: [{ isMain: 'desc' }, { name: 'asc' }],
      include: {
        automations: {
          select: { instanceName: true, instancePhone: true, instanceStatus: true },
        },
        members: {
          select: { id: true, name: true, phone: true, role: true, birthDate: true },
        },
        _count: {
          select: { members: true, cells: true, events: true, transactions: true },
        },
      },
    });
    res.json(churches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Detalhes de uma congregação com todos os membros vinculados
router.get('/:id', async (req, res) => {
  try {
    const church = await prisma.church.findUnique({
      where: { id: req.params.id },
      include: {
        automations: true,
        members: {
          select: { id: true, name: true, phone: true, role: true, birthDate: true, baptismDate: true },
          orderBy: { name: 'asc' },
        },
        cells: {
          select: { id: true, name: true, leaderName: true, neighborhood: true },
        },
        _count: {
          select: { members: true, cells: true, events: true },
        },
      },
    });
    if (!church) return res.status(404).json({ error: 'Igreja não encontrada' });
    res.json(church);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cadastrar nova igreja / filial com vinculação de membros
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const slug = (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')).replace(/--+/g, '-');

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
        state: data.state || 'SP',
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

    // Cria automação com instância nomeada para a nova cidade
    const defaultInstance = `igreja-${data.city ? data.city.toLowerCase().replace(/[^a-z0-9]/g, '') : slug}`;
    await prisma.automationConfig.create({
      data: {
        churchId: church.id,
        instanceName: defaultInstance,
      },
    });

    // Vincula membros se fornecidos
    if (Array.isArray(data.memberIds) && data.memberIds.length > 0) {
      await prisma.member.updateMany({
        where: { id: { in: data.memberIds } },
        data: { churchId: church.id },
      });
    }

    res.status(201).json(church);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar dados da congregação e seus membros vinculados
router.put('/:id', async (req, res) => {
  try {
    const { memberIds, ...churchData } = req.body;

    const updated = await prisma.church.update({
      where: { id: req.params.id },
      data: churchData,
    });

    // Se foram passados IDs de membros para vincular a esta igreja
    if (Array.isArray(memberIds)) {
      await prisma.member.updateMany({
        where: { id: { in: memberIds } },
        data: { churchId: updated.id },
      });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Vincular membros a uma igreja diretamente
router.post('/:id/link-members', async (req, res) => {
  try {
    const { memberIds } = req.body;
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: 'Nenhum membro informado.' });
    }

    await prisma.member.updateMany({
      where: { id: { in: memberIds } },
      data: { churchId: req.params.id },
    });

    res.json({ success: true, message: `${memberIds.length} membros vinculados com sucesso a esta congregação.` });
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
