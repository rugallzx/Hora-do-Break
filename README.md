# ScreenBalance - Controle Gamificado de Tempo de Tela

Um aplicativo completo para combater o vício em telas através de gamificação, com recursos avançados de integração de dispositivos, notificações push e sincronização na nuvem.

## 🚀 Funcionalidades Principais

### 🎮 Sistema de Gamificação
- **Avatar Reativo**: Personagem que muda de humor baseado no uso da tela
- **Sistema de Moedas**: Ganhe moedas completando missões e fazendo pausas
- **Níveis e XP**: Progresso baseado em hábitos saudáveis
- **Loja de Personalização**: Use moedas para customizar seu avatar

### 📱 Integração com Dispositivos
- **iOS Screen Time**: Integração nativa com dados de tempo de tela
- **Android Digital Wellbeing**: Acesso aos dados de uso do dispositivo
- **Web APIs**: Estimativa de tempo para navegadores desktop
- **Sincronização Multi-dispositivo**: Dados consolidados de todos os aparelhos

### 🔔 Notificações Inteligentes
- **Lembretes de Pausa**: Notificações automáticas após períodos prolongados
- **Service Workers**: Funciona mesmo com o app fechado
- **Notificações Personalizadas**: Configure horários e frequência
- **Mensagens Motivacionais**: Feedback baseado no progresso

### ☁️ Sincronização na Nuvem
- **Autenticação Supabase**: Login seguro e gerenciamento de usuários
- **Backup Automático**: Dados salvos automaticamente na nuvem
- **Sincronização Multi-dispositivo**: Acesse seus dados em qualquer lugar
- **Merge Inteligente**: Resolução automática de conflitos entre dispositivos

## 🏆 Sistema de Missões

### Missões Diárias
- **Limite Diário**: Manter menos de 3h de tela por dia
- **Guerreiro das Pausas**: Fazer 5 pausas de 5 minutos
- **Madrugador Digital**: Evitar telas nas primeiras 2 horas

### Missões Semanais
- **Campeão Semanal**: Complete todas as missões diárias por 7 dias
- **Equilíbrio Mestre**: Menos de 2h de tela por 3 dias seguidos

### Conquistas
- **Colecionador de Moedas**: Acumule 500 moedas
- Desbloqueie novas conquistas baseadas no seu progresso

## 📊 Relatórios e Análises

### Dashboard Principal
- Tempo de tela do dia atual
- Status de energia do avatar
- Progresso das missões
- Tempo de sessão atual

### Relatórios Semanais
- Gráficos de tempo de tela por dia
- Análise de tendências
- Insights personalizados
- Metas para próxima semana

## 🛠️ Configurações Avançadas

### Notificações
- Intervalos de pausa personalizáveis (15-120 min)
- Horários específicos para lembretes
- Mensagens de encorajamento
- Relatórios semanais automáticos

### Integração de Dispositivos
- Detecção automática do tipo de dispositivo
- Conectividade com APIs nativas
- Fallback para estimativas web
- Sincronização em tempo real

## 🔐 Privacidade e Segurança

- **Dados Locais**: Funciona completamente offline
- **Criptografia**: Dados sincronizados são protegidos
- **Controle do Usuário**: Você decide o que sincronizar
- **Backup Local**: Dados sempre disponíveis localmente

## 📱 Compatibilidade

### Dispositivos Suportados
- **iOS**: iPhone/iPad com Screen Time habilitado
- **Android**: Dispositivos com Digital Wellbeing
- **Web**: Todos os navegadores modernos
- **Desktop**: Estimativas através de Web APIs

### Navegadores
- Chrome/Chromium (recomendado)
- Safari (iOS)
- Firefox
- Edge

## 🚀 Como Usar

### Primeiros Passos
1. Abra o ScreenBalance no seu dispositivo
2. Configure suas preferências de notificação
3. Conecte com a API do seu dispositivo (opcional)
4. Crie uma conta para sincronização (opcional)

### Para Melhor Experiência
1. **iOS**: Ative o Screen Time nas Configurações
2. **Android**: Ative o Digital Wellbeing
3. **Notificações**: Permita notificações push
4. **Conta**: Crie uma conta para backup na nuvem

### Dicas de Uso
- Configure lembretes de pausa que funcionem para sua rotina
- Use o avatar como motivação visual
- Complete missões diárias para manter engajamento
- Monitore relatórios semanais para insights

## ⚙️ Arquitetura Técnica

### Frontend
- **React** com TypeScript
- **Tailwind CSS** para styling
- **Shadcn/UI** para componentes
- **Recharts** para gráficos

### Backend
- **Supabase** para autenticação e dados
- **Hono** web server em Deno
- **Edge Functions** para processamento
- **KV Store** para dados de usuário

### Integrações
- **Service Workers** para notificações
- **Web APIs** para tempo de tela
- **Platform APIs** para iOS/Android
- **Real-time sync** entre dispositivos

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Estrutura do Projeto
```
/components/           # Componentes React
  /ui/                # Componentes base (Shadcn)
  Avatar.tsx          # Avatar reativo
  Missions.tsx        # Sistema de missões
  AuthManager.tsx     # Autenticação
  NotificationManager.tsx # Notificações
  ScreenTimeIntegration.tsx # Integração APIs

/supabase/
  /functions/server/  # Backend Hono
    index.tsx         # Servidor principal
    kv_store.tsx      # Utilitários KV (protegido)

/utils/
  /supabase/
    info.tsx          # Configuração Supabase

App.tsx              # Componente principal
```

## 🌟 Roadmap Futuro

- [ ] Integração com Apple HealthKit
- [ ] Análise de padrões com IA
- [ ] Grupos familiares
- [ ] Metas colaborativas
- [ ] Exportação de dados
- [ ] Temas personalizados
- [ ] Widget para tela inicial
- [ ] Integração com assistentes de voz

## 🤝 Contribuindo

Este é um projeto de demonstração, mas feedbacks e sugestões são sempre bem-vindos!

## 📄 Licença

Projeto desenvolvido para fins educacionais e demonstração de tecnologias web modernas.
