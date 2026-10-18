import { Router } from 'express';
import prisma from '../prisma';
import { EvolutionService } from '../services/evolution';

const router = Router();

// Listar eventos e cultos
router.get('/', async (req, res) => {
  try {
    const { churchId, isPublic, category } = req.query;

    const where: any = {};
    if (churchId) where.churchId = String(churchId);
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';
    if (category) where.category = String(category);

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        church: { select: { name: true, address: true } },
      },
    });

    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Criar culto ou evento
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const event = await prisma.event.create({
      data: {
        churchId: data.churchId,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        startTime: data.startTime || '19:30',
        endDate: data.endDate,
        endTime: data.endTime,
        location: data.location,
        category: data.category || 'CULTO',
        isRecurring: data.isRecurring || false,
        recurringDay: data.recurringDay,
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        bannerUrl: data.bannerUrl,
      },
    });
    res.status(201).json(event);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar evento
router.put('/:id', async (req, res) => {
  try {
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Excluir evento
router.delete('/:id', async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Evento excluído com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Disparar aviso deste evento específico nos grupos do WhatsApp
router.post('/:id/broadcast-whatsapp', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        church: { include: { automations: true } },
      },
    });

    if (!event) return res.status(404).json({ error: 'Evento não encontrado' });
    const config = event.church.automations;
    if (!config) return res.status(400).json({ error: 'Automação não configurada para esta congregação' });

    let groups = [];
    try {
      groups = JSON.parse(config.whatsappGroups || '[]');
    } catch {
      groups = [];
    }

    if (groups.length === 0) {
      return res.status(400).json({ error: 'Nenhum grupo de WhatsApp configurado nas opções da igreja' });
    }

    const mensagem = `📢 *AVISO IMPORTANTE - ${event.church.name}* 🕊️\n\n🗓️ *${event.title}*\n⏰ ${event.startDate}${event.startTime ? ` às ${event.startTime}` : ''}\n📍 ${event.location || event.church.address || 'Templo Sede'}\n\n${event.description || ''}\n\nEsperamos por você e sua família! Compartilhe e convide um amigo! 🙏✨`;

    const customCfg = {
      url: config.evolutionUrl,
      apiKey: config.evolutionApiKey,
      instance: config.instanceName,
    };

    const dispatches = [];
    for (const g of groups) {
      const targetId = g.id || g.jid || g;
      const resp = await EvolutionService.sendTextMessage({
        number: targetId,
        text: mensagem,
      }, customCfg);
      dispatches.push({ group: targetId, status: resp.success ? 'ENVIADO' : 'ERRO' });
    }

    await prisma.event.update({
      where: { id: event.id },
      data: { sentToWhatsapp: true },
    });

    res.json({
      success: true,
      message: `Evento disparado para ${dispatches.length} grupo(s)`,
      details: dispatches,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
