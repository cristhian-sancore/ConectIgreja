import { Router } from 'express';
import prisma from '../prisma';
import { EvolutionService } from '../services/evolution';

const router = Router();

// Disparar comunicado em massa segmentado
router.post('/send', async (req, res) => {
  try {
    const { churchId, targetRole, text } = req.body;
    if (!churchId || !text) {
      return res.status(400).json({ error: 'churchId e text são obrigatórios' });
    }

    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });
    if (!church) return res.status(404).json({ error: 'Igreja não encontrada' });

    // Filtra membros por congregação e cargo
    const where: any = { churchId, status: 'ATIVO' };
    if (targetRole && targetRole !== 'TODOS') {
      where.role = targetRole;
    }

    const members = await prisma.member.findMany({
      where,
      select: { id: true, name: true, phone: true, role: true },
    });

    if (members.length === 0) {
      return res.status(400).json({ error: 'Nenhum membro ativo encontrado com o critério selecionado.' });
    }

    const config = await prisma.automationConfig.findUnique({
      where: { churchId },
    });

    const customCfg = config ? {
      url: config.evolutionUrl,
      apiKey: config.evolutionApiKey,
      instance: config.instanceName,
    } : undefined;

    const dispatches = [];

    for (const m of members) {
      if (!m.phone) continue;

      const customizedText = text
        .replace(/\{nome\}/g, m.name)
        .replace(/\{igreja\}/g, church.name);

      try {
        const result = await EvolutionService.sendTextMessage({
          number: m.phone,
          text: customizedText,
        }, customCfg);

        dispatches.push({
          memberName: m.name,
          phone: m.phone,
          role: m.role,
          status: 'ENVIADO',
          result,
        });
      } catch (err: any) {
        dispatches.push({
          memberName: m.name,
          phone: m.phone,
          status: 'ERRO',
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      totalTargets: members.length,
      sentCount: dispatches.filter(d => d.status === 'ENVIADO').length,
      dispatches,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
