import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Listar todas as células
router.get('/', async (req, res) => {
  try {
    const { churchId, neighborhood, isActive } = req.query;

    const where: any = {};
    if (churchId) where.churchId = String(churchId);
    if (neighborhood) where.neighborhood = { contains: String(neighborhood) };
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const cells = await prisma.cell.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        church: { select: { name: true } },
        _count: { select: { members: true, reports: true } },
      },
    });

    res.json(cells);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Detalhes da célula
router.get('/:id', async (req, res) => {
  try {
    const cell = await prisma.cell.findUnique({
      where: { id: req.params.id },
      include: {
        church: true,
        members: { select: { id: true, name: true, phone: true, role: true } },
        reports: {
          orderBy: { meetingDate: 'desc' },
          take: 10,
        },
      },
    });
    if (!cell) return res.status(404).json({ error: 'Célula não encontrada' });
    res.json(cell);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Criar célula
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const cell = await prisma.cell.create({
      data: {
        churchId: data.churchId,
        name: data.name,
        leaderName: data.leaderName,
        leaderPhone: data.leaderPhone,
        hostName: data.hostName,
        weekday: data.weekday || 'TERCA',
        time: data.time || '20:00',
        neighborhood: data.neighborhood,
        address: data.address,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        targetAudience: data.targetAudience || 'GERAL',
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    res.status(201).json(cell);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar célula
router.put('/:id', async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.cell.update({
      where: { id: req.params.id },
      data: {
        ...data,
        latitude: data.latitude !== undefined ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude !== undefined ? parseFloat(data.longitude) : undefined,
      },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Excluir célula
router.delete('/:id', async (req, res) => {
  try {
    await prisma.cell.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Célula excluída com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Registrar relatório semanal da reunião da célula
router.post('/:id/reports', async (req, res) => {
  try {
    const data = req.body;
    const report = await prisma.cellReport.create({
      data: {
        cellId: req.params.id,
        meetingDate: data.meetingDate || new Date().toISOString().split('T')[0],
        membersCount: parseInt(data.membersCount || '0', 10),
        visitorsCount: parseInt(data.visitorsCount || '0', 10),
        decisionsCount: parseInt(data.decisionsCount || '0', 10),
        offeringAmount: parseFloat(data.offeringAmount || '0'),
        notes: data.notes,
      },
    });
    res.status(201).json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
