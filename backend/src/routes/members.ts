import { Router } from 'express';
import prisma from '../prisma';
import { EvolutionService } from '../services/evolution';

const router = Router();

// Listar membros com filtros
router.get('/', async (req, res) => {
  try {
    const { churchId, cellId, role, status, q } = req.query;

    const where: any = {};
    if (churchId) where.churchId = String(churchId);
    if (cellId) where.cellId = String(cellId);
    if (role) where.role = String(role);
    if (status) where.status = String(status);
    if (q) {
      where.OR = [
        { name: { contains: String(q) } },
        { phone: { contains: String(q) } },
        { email: { contains: String(q) } },
      ];
    }

    const members = await prisma.member.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        church: { select: { id: true, name: true } },
        cell: { select: { id: true, name: true } },
      },
    });

    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Aniversariantes de HOJE (Nascimento e Batismo)
router.get('/birthdays/today', async (req, res) => {
  try {
    const { churchId } = req.query;
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const suffix = `-${mm}-${dd}`;

    const where: any = { status: 'ATIVO' };
    if (churchId) where.churchId = String(churchId);

    const allMembers = await prisma.member.findMany({
      where,
      include: { church: { select: { name: true } } },
    });

    const birthToday = allMembers.filter(m => m.birthDate && m.birthDate.endsWith(suffix));
    const baptismToday = allMembers.filter(m => m.baptismDate && m.baptismDate.endsWith(suffix));

    res.json({
      date: `${dd}/${mm}`,
      birthdays: birthToday,
      baptisms: baptismToday,
      total: birthToday.length + baptismToday.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Aniversariantes do MÊS
router.get('/birthdays/month', async (req, res) => {
  try {
    const { churchId, month } = req.query;
    const targetMonth = month ? String(month).padStart(2, '0') : String(new Date().getMonth() + 1).padStart(2, '0');
    const infix = `-${targetMonth}-`;

    const where: any = { status: 'ATIVO' };
    if (churchId) where.churchId = String(churchId);

    const allMembers = await prisma.member.findMany({
      where,
      include: { church: { select: { name: true } } },
    });

    const birthdays = allMembers.filter(m => m.birthDate && m.birthDate.includes(infix));
    const baptisms = allMembers.filter(m => m.baptismDate && m.baptismDate.includes(infix));

    res.json({
      month: targetMonth,
      birthdays,
      baptisms,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Obter detalhes de um membro
router.get('/:id', async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: {
        church: true,
        cell: true,
        transactions: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });
    if (!member) return res.status(404).json({ error: 'Membro não encontrado' });
    res.json(member);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Criar membro
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const member = await prisma.member.create({
      data: {
        churchId: data.churchId,
        cellId: data.cellId || null,
        name: data.name,
        phone: data.phone,
        email: data.email,
        birthDate: data.birthDate,
        baptismDate: data.baptismDate,
        role: data.role || 'MEMBRO',
        maritalStatus: data.maritalStatus || 'SOLTEIRO',
        address: data.address,
        status: data.status || 'ATIVO',
        notes: data.notes,
      },
    });
    res.status(201).json(member);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar membro
router.put('/:id', async (req, res) => {
  try {
    const updated = await prisma.member.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Excluir membro
router.delete('/:id', async (req, res) => {
  try {
    await prisma.member.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Membro removido com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Enviar mensagem de WhatsApp manual com 1 clique para o membro
router.post('/:id/send-whatsapp', async (req, res) => {
  try {
    const { text, type } = req.body; // type: 'CUSTOM' | 'BIRTHDAY' | 'BAPTISM'
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: {
        church: { include: { automations: true } },
      },
    });

    if (!member) return res.status(404).json({ error: 'Membro não encontrado' });
    if (!member.phone) return res.status(400).json({ error: 'Membro não possui WhatsApp cadastrado' });

    const config = member.church.automations;
    let messageText = text;

    if (!messageText && config) {
      if (type === 'BAPTISM') {
        const baptismYear = member.baptismDate ? parseInt(member.baptismDate.split('-')[0], 10) : new Date().getFullYear();
        const years = Math.max(1, new Date().getFullYear() - baptismYear);
        messageText = config.baptismTemplate
          .replace(/{nome}/g, member.name)
          .replace(/{igreja}/g, member.church.name)
          .replace(/{anos}/g, String(years));
      } else {
        // default BIRTHDAY
        messageText = config.birthdayTemplate
          .replace(/{nome}/g, member.name)
          .replace(/{igreja}/g, member.church.name);
      }
    }

    if (!messageText) {
      return res.status(400).json({ error: 'Texto da mensagem não informado.' });
    }

    const customCfg = config ? {
      url: config.evolutionUrl,
      apiKey: config.evolutionApiKey,
      instance: config.instanceName,
    } : undefined;

    const result = await EvolutionService.sendTextMessage({
      number: member.phone,
      text: messageText,
    }, customCfg);

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
