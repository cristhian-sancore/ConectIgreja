import cron from 'node-cron';
import { EvolutionService } from './evolution';

export class SchedulerService {
  private static cronJob: cron.ScheduledTask | null = null;

  /**
   * Inicializa os agendamentos automáticos
   */
  static init() {
    // 1. Roda todos os dias às 08:00 da manhã para ANIVERSARIANTES (Nascimento e Batismo)
    this.cronJob = cron.schedule('0 8 * * *', async () => {
      console.log('⏰ [Scheduler] Iniciando disparo automático de Aniversários de Nascimento e Batismo...');
      try {
        const results = await EvolutionService.processDailyBirthdays();
        console.log(`✅ [Scheduler] Disparos de aniversários concluídos. ${results.length} mensagens processadas.`, results);
      } catch (err: any) {
        console.error('❌ [Scheduler] Erro no disparo de aniversários:', err.message);
      }
    });

    // 2. Roda todo Domingo às 08:30 da manhã para publicar a PROGRAMAÇÃO DA SEMANA nos Grupos do WhatsApp
    cron.schedule('30 8 * * 0', async () => {
      console.log('⏰ [Scheduler] Disparando programação semanal automática nos grupos do WhatsApp...');
      try {
        await this.processWeeklySchedules();
      } catch (err: any) {
        console.error('❌ [Scheduler] Erro no disparo da programação semanal:', err.message);
      }
    });

    // 3. Roda toda Quarta-feira às 09:00 da manhã para lembrar o Culto de Quarta nos grupos
    cron.schedule('0 9 * * 3', async () => {
      console.log('⏰ [Scheduler] Disparando lembrete do Culto de Quarta nos grupos do WhatsApp...');
      try {
        await this.processWeeklySchedules();
      } catch (err: any) {
        console.error('❌ [Scheduler] Erro no disparo da agenda de quarta:', err.message);
      }
    });

    console.log('🚀 [Scheduler] Agendadores ativados:');
    console.log('   - Aniversários (Nascimento e Batismo): Diariamente às 08:00');
    console.log('   - Agenda nos Grupos: Domingos às 08:30 e Quartas às 09:00');
  }

  /**
   * Envia a programação para os grupos de todas as congregações ativas
   */
  static async processWeeklySchedules() {
    const churches = await EvolutionService.fetchChurchesWithAutomation();
    for (const c of churches) {
      if (c.automations?.notifySchedules) {
        await EvolutionService.sendScheduleToGroups(c.id);
      }
    }
  }

  /**
   * Força a execução manual imediata (útil para testes ou botão no painel admin)
   */
  static async triggerManualDailyRun(churchId?: string) {
    console.log('⚡ [Scheduler] Execução manual acionada pelo Painel Admin...');
    return await EvolutionService.processDailyBirthdays(churchId);
  }
}
