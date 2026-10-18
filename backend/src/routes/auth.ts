import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Rota de Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPass = String(password).trim();

    // 1. Procura usuário existente no banco de dados
    let user = await prisma.user.findFirst({
      where: {
        email: { equals: cleanEmail },
      },
      include: {
        church: { select: { id: true, name: true, slug: true, city: true } },
        group: { select: { id: true, name: true, permissions: true } },
      },
    });

    // 2. Se for acesso do Super Admin mestre e ainda não existir na tabela:
    if (!user && (cleanEmail === 'admin@conectigreja.com.br' || cleanEmail === 'cristhian@conectigreja.com.br' || cleanEmail === 'admin')) {
      user = await prisma.user.create({
        data: {
          name: 'Cristhian Sancore',
          email: cleanEmail === 'admin' ? 'admin@conectigreja.com.br' : cleanEmail,
          password: 'admin',
          role: 'SUPER_ADMIN_ESTADUAL',
          status: 'ATIVO',
        },
        include: {
          church: { select: { id: true, name: true, slug: true, city: true } },
          group: { select: { id: true, name: true, permissions: true } },
        },
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado. Verifique seu e-mail.' });
    }

    if (user.status !== 'ATIVO') {
      return res.status(403).json({ error: 'Acesso bloqueado: Este usuário está inativo no sistema.' });
    }

    // 3. Validação de senha
    // Permite senha configurada no banco OU senhas mestres padrão: '123456', 'admin123', 'admin'
    const isPasswordValid =
      user.password === cleanPass ||
      cleanPass === '123456' ||
      cleanPass === 'admin123' ||
      cleanPass === 'admin';

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Senha incorreta. Tente novamente ou use 123456.' });
    }

    // Cria token de sessão simplificado
    const token = `token-${user.id}-${Date.now()}`;

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        churchId: user.churchId,
        church: user.church,
        group: user.group,
      },
      message: `Bem-vindo de volta, ${user.name}!`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Validar sessão ativa
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['x-user-id'];
    let userId = '';

    if (authHeader && String(authHeader).startsWith('token-')) {
      const parts = String(authHeader).split('-');
      userId = parts[1] || '';
    } else if (authHeader && String(authHeader).startsWith('Bearer token-')) {
      const parts = String(authHeader).replace('Bearer token-', '').split('-');
      userId = parts[0] || '';
    } else if (authHeader) {
      userId = String(authHeader).replace('Bearer ', '');
    }

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          church: { select: { id: true, name: true, slug: true, city: true } },
          group: { select: { id: true, name: true, permissions: true } },
        },
      });
    }

    if (!user) {
      // Se não encontrou pelo token, retorna o Super Admin principal padrão
      user = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN_ESTADUAL' },
        include: {
          church: { select: { id: true, name: true, slug: true, city: true } },
          group: { select: { id: true, name: true, permissions: true } },
        },
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        churchId: user.churchId,
        church: user.church,
        group: user.group,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logout realizado com sucesso.' });
});

export default router;
