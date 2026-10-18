import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados ConectIgreja...');

  // Limpa registros anteriores para evitar duplicatas em re-execução
  await prisma.prayerRequest.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.cellReport.deleteMany();
  await prisma.event.deleteMany();
  await prisma.member.deleteMany();
  await prisma.cell.deleteMany();
  await prisma.user.deleteMany();
  await prisma.userGroup.deleteMany();
  await prisma.automationConfig.deleteMany();
  await prisma.church.deleteMany();

  // 1. Igreja Matriz / Sede
  const sede = await prisma.church.create({
    data: {
      name: 'Igreja Conectada - Sede Central',
      slug: 'sede-central',
      isMain: true,
      pastorName: 'Pastor Samuel Oliveira',
      phone: '5511988887777',
      email: 'contato@conectigreja.cristhiansancore.com.br',
      address: 'Av. das Nações, 1500',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      pixKey: 'contato@conectigreja.cristhiansancore.com.br',
      pixType: 'EMAIL',
      pixRecipient: 'Igreja Conectada Sede',
      youtubeChannelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
      youtubeLiveUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      instagramHandle: '@conectigreja.oficial',
      facebookUrl: 'https://facebook.com/conectigrejaoficial',
      welcomeMessage: 'Seja bem-vindo à nossa casa! Somos uma igreja apaixonada por Jesus e comprometida em amar e acolher pessoas.',
    },
  });

  // 2. Igreja Filial
  const filial = await prisma.church.create({
    data: {
      name: 'Igreja Conectada - Filial Esperança',
      slug: 'filial-esperanca',
      isMain: false,
      pastorName: 'Pastor Marcos Vinicius',
      phone: '5511977776666',
      email: 'esperanca@conectigreja.cristhiansancore.com.br',
      address: 'Rua das Palmeiras, 340',
      neighborhood: 'Jardim das Flores',
      city: 'Campinas',
      state: 'SP',
      pixKey: 'filial@conectigreja.cristhiansancore.com.br',
      pixType: 'EMAIL',
      pixRecipient: 'Igreja Conectada Filial Esperança',
      youtubeChannelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
      instagramHandle: '@conectigreja.esperanca',
      facebookUrl: 'https://facebook.com/conectigrejaesperanca',
      welcomeMessage: 'Uma família para pertencer no coração do Jardim das Flores.',
    },
  });

  // 3. Configurações da Evolution API para a Sede (WhatsApp de São Paulo)
  await prisma.automationConfig.create({
    data: {
      churchId: sede.id,
      evolutionUrl: 'https://api.cristhiansancore.com.br',
      evolutionApiKey: 'EAC94E310E46-4D87-8AAD-4262C45AF665',
      instanceName: 'teste',
      instancePhone: '5511988887777',
      instanceStatus: 'open',
      whatsappGroups: JSON.stringify([
        { id: '120363025287413665@g.us', name: '📢 Comunidade Geral SP' },
        { id: '120363025287413999@g.us', name: '🔥 ConectJovem SP' },
      ]),
      notifyBirthdays: true,
      notifyBaptisms: true,
      notifySchedules: true,
    },
  });

  // 3.1. Configurações da Evolution API para a Filial (WhatsApp Exclusivo de Campinas)
  await prisma.automationConfig.create({
    data: {
      churchId: filial.id,
      evolutionUrl: 'https://api.cristhiansancore.com.br',
      evolutionApiKey: 'EAC94E310E46-4D87-8AAD-4262C45AF665',
      instanceName: 'campinas-filial',
      instancePhone: '5519977776666',
      instanceStatus: 'close',
      whatsappGroups: JSON.stringify([
        { id: '120363025287413111@g.us', name: '📢 Comunidade Campinas' },
      ]),
      notifyBirthdays: true,
      notifyBaptisms: true,
      notifySchedules: true,
    },
  });

  // 3.2. Grupos de Usuários & Níveis de Acesso
  const grupoEstadual = await prisma.userGroup.create({
    data: {
      name: 'Administrador Estadual / Bispo',
      description: 'Acesso total irrestrito a todas as congregações do estado, relatórios consolidados e instâncias da Evolution API.',
      permissions: JSON.stringify(['ALL']),
    },
  });

  const grupoPastorCidade = await prisma.userGroup.create({
    data: {
      name: 'Pastor Titular da Cidade / Filial',
      description: 'Gestão da igreja local de sua cidade, finanças, membros, células e WhatsApp exclusivo local.',
      permissions: JSON.stringify(['MANAGE_LOCAL_CHURCH', 'MEMBERS', 'FINANCES', 'CELLS', 'EVENTS', 'LOCAL_WHATSAPP']),
    },
  });

  const grupoSecretaria = await prisma.userGroup.create({
    data: {
      name: 'Secretaria Eclesiástica',
      description: 'Cadastro de membros, certidões de batismo, controle de aniversariantes e pedidos de oração.',
      permissions: JSON.stringify(['MEMBERS', 'CELLS', 'PRAYER_REQUESTS']),
    },
  });

  const grupoTesouraria = await prisma.userGroup.create({
    data: {
      name: 'Tesouraria & Finanças',
      description: 'Lançamentos de dízimos, ofertas, despesas e emissão de balanços mensais.',
      permissions: JSON.stringify(['FINANCES']),
    },
  });

  // 3.3. Usuários Iniciais
  await prisma.user.createMany({
    data: [
      {
        groupId: grupoEstadual.id,
        churchId: null, // Acesso Estadual a todas as igrejas!
        name: 'Pastor Samuel Oliveira (Estadual)',
        email: 'pastor.estadual@conectigreja.cristhiansancore.com.br',
        password: 'admin',
        phone: '5511988887777',
        role: 'SUPER_ADMIN_ESTADUAL',
        status: 'ATIVO',
      },
      {
        groupId: grupoPastorCidade.id,
        churchId: filial.id, // Acesso exclusivo à filial de Campinas!
        name: 'Pastor Marcos Vinicius (Campinas)',
        email: 'marcos.campinas@conectigreja.cristhiansancore.com.br',
        password: 'admin',
        phone: '5519977776666',
        role: 'PASTOR_CIDADE',
        status: 'ATIVO',
      },
      {
        groupId: grupoSecretaria.id,
        churchId: sede.id, // Secretaria da Sede SP
        name: 'Ana Beatriz Souza',
        email: 'secretaria.sp@conectigreja.cristhiansancore.com.br',
        password: 'admin',
        phone: '5511999994444',
        role: 'SECRETARIO',
        status: 'ATIVO',
      },
    ],
  });

  // 4. Células / Grupos Pequenos
  const celulaAlpha = await prisma.cell.create({
    data: {
      churchId: sede.id,
      name: 'Célula Nova Vida',
      leaderName: 'Lucas Ferreira',
      leaderPhone: '5511999991111',
      hostName: 'Carlos e Mariana',
      weekday: 'TERCA',
      time: '20:00',
      neighborhood: 'Bela Vista',
      address: 'Rua Treze de Maio, 420 - Apto 52',
      targetAudience: 'FAMILIAS',
      isActive: true,
    },
  });

  const celulaBeta = await prisma.cell.create({
    data: {
      churchId: sede.id,
      name: 'Célula Aviva Jovens',
      leaderName: 'Matheus Rocha',
      leaderPhone: '5511999992222',
      hostName: 'Pedro Santos',
      weekday: 'QUINTA',
      time: '20:15',
      neighborhood: 'Vila Mariana',
      address: 'Rua Domingos de Morais, 880',
      targetAudience: 'JOVENS',
      isActive: true,
    },
  });

  const celulaGama = await prisma.cell.create({
    data: {
      churchId: filial.id,
      name: 'Célula Esperança Viva',
      leaderName: 'Priscila Mendes',
      leaderPhone: '5511999993333',
      hostName: 'Ana Beatriz',
      weekday: 'QUARTA',
      time: '19:45',
      neighborhood: 'Jardim Primavera',
      address: 'Av. Brasil, 75',
      targetAudience: 'MULHERES',
      isActive: true,
    },
  });

  // Data de hoje para gerar aniversariantes reais hoje
  const now = new Date();
  const todayMM = String(now.getMonth() + 1).padStart(2, '0');
  const todayDD = String(now.getDate()).padStart(2, '0');

  // 5. Membros
  const m1 = await prisma.member.create({
    data: {
      churchId: sede.id,
      cellId: celulaAlpha.id,
      name: 'Gabriel Costa (Aniversariante Hoje!)',
      phone: '5511991234567',
      email: 'gabriel.costa@email.com',
      birthDate: `1995-${todayMM}-${todayDD}`, // Aniversário de nascimento HOJE!
      baptismDate: '2018-05-12',
      role: 'LIDER_CELULA',
      maritalStatus: 'CASADO',
      address: 'Rua Augusta, 1200',
      status: 'ATIVO',
    },
  });

  const m2 = await prisma.member.create({
    data: {
      churchId: sede.id,
      cellId: celulaBeta.id,
      name: 'Débora Silveira (Batismo Hoje!)',
      phone: '5511997654321',
      email: 'debora.silveira@email.com',
      birthDate: '1998-11-20',
      baptismDate: `2021-${todayMM}-${todayDD}`, // Aniversário de batismo HOJE!
      role: 'MUSICO',
      maritalStatus: 'SOLTEIRO',
      address: 'Rua Vergueiro, 300',
      status: 'ATIVO',
    },
  });

  const m3 = await prisma.member.create({
    data: {
      churchId: sede.id,
      cellId: celulaAlpha.id,
      name: 'Antônio Carlos de Souza',
      phone: '5511981112222',
      email: 'antonio.souza@email.com',
      birthDate: '1978-03-15',
      baptismDate: '2005-09-10',
      role: 'DIACONO',
      maritalStatus: 'CASADO',
      address: 'Rua Pamplona, 500',
      status: 'ATIVO',
    },
  });

  const m4 = await prisma.member.create({
    data: {
      churchId: filial.id,
      cellId: celulaGama.id,
      name: 'Mariana Duarte Lima',
      phone: '5511983334444',
      email: 'mariana.duarte@email.com',
      birthDate: '1992-07-28',
      baptismDate: '2016-12-18',
      role: 'MEMBRO',
      maritalStatus: 'SOLTEIRO',
      address: 'Av. Paulista, 2000',
      status: 'ATIVO',
    },
  });

  // 6. Lançamentos Financeiros (Fluxo de Caixa)
  const currentYearMonth = `${now.getFullYear()}-${todayMM}`;

  await prisma.transaction.createMany({
    data: [
      {
        churchId: sede.id,
        memberId: m1.id,
        type: 'RECEITA',
        category: 'DIZIMO',
        amount: 850.0,
        date: `${currentYearMonth}-05`,
        description: 'Dízimo mensal - Gabriel Costa',
        paymentMethod: 'PIX',
      },
      {
        churchId: sede.id,
        memberId: m3.id,
        type: 'RECEITA',
        category: 'DIZIMO',
        amount: 1200.0,
        date: `${currentYearMonth}-08`,
        description: 'Dízimo mensal - Antônio Carlos',
        paymentMethod: 'TRANSFERENCIA',
      },
      {
        churchId: sede.id,
        type: 'RECEITA',
        category: 'OFERTA',
        amount: 3420.5,
        date: `${currentYearMonth}-10`,
        description: 'Ofertas dos Cultos de Domingo',
        paymentMethod: 'DINHEIRO',
      },
      {
        churchId: sede.id,
        type: 'RECEITA',
        category: 'CAMPANHA',
        amount: 2500.0,
        date: `${currentYearMonth}-12`,
        description: 'Campanha de Reforma do Templo Infantil',
        paymentMethod: 'PIX',
      },
      {
        churchId: sede.id,
        type: 'DESPESA',
        category: 'ALUGUEL',
        amount: 2800.0,
        date: `${currentYearMonth}-05`,
        description: 'Aluguel do Templo Sede',
        paymentMethod: 'BOLETO',
      },
      {
        churchId: sede.id,
        type: 'DESPESA',
        category: 'ENERGIA',
        amount: 620.0,
        date: `${currentYearMonth}-07`,
        description: 'Conta de Energia Elétrica',
        paymentMethod: 'BOLETO',
      },
      {
        churchId: sede.id,
        type: 'DESPESA',
        category: 'MANUTENCAO',
        amount: 450.0,
        date: `${currentYearMonth}-14`,
        description: 'Manutenção da mesa de som e microfones',
        paymentMethod: 'PIX',
      },
      // Filial
      {
        churchId: filial.id,
        type: 'RECEITA',
        category: 'OFERTA',
        amount: 1650.0,
        date: `${currentYearMonth}-11`,
        description: 'Ofertas de Domingo - Filial Esperança',
        paymentMethod: 'PIX',
      },
      {
        churchId: filial.id,
        type: 'DESPESA',
        category: 'ENERGIA',
        amount: 290.0,
        date: `${currentYearMonth}-08`,
        description: 'Conta de Luz Filial',
        paymentMethod: 'BOLETO',
      },
    ],
  });

  // 7. Cultos e Eventos da Agenda
  await prisma.event.createMany({
    data: [
      {
        churchId: sede.id,
        title: 'Culto da Família & Adoração',
        description: 'Um tempo precioso de louvor, ministração da Palavra e oração por todas as famílias da igreja.',
        startDate: `${currentYearMonth}-19`,
        startTime: '19:00',
        location: 'Templo Sede - Auditório Principal',
        category: 'CULTO',
        isRecurring: true,
        recurringDay: 'DOMINGO',
        isPublic: true,
      },
      {
        churchId: sede.id,
        title: 'Quarta Profética & Clamor',
        description: 'Estudo aprofundado das Escrituras e oração intercessória pelas causas impossíveis.',
        startDate: `${currentYearMonth}-22`,
        startTime: '19:30',
        location: 'Templo Sede',
        category: 'CULTO',
        isRecurring: true,
        recurringDay: 'QUARTA',
        isPublic: true,
      },
      {
        churchId: sede.id,
        title: 'Conferência Aviva Jovem 2026',
        description: 'Três dias de avivamento espiritual, workshops, preletores convidados e muito louvor com a juventude.',
        startDate: `${currentYearMonth}-25`,
        startTime: '19:30',
        endDate: `${currentYearMonth}-27`,
        endTime: '22:00',
        location: 'Templo Sede',
        category: 'CONFERENCIA',
        isRecurring: false,
        isPublic: true,
      },
      {
        churchId: filial.id,
        title: 'Culto de Celebração - Filial Esperança',
        description: 'Culto de domingo com Ceia do Senhor na congregação do Jardim das Flores.',
        startDate: `${currentYearMonth}-19`,
        startTime: '18:30',
        location: 'Rua das Palmeiras, 340',
        category: 'CULTO',
        isRecurring: true,
        recurringDay: 'DOMINGO',
        isPublic: true,
      },
    ],
  });

  // 8. Pedidos de Oração
  await prisma.prayerRequest.createMany({
    data: [
      {
        churchId: sede.id,
        name: 'Maria Helena dos Santos',
        phone: '5511999887766',
        email: 'maria.helena@email.com',
        message: 'Peço oração pela restauração da saúde da minha mãe que fará uma cirurgia na próxima semana.',
        status: 'EM_ORACAO',
      },
      {
        churchId: sede.id,
        name: 'Lucas Nogueira',
        phone: '5511988776655',
        message: 'Oração por portas abertas de emprego na área de tecnologia e direcionamento profissional.',
        status: 'PENDENTE',
      },
    ],
  });

  console.log('✅ Banco de dados populado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
