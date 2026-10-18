import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Listar pedidos de oração (Painel de Intercessão)
router.get('/', async (req, res) => {
  try {
    const { churchId, status } = req.query;

    const where: any = {};
    if (churchId) where.churchId = String(churchId);
    if (status) where.status = String(status);

    const requests = await prisma.prayerRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        church: { select: { name: true } },
      },
    });

    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar status do pedido (ex: "EM_ORACAO", "ATENDIDO")
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await prisma.prayerRequest.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Excluir pedido
router.delete('/:id', async (req, res) => {
  try {
    await prisma.prayerRequest.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Pedido excluído' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
