import { Router } from 'express';
import prisma from '../prisma';
import { EvolutionService } from '../services/evolution';

const router = Router();

// Verificar status de conexão da Evolution API
router.get('/status', async (req, res) => {
  try {
    const { url, apiKey, instance } = req.query;
    const customCfg = (url || apiKey || instance) ? {
      url: url ? String(url) : undefined,
      apiKey: apiKey ? String(apiKey) : undefined,
      instance: instance ? String(instance) : undefined,
    } : undefined;

    const result = await EvolutionService.getConnectionStatus(customCfg);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Criar nova instância exclusiva para uma congregação/cidade
router.post('/instances/create', async (req, res) => {
  try {
    const { churchId, instanceName } = req.body;
    if (!churchId || !instanceName) {
      return res.status(400).json({ error: 'churchId e instanceName são obrigatórios' });
    }

    const config = await prisma.automationConfig.findUnique({ where: { churchId } });
    const customCfg = config ? {
      url: config.evolutionUrl,
      apiKey: config.evolutionApiKey,
    } : undefined;

    const result = await EvolutionService.createInstance(instanceName, customCfg);

    // Salva o nome da instância vinculada a esta igreja
    await prisma.automationConfig.update({
      where: { churchId },
      data: {
        instanceName,
        instanceStatus: 'connecting',
      },
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obter QR Code ou código para conectar o WhatsApp da congregação
router.get('/instances/connect/:churchId', async (req, res) => {
  try {
    const config = await prisma.automationConfig.findUnique({
      where: { churchId: req.params.churchId },
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuração da igreja não encontrada' });
    }

    const customCfg = {
      url: config.evolutionUrl,
      apiKey: config.evolutionApiKey,
    };

    const result = await EvolutionService.connectInstance(config.instanceName, customCfg);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Listar grupos do WhatsApp na instância
router.get('/groups', async (req, res) => {
  try {
    const { url, apiKey, instance } = req.query;
    const customCfg = (url || apiKey || instance) ? {
      url: url ? String(url) : undefined,
      apiKey: apiKey ? String(apiKey) : undefined,
      instance: instance ? String(instance) : undefined,
    } : undefined;

    const result = await EvolutionService.fetchGroups(customCfg);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Buscar configurações de automação da congregação
router.get('/config/:churchId', async (req, res) => {
  try {
    let config = await prisma.automationConfig.findUnique({
      where: { churchId: req.params.churchId },
    });

    if (!config) {
      config = await prisma.automationConfig.create({
        data: { churchId: req.params.churchId },
      });
    }

    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar configurações da Evolution API para a congregação
router.put('/config/:churchId', async (req, res) => {
  try {
    const data = req.body;
    const config = await prisma.automationConfig.upsert({
      where: { churchId: req.params.churchId },
      update: {
        evolutionUrl: data.evolutionUrl,
        evolutionApiKey: data.evolutionApiKey,
        instanceName: data.instanceName,
        instancePhone: data.instancePhone,
        instanceStatus: data.instanceStatus,
        whatsappGroups: typeof data.whatsappGroups === 'string' ? data.whatsappGroups : JSON.stringify(data.whatsappGroups || []),
        notifyBirthdays: data.notifyBirthdays,
        notifyBaptisms: data.notifyBaptisms,
        notifySchedules: data.notifySchedules,
        birthdayTemplate: data.birthdayTemplate,
        baptismTemplate: data.baptismTemplate,
        scheduleTemplate: data.scheduleTemplate,
      },
      create: {
        churchId: req.params.churchId,
        evolutionUrl: data.evolutionUrl || 'https://api.cristhiansancore.com.br',
        evolutionApiKey: data.evolutionApiKey || 'EAC94E310E46-4D87-8AAD-4262C45AF665',
        instanceName: data.instanceName || 'teste',
        instancePhone: data.instancePhone,
        instanceStatus: data.instanceStatus || 'close',
        whatsappGroups: typeof data.whatsappGroups === 'string' ? data.whatsappGroups : JSON.stringify(data.whatsappGroups || []),
        notifyBirthdays: data.notifyBirthdays ?? true,
        notifyBaptisms: data.notifyBaptisms ?? true,
        notifySchedules: data.notifySchedules ?? true,
        birthdayTemplate: data.birthdayTemplate,
        baptismTemplate: data.baptismTemplate,
        scheduleTemplate: data.scheduleTemplate,
      },
    });

    res.json(config);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Enviar mensagem de teste para um número qualquer
router.post('/test-message', async (req, res) => {
  try {
    const { number, text, churchId } = req.body;
    if (!number || !text) {
      return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });
    }

    let customCfg = undefined;
    if (churchId) {
      const config = await prisma.automationConfig.findUnique({ where: { churchId } });
      if (config) {
        customCfg = {
          url: config.evolutionUrl,
          apiKey: config.evolutionApiKey,
          instance: config.instanceName,
        };
      }
    }

    const result = await EvolutionService.sendTextMessage({ number, text }, customCfg);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Executar verificação e envio de aniversariantes manualmente agora
router.post('/trigger-daily', async (req, res) => {
  try {
    const { churchId } = req.body;
    const results = await EvolutionService.processDailyBirthdays(churchId);
    res.json({
      success: true,
      count: results.length,
      dispatches: results,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Disparar a programação geral para os grupos do WhatsApp agora
router.post('/broadcast-schedule', async (req, res) => {
  try {
    const { churchId, groupJids } = req.body;
    if (!churchId) return res.status(400).json({ error: 'churchId é obrigatório' });

    const result = await EvolutionService.sendScheduleToGroups(churchId, groupJids);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
