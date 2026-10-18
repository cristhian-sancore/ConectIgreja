import { Router } from 'express';
import prisma from '../prisma';
import { EvolutionService } from '../services/evolution';

const router = Router();

// ==========================================
// MINISTÉRIOS
// ==========================================

// Listar ministérios da congregação
router.get('/ministries', async (req, res) => {
  try {
    const { churchId } = req.query;
    const where: any = {};
    if (churchId) where.churchId = String(churchId);

    const ministries = await prisma.ministry.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { rosters: true } },
      },
    });

    res.json(ministries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cadastrar ministério
router.post('/ministries', async (req, res) => {
  try {
    const { churchId, name, description, leaderName, leaderPhone, color } = req.body;
    if (!churchId || !name) {
      return res.status(400).json({ error: 'churchId e name são obrigatórios' });
    }

    const ministry = await prisma.ministry.create({
      data: {
        churchId,
        name,
        description,
        leaderName,
        leaderPhone,
        color: color || '#6366f1',
      },
    });

    res.status(201).json(ministry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ESCALAS DE CULTO / VOLUNTÁRIOS
// ==========================================

// Listar escalas
router.get('/', async (req, res) => {
  try {
    const { churchId, ministryId, startDate } = req.query;
    const where: any = {};
    if (churchId) where.churchId = String(churchId);
    if (ministryId) where.ministryId = String(ministryId);
    if (startDate) where.date = { gte: String(startDate) };

    const rosters = await prisma.roster.findMany({
      where,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      include: {
        church: { select: { id: true, name: true, city: true } },
        ministry: { select: { id: true, name: true, color: true } },
        assignments: {
          include: {
            member: { select: { id: true, name: true, phone: true, role: true } },
          },
          orderBy: { roleInRoster: 'asc' },
        },
      },
    });

    res.json(rosters);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Criar escala
router.post('/', async (req, res) => {
  try {
    const { churchId, ministryId, title, date, time, notes, assignments } = req.body;
    if (!churchId || !ministryId || !title || !date) {
      return res.status(400).json({ error: 'churchId, ministryId, title e date são obrigatórios' });
    }

    const roster = await prisma.roster.create({
      data: {
        churchId,
        ministryId,
        title,
        date,
        time,
        notes,
      },
    });

    // Se fornecidas atribuições iniciais de voluntários
    if (Array.isArray(assignments) && assignments.length > 0) {
      for (const a of assignments) {
        if (a.memberId && a.roleInRoster) {
          await prisma.rosterAssignment.create({
            data: {
              rosterId: roster.id,
              memberId: a.memberId,
              roleInRoster: a.roleInRoster,
              notes: a.notes,
            },
          });
        }
      }
    }

    const fullRoster = await prisma.roster.findUnique({
      where: { id: roster.id },
      include: {
        ministry: true,
        assignments: { include: { member: true } },
      },
    });

    res.status(201).json(fullRoster);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Adicionar voluntário à escala
router.post('/:id/assignments', async (req, res) => {
  try {
    const { memberId, roleInRoster, notes } = req.body;
    if (!memberId || !roleInRoster) {
      return res.status(400).json({ error: 'memberId e roleInRoster são obrigatórios' });
    }

    const assignment = await prisma.rosterAssignment.create({
      data: {
        rosterId: req.params.id,
        memberId,
        roleInRoster,
        notes,
      },
      include: { member: true },
    });

    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Remover voluntário da escala
router.delete('/assignments/:assignmentId', async (req, res) => {
  try {
    await prisma.rosterAssignment.delete({
      where: { id: req.params.assignmentId },
    });
    res.json({ success: true, message: 'Voluntário removido da escala' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Excluir escala
router.delete('/:id', async (req, res) => {
  try {
    await prisma.roster.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Escala removida com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Disparar notificação da escala no WhatsApp para todos os voluntários escalados
router.post('/:id/notify-whatsapp', async (req, res) => {
  try {
    const roster = await prisma.roster.findUnique({
      where: { id: req.params.id },
      include: {
        church: true,
        ministry: true,
        assignments: { include: { member: true } },
      },
    });

    if (!roster) return res.status(404).json({ error: 'Escala não encontrada' });

    // Busca config de automação da igreja
    const config = await prisma.automationConfig.findUnique({
      where: { churchId: roster.churchId },
    });

    const customCfg = config ? {
      url: config.evolutionUrl,
      apiKey: config.evolutionApiKey,
      instance: config.instanceName,
    } : undefined;

    const dispatches = [];

    for (const a of roster.assignments) {
      if (!a.member.phone) continue;

      const formattedDate = roster.date.split('-').reverse().join('/');
      const text = `Graça e Paz, ${a.member.name}! 🕊️\n\nVocê está escalado(a) para servir no ministério *${roster.ministry.name}*!\n\n📋 *Escala:* ${roster.title}\n📅 *Data:* ${formattedDate} ${roster.time ? `às ${roster.time}` : ''}\n🎸 *Sua Função:* *${a.roleInRoster}*\n📍 *Igreja:* ${roster.church.name}\n\nContamos com sua dedicação para edificarmos o Corpo de Cristo juntos! Que Deus te abençoe abundantemente. 🙏✨`;

      try {
        const sendResult = await EvolutionService.sendTextMessage({
          number: a.member.phone,
          text,
        }, customCfg);

        dispatches.push({
          memberName: a.member.name,
          phone: a.member.phone,
          role: a.roleInRoster,
          result: sendResult,
        });
      } catch (err: any) {
        dispatches.push({
          memberName: a.member.name,
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      message: `${dispatches.length} voluntários notificados via WhatsApp`,
      dispatches,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
