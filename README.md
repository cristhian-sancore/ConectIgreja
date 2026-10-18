# ConectIgreja | Plataforma Eclesiástica & Portal Público

Sistema integrado para gestão de congregações (Sede e Filiais), membros, fluxo de caixa, células, agendamento de cultos com disparo em grupos do WhatsApp via **Evolution API**, robô de mensagens para aniversariantes de nascimento e batismo, além de um portal público moderno com cultos ao vivo do YouTube e feed de fotos das programações.

---

## 🕊️ Funcionalidades Principais

### 1. Painel Administrativo (`frontend-admin`)
- **Gestão Multi-Igreja**: Visualize a visão consolidada de todas as congregações ou filtre individualmente pela congregação Sede ou Filial.
- **Membros & Liderança**:
  - Cadastro completo de membros, cargos ministeriais, células e congregações.
  - Registro de **Data de Nascimento** e **Data de Batismo nas Águas**.
  - Botão de envio rápido no WhatsApp de mensagem de parabéns com 1 clique.
- **Fluxo de Caixa (Financeiro)**:
  - Lançamento de dízimos associados ao membro ou avulsos.
  - Ofertas de culto, ofertas missionárias, campanhas e inscrições de eventos.
  - Controle de despesas (aluguel, água, energia, som, preletores, etc.).
  - Gráficos comparativos de receitas vs despesas e saldo líquido acumulado.
- **Células / Grupos Pequenos**:
  - Cadastro de células com líderes, anfitriões, dias, horários e endereços.
  - Lançamento de relatório semanal (membros presentes, visitantes, decisões por Cristo e oferta da célula).
  - Alimentação automática do localizador público do site.
- **Agenda & Cultos**:
  - Calendário e programações presenciais e online.
  - Botão **"Divulgar no WhatsApp"**: dispara o comunicado formatado diretamente para os grupos cadastrados na Evolution API.
- **Central de Automação (Evolution API)**:
  - Status em tempo real da conexão do WhatsApp (instância `teste`).
  - Modelos de mensagens editáveis com tags dinâmicas (`{nome}`, `{igreja}`, `{anos}`, `{eventos}`, `{endereco}`).
  - Robô automático diário às 08:00 para envio de felicitações de aniversário de nascimento e aniversário de batismo.
  - Ferramenta de teste de disparo imediato para qualquer número.
- **Ministério de Intercessão (Pedidos de Oração)**:
  - Lista de pedidos enviados por visitantes e membros pelo site público.
  - Controle de status ("Pendente", "Em Intercessão", "Atendido") com link direto para acolher a pessoa no WhatsApp.

---

### 2. Portal Público Oficial (`frontend-public`)
- **Design Moderno e Acolhedor**: Paleta rica em tons azul-marinho e dourado com glassmorphism e tipografia Google Fonts (Inter e Outfit).
- **Culto Ao Vivo (YouTube Live Stream)**:
  - Detector automático de Live com player de vídeo e badge animado `🔴 AO VIVO AGORA`.
  - Exibição da gravação do último culto quando não estiver ao vivo.
  - Grade das últimas pregações e vídeos do canal oficial.
- **Programação Semanal & Cultos**:
  - Horários de cultos regulares e eventos especiais.
  - Botão de compartilhamento e convite com mensagem pré-formatada para o WhatsApp.
- **Localizador de Células nos Lares**:
  - Busca por bairro com filtro instantâneo por público-alvo (Famílias, Jovens, Mulheres).
  - Botão "Quero Visitar esta Célula": abre conversa direta com o líder no WhatsApp.
- **Mural de Fotos & Redes Sociais**:
  - Feed integrado de fotos dos cultos, batismos e eventos (Instagram e Facebook).
- **Pedidos de Oração**:
  - Formulário para visitantes deixarem seus pedidos de oração (com opção de confidencialidade).
- **Dízimos & Ofertas Online**:
  - Chave PIX oficial com botão "Copiar Chave", QR Code e contas bancárias da igreja.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ instalado.

### 1. Backend API (Porta 4000)
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed # Popula dados de demonstração
npm run dev
```

### 2. Portal Público da Igreja (Porta 3000)
```bash
cd frontend-public
npm install
npm run dev
```
Acesse em: `http://localhost:3000`

### 3. Painel Administrativo (Porta 5173)
```bash
cd frontend-admin
npm install
npm run dev
```
Acesse em: `http://localhost:5173`

---

## 🐳 Implantação no Portainer (Docker Compose)

O projeto inclui um `docker-compose.yml` otimizado para produção:

1. Acesse seu painel do **Portainer** (`https://PORTAINER.CRISTHIANSANCORE.COM.BR`).
2. Vá em **Stacks** -> **Add stack**.
3. Escolha **Repository** ou cole o conteúdo do `docker-compose.yml`.
4. Defina as variáveis de ambiente:
   - `EVOLUTION_API_URL=https://api.cristhiansancore.com.br`
   - `EVOLUTION_API_KEY=EAC94E310E46-4D87-8AAD-4262C45AF665`
   - `EVOLUTION_INSTANCE=teste`
   - `PUBLIC_URL=https://ConectIgreja.cristhiansancore.com.br`
5. Clique em **Deploy the stack**.

---

## ☁️ Configuração Cloudflare (DNS & SSL)

No painel da Cloudflare do domínio `cristhiansancore.com.br`:
1. Crie uma entrada DNS tipo `A` ou `CNAME`:
   - Nome: `conectigreja`
   - Destino: IP do servidor onde o Portainer está rodando.
   - Proxy status: **Proxied (Nuvem Laranja)**.
2. Em **SSL/TLS**, certifique-se de que o modo está em **Full** ou **Full (Strict)**.
