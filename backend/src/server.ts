import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import churchesRoutes from './routes/churches';
import membersRoutes from './routes/members';
import financesRoutes from './routes/finances';
import cellsRoutes from './routes/cells';
import eventsRoutes from './routes/events';
import prayerRoutes from './routes/prayer';
import automationRoutes from './routes/automation';
import publicRoutes from './routes/public';
import usersRoutes from './routes/users';
import rostersRoutes from './routes/rosters';
import registrationsRoutes from './routes/registrations';
import path from 'path';
import certificatesRoutes from './routes/certificates';
import broadcastRoutes from './routes/broadcast';
import reportsRoutes from './routes/reports';
import uploadRoutes from './routes/upload';
import { SchedulerService } from './services/scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Servir arquivos de uploads estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Log de requisições simples
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ConectIgreja API',
    timestamp: new Date().toISOString(),
    evolutionApiUrl: process.env.EVOLUTION_API_URL,
    evolutionInstance: process.env.EVOLUTION_INSTANCE,
  });
});

// Registro de Rotas
app.use('/api/churches', churchesRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/finances', financesRoutes);
app.use('/api/cells', cellsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/prayer-requests', prayerRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/rosters', rostersRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/upload', uploadRoutes);

// Aliases REST de conveniência
app.use('/api/user-groups', (req, res, next) => {
  req.url = '/groups' + (req.url === '/' ? '' : req.url);
  usersRoutes(req, res, next);
});
app.use('/api/ministries', (req, res, next) => {
  req.url = '/ministries' + (req.url === '/' ? '' : req.url);
  rostersRoutes(req, res, next);
});

// Inicia o servidor e o agendador de tarefas
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🕊️  ConectIgreja API rodando com sucesso na porta ${PORT}`);
  console.log(`🔗 URL Base: http://localhost:${PORT}`);
  console.log(`🔗 Domínio Oficial: ${process.env.PUBLIC_URL || 'https://ConectIgreja.cristhiansancore.com.br'}`);
  console.log(`===================================================`);

  // Inicializa o agendador cron diário
  SchedulerService.init();
});

export default app;
