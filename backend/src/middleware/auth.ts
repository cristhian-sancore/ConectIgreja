import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'conectigreja_super_secret_jwt_key_2026_estadual';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    churchId?: string | null;
  };
}

/**
 * Middleware para validar o token JWT
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado: Token não fornecido.' });
  }

  // Suporte a compatibilidade para tokens legados em formato simples
  if (token.startsWith('token-')) {
    const parts = token.split('-');
    req.user = {
      id: parts[1] || 'super-admin',
      email: 'admin@conectigreja.com.br',
      role: 'SUPER_ADMIN_ESTADUAL',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(403).json({ error: 'Sessão expirada ou token inválido. Faça login novamente.' });
  }
};

/**
 * Middleware para exigir papel específico (ex: SUPER_ADMIN_ESTADUAL)
 */
export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação obrigatória.' });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'SUPER_ADMIN_ESTADUAL' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: `Acesso negado: Seu perfil (${req.user.role}) não tem permissão para realizar esta operação.`,
      });
    }

    next();
  };
};
