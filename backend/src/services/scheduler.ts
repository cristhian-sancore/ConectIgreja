import cron from 'node-cron';
import { EvolutionService } from './evolution';

export class SchedulerService {
  private static cronJob: cron.ScheduledTask | null = null;

  /**
   * Inicializa os agendamentos automáticos
   */
  static init() {
    // Roda todos os dias às 08:00 da manhã (horário do servidor)
    this.cronJob = cron.schedule('0 8 * * *', async () => {
      console.log('⏰ [Scheduler] Iniciando disparo automático de Aniversários de Nascimento e Batismo...');
      try {
        const results = await EvolutionService.processDailyBirthdays();
        console.log(`✅ [Scheduler] Disparos concluídos. ${results.length} mensagens processadas.`, results);
      } catch (err: any) {
        console.error('❌ [Scheduler] Erro no disparo de aniversários:', err.message);
      }
    });

    console.log('🚀 [Scheduler] Agendador de tarefas ativado (Execução diária às 08:00)');
  }

  /**
   * Força a execução manual imediata (útil para testes ou botão no painel admin)
   */
  static async triggerManualDailyRun(churchId?: string) {
    console.log('⚡ [Scheduler] Execução manual acionada pelo Painel Admin...');
    return await EvolutionService.processDailyBirthdays(churchId);
  }
}
