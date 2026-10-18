import { Router } from 'express';
import prisma from '../prisma';
import { EvolutionService } from '../services/evolution';

const router = Router();

// Listar certificados
router.get('/', async (req, res) => {
  try {
    const { churchId, type } = req.query;
    const where: any = {};
    if (churchId) where.churchId = String(churchId);
    if (type) where.type = String(type);

    const certificates = await prisma.certificate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        church: { select: { id: true, name: true, city: true, pastorName: true } },
      },
    });

    res.json(certificates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Emitir novo certificado
router.post('/', async (req, res) => {
  try {
    const { churchId, memberId, type, title, recipientName, date, pastorName, verse, notes } = req.body;
    if (!churchId || !type || !recipientName || !date || !pastorName) {
      return res.status(400).json({ error: 'churchId, type, recipientName, date e pastorName são obrigatórios' });
    }

    const defaultVerses: Record<string, string> = {
      BATISMO: '"Fomos, pois, sepultados com ele na morte pelo batismo; para que, como Cristo ressuscitou dentre os mortos, pela glória do Pai, assim andemos nós também em novidade de vida." (Romanos 6:4)',
      APRESENTACAO_BEBE: '"Ensina a criança no caminho em que deve andar, e até quando envelhecer não se desviará dele." (Provérbios 22:6)',
      MEMBRESIA: '"Assim nós, que somos muitos, somos um só corpo em Cristo, mas individualmente membros uns dos outros." (Romanos 12:5)',
      CONSAGRACAO_OBREIRO: '"Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade." (2 Timóteo 2:15)',
    };

    const cert = await prisma.certificate.create({
      data: {
        churchId,
        memberId,
        type,
        title: title || (type === 'BATISMO' ? 'Certificado de Batismo nas Águas' : type === 'APRESENTACAO_BEBE' ? 'Certificado de Apresentação ao Senhor' : 'Certificado de Membresia'),
        recipientName,
        date,
        pastorName,
        verse: verse || defaultVerses[type] || '',
        notes,
      },
      include: { church: true },
    });

    res.status(201).json(cert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Enviar certificado via WhatsApp para o membro/responsável
router.post('/:id/send-whatsapp', async (req, res) => {
  try {
    const { phone } = req.body;
    const cert = await prisma.certificate.findUnique({
      where: { id: req.params.id },
      include: { church: true },
    });

    if (!cert) return res.status(404).json({ error: 'Certificado não encontrado' });
    if (!phone) return res.status(400).json({ error: 'Telefone para envio é obrigatório' });

    const config = await prisma.automationConfig.findUnique({
      where: { churchId: cert.churchId },
    });

    const customCfg = config ? {
      url: config.evolutionUrl,
      apiKey: config.evolutionApiKey,
      instance: config.instanceName,
    } : undefined;

    const formattedDate = cert.date.split('-').reverse().join('/');
    const msg = `📜 *${cert.title.toUpperCase()}* 🕊️\n\nA igreja *${cert.church.name}* tem a honra de certificar que:\n\n⭐ *${cert.recipientName}*\n\nCelebrou este ato sagrado em *${formattedDate}*, sob a bênção pastoral do *Pastor ${cert.pastorName}*.\n\n📖 _${cert.verse}_\n\nParabéns! Guarde este marco com carinho no seu coração. Que Deus te abençoe ricamente! 🙏✨`;

    const result = await EvolutionService.sendTextMessage({
      number: phone,
      text: msg,
    }, customCfg);

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir certificado
router.delete('/:id', async (req, res) => {
  try {
    await prisma.certificate.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Certificado removido com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
