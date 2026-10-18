import { Router } from 'express';
import prisma from '../prisma';
import { EvolutionService } from '../services/evolution';

const router = Router();

// Listar inscrições de um evento ou congregação
router.get('/', async (req, res) => {
  try {
    const { eventId, churchId } = req.query;
    const where: any = {};
    if (eventId) where.eventId = String(eventId);
    if (churchId) where.churchId = String(churchId);

    const registrations = await prisma.eventRegistration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        event: { select: { id: true, title: true, startDate: true, startTime: true, location: true } },
        church: { select: { id: true, name: true, city: true } },
      },
    });

    res.json(registrations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Realizar inscrição em evento (Portal Público ou Admin)
router.post('/', async (req, res) => {
  try {
    const { eventId, name, phone, email, notes } = req.body;
    if (!eventId || !name || !phone) {
      return res.status(400).json({ error: 'eventId, name e phone são obrigatórios' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        church: true,
        _count: { select: { registrations: true } },
      },
    });

    if (!event) return res.status(404).json({ error: 'Evento não encontrado' });

    // Checa limite de vagas se configurado
    if (event.maxAttendees && event.maxAttendees > 0 && event._count.registrations >= event.maxAttendees) {
      return res.status(400).json({ error: 'Desculpe, as vagas para este evento foram esgotadas!' });
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        churchId: event.churchId,
        name,
        phone,
        email,
        notes,
      },
    });

    // Envio de confirmação automática no WhatsApp do inscrito
    try {
      const config = await prisma.automationConfig.findUnique({
        where: { churchId: event.churchId },
      });

      const customCfg = config ? {
        url: config.evolutionUrl,
        apiKey: config.evolutionApiKey,
        instance: config.instanceName,
      } : undefined;

      const formattedDate = event.startDate.split('-').reverse().join('/');
      const confirmMsg = `Graça e Paz, ${name}! 🎉✨\n\nSua inscrição para o evento *${event.title}* na igreja *${event.church.name}* foi confirmada com sucesso!\n\n📅 *Data:* ${formattedDate} ${event.startTime ? `às ${event.startTime}` : ''}\n📍 *Local:* ${event.location || event.church.address || 'Templo da Igreja'}\n\nEstamos ansiosos para receber você e sua família. Qualquer dúvida, responda a esta mensagem. Deus te abençoe! 🙏🕊️`;

      await EvolutionService.sendTextMessage({
        number: phone,
        text: confirmMsg,
      }, customCfg);
    } catch (msgErr) {
      console.warn('Erro ao disparar confirmação de inscrição no WhatsApp:', msgErr);
    }

    res.status(201).json({
      success: true,
      message: 'Inscrição realizada com sucesso!',
      registration,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar status da inscrição
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await prisma.eventRegistration.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Cancelar/excluir inscrição
router.delete('/:id', async (req, res) => {
  try {
    await prisma.eventRegistration.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Inscrição removida com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
