import axios from 'axios';
import prisma from '../prisma';

export interface SendMessageOptions {
  number: string; // Phone number with country code (ex: 5511999999999) or group JID (ex: 120363025287413665@g.us)
  text: string;
}

export class EvolutionService {
  private static getApiConfig(customConfig?: { url?: string; apiKey?: string; instance?: string }) {
    const url = (customConfig?.url || process.env.EVOLUTION_API_URL || 'https://api.cristhiansancore.com.br').replace(/\/$/, '');
    const apiKey = customConfig?.apiKey || process.env.EVOLUTION_API_KEY || 'EAC94E310E46-4D87-8AAD-4262C45AF665';
    const instance = customConfig?.instance || process.env.EVOLUTION_INSTANCE || 'teste';

    return { url, apiKey, instance };
  }

  /**
   * Verifica o status de conexão da instância do WhatsApp
   */
  static async getConnectionStatus(customConfig?: { url?: string; apiKey?: string; instance?: string }) {
    const { url, apiKey, instance } = this.getApiConfig(customConfig);
    try {
      const response = await axios.get(`${url}/instance/connectionState/${instance}`, {
        headers: { apikey: apiKey },
        timeout: 8000,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('[EvolutionAPI] Erro ao checar status:', error?.response?.data || error.message);
      return {
        success: false,
        error: error?.response?.data || error.message,
      };
    }
  }

  /**
   * Cria uma nova instância na Evolution API para uma cidade/igreja específica
   */
  static async createInstance(instanceName: string, customConfig?: { url?: string; apiKey?: string }) {
    const { url, apiKey } = this.getApiConfig(customConfig);
    try {
      const response = await axios.post(
        `${url}/instance/create`,
        {
          instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        },
        {
          headers: { apikey: apiKey, 'Content-Type': 'application/json' },
          timeout: 15000,
        }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('[EvolutionAPI] Erro ao criar instância:', error?.response?.data || error.message);
      return {
        success: false,
        error: error?.response?.data || error.message,
      };
    }
  }

  /**
   * Obtém QR Code ou código de pareamento para conectar o WhatsApp
   */
  static async connectInstance(instanceName: string, customConfig?: { url?: string; apiKey?: string }) {
    const { url, apiKey } = this.getApiConfig(customConfig);
    try {
      const response = await axios.get(`${url}/instance/connect/${instanceName}`, {
        headers: { apikey: apiKey },
        timeout: 10000,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('[EvolutionAPI] Erro ao conectar instância:', error?.response?.data || error.message);
      return {
        success: false,
        error: error?.response?.data || error.message,
      };
    }
  }

  /**
   * Busca todos os grupos do WhatsApp disponíveis na instância
   */
  static async fetchGroups(customConfig?: { url?: string; apiKey?: string; instance?: string }) {
    const { url, apiKey, instance } = this.getApiConfig(customConfig);
    try {
      const response = await axios.get(`${url}/group/fetchAllGroups/${instance}?getParticipants=false`, {
        headers: { apikey: apiKey },
        timeout: 10000,
      });
      return {
        success: true,
        groups: Array.isArray(response.data) ? response.data : [],
      };
    } catch (error: any) {
      console.error('[EvolutionAPI] Erro ao buscar grupos:', error?.response?.data || error.message);
      return {
        success: false,
        groups: [],
        error: error?.response?.data || error.message,
      };
    }
  }

  /**
   * Envia uma mensagem de texto simples para um número ou grupo
   */
  static async sendTextMessage(options: SendMessageOptions, customConfig?: { url?: string; apiKey?: string; instance?: string }) {
    const { url, apiKey, instance } = this.getApiConfig(customConfig);

    // Formata o número: remove caracteres não numéricos se não for JID de grupo
    let target = options.number.trim();
    if (!target.includes('@')) {
      target = target.replace(/\D/g, '');
      if (!target.startsWith('55') && target.length <= 11) {
        target = `55${target}`;
      }
    }

    try {
      const response = await axios.post(
        `${url}/message/sendText/${instance}`,
        {
          number: target,
          text: options.text,
        },
        {
          headers: {
            apikey: apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log(`[EvolutionAPI] Mensagem enviada com sucesso para ${target}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error(`[EvolutionAPI] Erro ao enviar mensagem para ${target}:`, error?.response?.data || error.message);
      return {
        success: false,
        error: error?.response?.data || error.message,
      };
    }
  }

  /**
   * Dispara as mensagens de aniversariantes do dia (Nascimento e Batismo)
   */
  static async processDailyBirthdays(churchId?: string) {
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentDay = String(today.getDate()).padStart(2, '0');
    const todayMMDD = `-${currentMonth}-${currentDay}`;

    console.log(`[Automação] Verificando aniversariantes do dia (MM-DD: ${todayMMDD})...`);

    // Busca todas as igrejas ou a igreja especificada
    const churches = await prisma.church.findMany({
      where: churchId ? { id: churchId } : {},
      include: {
        automations: true,
        members: {
          where: { status: 'ATIVO' },
        },
      },
    });

    const report: Array<{ church: string; member: string; type: string; phone: string; status: string }> = [];

    for (const church of churches) {
      const config = church.automations;
      if (!config) continue;

      const customCfg = {
        url: config.evolutionUrl,
        apiKey: config.evolutionApiKey,
        instance: config.instanceName,
      };

      for (const member of church.members) {
        if (!member.phone) continue;

        // 1. Checa Aniversário de Nascimento
        if (config.notifyBirthdays && member.birthDate && member.birthDate.endsWith(todayMMDD)) {
          let text = config.birthdayTemplate
            .replace(/{nome}/g, member.name)
            .replace(/{igreja}/g, church.name);

          const result = await this.sendTextMessage({ number: member.phone, text }, customCfg);
          report.push({
            church: church.name,
            member: member.name,
            type: 'ANIVERSARIO_NASCIMENTO',
            phone: member.phone,
            status: result.success ? 'ENVIADO' : 'ERRO',
          });
        }

        // 2. Checa Aniversário de Batismo
        if (config.notifyBaptisms && member.baptismDate && member.baptismDate.endsWith(todayMMDD)) {
          const baptismYear = parseInt(member.baptismDate.split('-')[0], 10);
          const years = isNaN(baptismYear) ? 1 : Math.max(1, today.getFullYear() - baptismYear);

          let text = config.baptismTemplate
            .replace(/{nome}/g, member.name)
            .replace(/{igreja}/g, church.name)
            .replace(/{anos}/g, String(years));

          const result = await this.sendTextMessage({ number: member.phone, text }, customCfg);
          report.push({
            church: church.name,
            member: member.name,
            type: 'ANIVERSARIO_BATISMO',
            phone: member.phone,
            status: result.success ? 'ENVIADO' : 'ERRO',
          });
        }
      }
    }

    return report;
  }

  /**
   * Dispara a programação da semana/mês para os grupos cadastrados
   */
  static async sendScheduleToGroups(churchId: string, groupJids?: string[]) {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      include: {
        automations: true,
        events: {
          where: { isPublic: true },
          orderBy: { startDate: 'asc' },
          take: 10,
        },
      },
    });

    if (!church || !church.automations) {
      throw new Error('Configuração de automação ou igreja não encontrada.');
    }

    const config = church.automations;
    let targetGroups = groupJids;

    if (!targetGroups || targetGroups.length === 0) {
      try {
        const parsed = JSON.parse(config.whatsappGroups || '[]');
        targetGroups = parsed.map((g: any) => g.id || g.jid || g);
      } catch {
        targetGroups = [];
      }
    }

    if (!targetGroups || targetGroups.length === 0) {
      return { success: false, message: 'Nenhum grupo de WhatsApp configurado para envio.' };
    }

    // Formata o resumo dos eventos
    const eventosTexto = church.events.length > 0
      ? church.events.map(e => `🗓️ *${e.title}*\n⏰ ${e.startDate}${e.startTime ? ` às ${e.startTime}` : ''}\n📍 ${e.location || church.address || 'Templo Sede'}\n`).join('\n')
      : 'Nenhum evento extraordinário para esta semana. Nossos cultos regulares continuam nos horários de costume!';

    const mensagem = config.scheduleTemplate
      .replace(/{igreja}/g, church.name)
      .replace(/{eventos}/g, eventosTexto)
      .replace(/{endereco}/g, church.address || 'Consulte nosso site oficial');

    const customCfg = {
      url: config.evolutionUrl,
      apiKey: config.evolutionApiKey,
      instance: config.instanceName,
    };

    const results: Array<{ group: string; status: string }> = [];

    for (const groupJid of targetGroups) {
      const res = await this.sendTextMessage({ number: groupJid, text: mensagem }, customCfg);
      results.push({ group: groupJid, status: res.success ? 'ENVIADO' : 'ERRO' });
    }

    return { success: true, count: results.length, details: results };
  }

  /**
   * Busca todas as congregações com configuração de automação
   */
  static async fetchChurchesWithAutomation() {
    return await prisma.church.findMany({
      include: {
        automations: true,
      },
    });
  }
}

