import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// ==========================================
// USUÁRIOS
// ==========================================

// Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const { churchId, role, status } = req.query;

    const where: any = {};
    if (churchId) where.churchId = String(churchId);
    if (role) where.role = String(role);
    if (status) where.status = String(status);

    const users = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        church: { select: { id: true, name: true, city: true } },
        group: { select: { id: true, name: true, permissions: true } },
      },
    });

    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Criar novo usuário
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, role, groupId, churchId, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e E-mail são obrigatórios.' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: password || '123456',
        phone,
        role: role || 'PASTOR_CIDADE',
        groupId: groupId || null,
        churchId: churchId || null, // null = Acesso Estadual (todas as cidades)
        status: status || 'ATIVO',
      },
      include: {
        church: { select: { name: true } },
        group: { select: { name: true } },
      },
    });

    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar dados de um usuário
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password, phone, role, groupId, churchId, status } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name,
        email,
        phone,
        role,
        groupId: groupId || null,
        churchId: churchId === '' ? null : churchId,
        status,
        ...(password ? { password } : {}),
      },
      include: {
        church: { select: { name: true } },
        group: { select: { name: true } },
      },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Excluir usuário
router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Usuário excluído com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// GRUPOS DE USUÁRIOS & PERMISSÕES
// ==========================================

// Listar todos os grupos de usuários (suporta /groups e /groups/list)
const listGroupsHandler = async (req: any, res: any) => {
  try {
    const groups = await prisma.userGroup.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { users: true } },
      },
    });
    res.json(groups);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

router.get('/groups', listGroupsHandler);
router.get('/groups/list', listGroupsHandler);

// Criar novo grupo de usuário
router.post('/groups', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome do grupo é obrigatório.' });
    }

    const group = await prisma.userGroup.create({
      data: {
        name,
        description,
        permissions: typeof permissions === 'string' ? permissions : JSON.stringify(permissions || []),
      },
    });

    res.status(201).json(group);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar grupo
router.put('/groups/:id', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const group = await prisma.userGroup.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        permissions: typeof permissions === 'string' ? permissions : JSON.stringify(permissions || []),
      },
    });

    res.json(group);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Excluir grupo
router.delete('/groups/:id', async (req, res) => {
  try {
    await prisma.userGroup.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Grupo excluído com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
