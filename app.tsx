import React, { useState, useEffect } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { toast, Toaster } from 'sonner@2.0.3';
import { Avatar } from './components/Avatar';
import { Missions } from './components/Missions';
import { WeeklyReport } from './components/WeeklyReport';
import { AvatarCustomization } from './components/AvatarCustomization';
import { ScreenTimeIntegration } from './components/ScreenTimeIntegration';
import { NotificationManager } from './components/NotificationManager';
import { AuthManager } from './components/AuthManager';
import { StatusIndicator } from './components/StatusIndicator';
import { NotificationBanner } from './components/NotificationBanner';
import { QuickActions } from './components/QuickActions';
import { SecurityManager, createUserDataHash } from './components/SecurityManager';
import { WelcomeFlow } from './components/WelcomeFlow';
import { ThemeToggle } from './components/ThemeToggle';
import { AchievementsPanel } from './components/AchievementsPanel';
import { StreakDisplay } from './components/StreakDisplay';
import { AnimatedFeedback } from './components/AnimatedFeedback';
import { useTheme } from './hooks/useTheme';
import { useUserData } from './hooks/useUserData';
import { useSessionTimer } from './hooks/useSessionTimer';
import { useAchievements } from './hooks/useAchievements';
import { Clock, Coins, Trophy, Zap, Settings, Coffee } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export default function App() {
  // Verificar se o ambiente está pronto antes de inicializar
  if (typeof window === 'undefined') {
    return <div>Carregando...</div>;
  }

  // Hooks customizados
  const { theme } = useTheme();
  const { userData, updateUserData } = useUserData();
  const { currentSessionTime, showBreakDialog, setShowBreakDialog } = useSessionTimer(
    userData.sessionStartTime, 
    userData.lastBreakTime
  );
  const { completedAchievements } = useAchievements(userData);

  // Estados locais
  const [manualTime, setManualTime] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<any>({});
  const [isOnline, setIsOnline] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [showWelcomeFlow, setShowWelcomeFlow] = useState(false);
  
  // Estados para animações
  const [animationTrigger, setAnimationTrigger] = useState(false);
  const [animationType, setAnimationType] = useState<'break' | 'mission' | 'levelUp' | 'achievement'>('break');
  const [animationData, setAnimationData] = useState<any>({});

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        // Adicionar hash de integridade e timestamp de validação
        const dataWithIntegrity = {
          ...userData,
          integrityHash: createUserDataHash(userData),
          lastValidation: Date.now()
        };
        localStorage.setItem('screenTimeApp', JSON.stringify(dataWithIntegrity));
      }
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [userData]);

  // Verificar se precisa mostrar fluxo de boas-vindas
  useEffect(() => {
    const hasAcceptedTerms = localStorage.getItem('privacyTermsAccepted');
    const savedUser = localStorage.getItem('authUser');
    
    if (hasAcceptedTerms !== 'true') {
      setShowWelcomeFlow(true);
    } else if (savedUser) {
      // Usuário já logado
      try {
        const user = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const addManualTime = () => {
    try {
      const minutes = parseInt(manualTime);
      
      // Validações de segurança
      if (isNaN(minutes) || minutes <= 0) {
        toast.error('Por favor, insira um número válido de minutos');
        return;
      }
      
      if (minutes > 480) { // Máximo 8 horas por vez
        toast.error('Por favor, insira um valor menor que 480 minutos (8 horas)');
        return;
      }
      
      updateUserData(prev => {
        const newDailyScreenTime = Math.min(prev.dailyScreenTime + minutes, 1440); // Máximo 24h
        return {
          ...prev,
          dailyScreenTime: newDailyScreenTime
        };
      });
      setManualTime('');
      toast.success(`⏱️ ${minutes} minutos adicionados ao tempo de tela`, {
        description: 'Lembre-se de fazer pausas regulares para cuidar da sua saúde!'
      });
    } catch (error) {
      console.error('Error adding manual time:', error);
      toast.error('Erro ao adicionar tempo');
    }
  };

  const takeBreak = () => {
    try {
      // Validação: não permitir pausas muito frequentes (anti-spam)
      const timeSinceLastBreak = Date.now() - userData.lastBreakTime;
      if (timeSinceLastBreak < 5 * 60 * 1000) { // Mínimo 5 minutos entre pausas
        toast.error('⏰ Aguarde um pouco antes da próxima pausa!');
        return;
      }
      
      updateUserData(prev => {
        const newXP = Math.min(prev.xp + 15, 10000); // Limite de XP
        const newLevel = calculateLevel(newXP);
        const newCoins = Math.min(prev.coins + 10, 9999); // Limite de moedas
        
        return {
          ...prev,
          lastBreakTime: Date.now(),
          sessionStartTime: Date.now(),
          coins: newCoins,
          xp: newXP,
          level: Math.min(newLevel, 50) // Limite de nível
        };
      });
      setShowBreakDialog(false);
      toast.success('🎉 Pausa realizada! +10 moedas e +15 XP', {
        description: 'Seu avatar está mais feliz e energizado! Continue assim! 💪'
      });
    } catch (error) {
      console.error('Error taking break:', error);
      toast.error('Erro ao registrar pausa');
    }
  };

  const skipBreak = () => {
    try {
      updateUserData(prev => ({
        ...prev,
        lastBreakTime: Date.now() - 35 * 60 * 1000 // Reduz um pouco o tempo para próxima notificação
      }));
      setShowBreakDialog(false);
      toast.error('😔 Avatar perdeu energia por pular a pausa!', {
        description: 'Tente fazer a próxima pausa para manter seu avatar saudável.'
      });
    } catch (error) {
      console.error('Error skipping break:', error);
      toast.error('Erro ao processar ação');
    }
  };

  const calculateLevel = (xp: number) => {
    // Sistema de níveis progressivo: cada nível fica mais difícil
    let level = 1;
    let requiredXP = 100; // XP necessário para nível 2
    let totalXP = 0;
    
    while (totalXP + requiredXP <= xp) {
      totalXP += requiredXP;
      level++;
      // Aumenta a dificuldade em 25% a cada nível
      requiredXP = Math.floor(requiredXP * 1.25);
    }
    
    return level;
  };

  const getXPForNextLevel = (currentXP: number, currentLevel: number) => {
    let level = 1;
    let requiredXP = 100;
    let totalXP = 0;
    
    // Calcular XP total necessário para o nível atual
    while (level < currentLevel) {
      totalXP += requiredXP;
      level++;
      requiredXP = Math.floor(requiredXP * 1.25);
    }
    
    // XP necessário para próximo nível
    const xpForNext = totalXP + requiredXP;
    return Math.max(0, xpForNext - currentXP);
  };

  const getXPRequiredForLevel = (level: number) => {
    let totalXP = 0;
    let requiredXP = 100;
    for (let i = 1; i < level; i++) {
      totalXP += requiredXP;
      requiredXP = Math.floor(requiredXP * 1.25);
    }
    return totalXP;
  };

  const getCurrentLevelProgress = (currentXP: number, currentLevel: number) => {
    const baseXPForCurrentLevel = getXPRequiredForLevel(currentLevel);
    const xpInCurrentLevel = currentXP - baseXPForCurrentLevel;
    
    let requiredXPForNext = 100;
    for (let i = 1; i < currentLevel; i++) {
      requiredXPForNext = Math.floor(requiredXPForNext * 1.25);
    }
    
    return Math.min(100, (xpInCurrentLevel / requiredXPForNext) * 100);
  };

  const completeMission = (missionId: string, reward: number) => {
    try {
      // Validações de segurança
      if (typeof missionId !== 'string' || !missionId.trim()) {
        console.warn('Security: Invalid mission ID');
        return;
      }
      
      if (typeof reward !== 'number' || reward < 0 || reward > 100) {
        console.warn('Security: Invalid mission reward');
        return;
      }
      
      if (!userData.completedMissions.includes(missionId)) {
        updateUserData(prev => {
          const newXP = Math.min(prev.xp + reward, 10000); // Limite máximo de XP
          const newLevel = calculateLevel(newXP);
          const newCoins = Math.min(prev.coins + reward, 9999); // Limite máximo de moedas
          
          return {
            ...prev,
            coins: newCoins,
            xp: newXP,
            level: Math.min(newLevel, 50), // Limite máximo de nível
            completedMissions: [...prev.completedMissions, missionId]
          };
        });
        toast.success(`🏆 Missão concluída! +${reward} moedas e XP`, {
          description: `Parabéns! Continue completando missões para evoluir ainda mais! 🚀`
        });
      }
    } catch (error) {
      console.error('Error completing mission:', error);
      toast.error('Erro ao completar missão');
    }
  };

  const spendCoins = (amount: number) => {
    try {
      // Validações de segurança
      if (typeof amount !== 'number' || amount <= 0 || amount > 1000) {
        console.warn('Security: Invalid coin amount to spend');
        return false;
      }
      
      if (userData.coins >= amount && amount > 0) {
        updateUserData(prev => ({
          ...prev,
          coins: Math.max(0, prev.coins - amount) // Garante que não fique negativo
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error spending coins:', error);
      return false;
    }
  };

  const updateAvatar = (config: any) => {
    try {
      if (config && typeof config === 'object') {
        updateUserData(prev => ({
          ...prev,
          avatarConfig: { ...prev.avatarConfig, ...config }
        }));
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Erro ao atualizar avatar');
    }
  };

  const handleAuthStateChange = (authenticated: boolean, user: AuthUser | null) => {
    try {
      setIsAuthenticated(authenticated);
      setCurrentUser(user);
    } catch (error) {
      console.error('Error handling auth state change:', error);
    }
  };

  const handleUserDataUpdate = (newData: any) => {
    try {
      if (newData && typeof newData === 'object') {
        updateUserData(() => newData);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      toast.error('Erro ao atualizar dados do usuário');
    }
  };

  const handleScreenTimeUpdate = (screenTime: number) => {
    try {
      if (typeof screenTime === 'number' && screenTime >= 0) {
        updateUserData(prev => ({
          ...prev,
          dailyScreenTime: screenTime
        }));
      }
    } catch (error) {
      console.error('Error updating screen time:', error);
      toast.error('Erro ao atualizar tempo de tela');
    }
  };

  const handleNotificationSettings = (settings: any) => {
    try {
      if (settings && typeof settings === 'object') {
        setNotificationSettings(settings);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    try {
      setDismissedAlerts(prev => [...prev, alertId]);
      // Clear dismissed alerts after 1 hour
      setTimeout(() => {
        setDismissedAlerts(prev => prev.filter(id => id !== alertId));
      }, 60 * 60 * 1000);
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const handleSecurityViolation = () => {
    try {
      // Reset para dados seguros
      const safeData = {
        dailyScreenTime: 0,
        coins: 200,
        level: 1,
        xp: 0,
        avatarConfig: { body: 'happy', eyes: 'normal', accessory: 'none', hair: 'none' },
        lastBreakTime: Date.now(),
        sessionStartTime: Date.now(),
        weeklyData: [],
        completedMissions: [],
        streakData: {
          currentStreak: 0,
          longestStreak: 0,
          lastBreakDate: ''
        },
        achievements: []
      };
      updateUserData(() => safeData);
      
      // Limpar localStorage suspeito
      localStorage.removeItem('screenTimeApp');
      localStorage.removeItem('screenTimeApp_backup');
      
      toast.error('🚨 Dados corrompidos detectados! Aplicação foi reiniciada para sua segurança.');
      
      // Recarregar página após alguns segundos
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('Error handling security violation:', error);
      window.location.reload();
    }
  };

  const handleStartFocusMode = () => {
    try {
      toast.info('🎯 Modo foco ativado! Concentre-se na sua atividade.');
      // Could integrate with a pomodoro timer or focus session tracker
    } catch (error) {
      console.error('Error starting focus mode:', error);
    }
  };

  const handleSetGoal = () => {
    try {
      toast.info('🎯 Definir metas em desenvolvimento! Em breve você poderá personalizar seus objetivos.');
    } catch (error) {
      console.error('Error setting goal:', error);
    }
  };

  const handleWelcomeFlowComplete = (user: AuthUser | null) => {
    try {
      setShowWelcomeFlow(false);
      
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        
        // Verificar se há dados salvos ou dar bônus de boas-vindas
        const existingData = localStorage.getItem('screenTimeApp');
        if (!existingData) {
          // Atualizar dados do usuário com bônus de boas-vindas
          updateUserData(prev => ({
            ...prev,
            coins: 250, // Bônus de 50 moedas
            xp: 25 // Bônus de 25 XP
          }));
          
          toast.success(`🎉 Bem-vindo, ${user.name}!`, {
            description: 'Você ganhou 50 moedas e 25 XP de bônus para começar!'
          });
        } else {
          toast.success(`🎉 Bem-vindo de volta, ${user.name}!`);
        }
      } else {
        // Usuário escolheu continuar sem conta
        toast.info('💡 Você pode criar uma conta a qualquer momento na aba "Conta"', {
          description: 'Para sincronizar seus dados entre dispositivos'
        });
      }
    } catch (error) {
      console.error('Error handling welcome flow completion:', error);
      setShowWelcomeFlow(false);
    }
  };

  const dailyLimit = 180; // 3 horas em minutos
  const screenTimePercent = Math.min(Math.max((userData.dailyScreenTime / dailyLimit) * 100, 0), 100);
  const xpToNextLevel = getXPForNextLevel(userData.xp, userData.level);

  // Mostrar fluxo de boas-vindas se necessário
  if (showWelcomeFlow) {
    return <WelcomeFlow onComplete={handleWelcomeFlowComplete} />;
  }

  return (
    <SecurityManager 
      userData={userData} 
      onSecurityViolation={handleSecurityViolation}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-4 transition-colors duration-200"
           style={{ minHeight: '100dvh' }}>
        <div className="max-w-4xl mx-auto space-y-4">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full shadow-lg">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  Hora do Break
                </h1>
                {isAuthenticated && currentUser && (
                  <p className="text-sm text-green-700 font-medium">
                    Olá, {currentUser.name}! 👋
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-600 max-w-md mx-auto">
                ☕ Transforme suas pausas em momentos recompensadores e mantenha um equilíbrio saudável!
              </p>
              
              <StatusIndicator 
                isAuthenticated={isAuthenticated}
                userName={currentUser?.name}
                notificationEnabled={notificationSettings.breakReminders}
                isOnline={isOnline}
                lastSync={userData.lastSync}
              />
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="bg-white/60 backdrop-blur-sm rounded-full px-6 py-2 inline-flex items-center space-x-6 shadow-lg border">
            <div className="flex items-center space-x-1 text-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{Math.floor(userData.dailyScreenTime / 60)}h {userData.dailyScreenTime % 60}m</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center space-x-1 text-sm">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{userData.coins}</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center space-x-1 text-sm">
              <Trophy className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Nv. {userData.level}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid grid-cols-6 bg-white/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl p-2 gap-1 flex-1 max-w-4xl">
              <TabsTrigger 
                value="dashboard" 
                className="relative overflow-hidden rounded-xl px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all duration-300 hover:scale-105 font-medium text-sm"
              >
                <div className="relative z-10 flex items-center justify-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="missions"
                className="relative overflow-hidden rounded-xl px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 transition-all duration-300 hover:scale-105 font-medium text-sm"
              >
                <div className="relative z-10 flex items-center justify-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">Missões</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="achievements"
                className="relative overflow-hidden rounded-xl px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/25 transition-all duration-300 hover:scale-105 font-medium text-sm"
              >
                <div className="relative z-10 flex items-center justify-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">Conquistas</span>
                  {completedAchievements.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {completedAchievements.length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="avatar"
                className="relative overflow-hidden rounded-xl px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/25 transition-all duration-300 hover:scale-105 font-medium text-sm"
              >
                <div className="relative z-10 flex items-center justify-center space-x-1">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Avatar</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="reports"
                className="relative overflow-hidden rounded-xl px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/25 transition-all duration-300 hover:scale-105 font-medium text-sm"
              >
                <div className="relative z-10 flex items-center justify-center space-x-1">
                  <Coins className="h-4 w-4" />
                  <span className="hidden sm:inline">Relatórios</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="relative overflow-hidden rounded-xl px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-slate-500/25 transition-all duration-300 hover:scale-105 font-medium text-sm"
              >
                <div className="relative z-10 flex items-center justify-center space-x-1">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Config</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            {/* Theme Toggle */}
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>
          <TabsContent value="dashboard" className="space-y-6">
            {/* Smart Notifications */}
            <NotificationBanner 
              screenTimePercent={screenTimePercent}
              currentSessionTime={currentSessionTime}
              energy={Math.max(0, 100 - (currentSessionTime * 2))}
              dailyStreak={0} // This could be calculated from userData
              onDismiss={handleDismissAlert}
              dismissedAlerts={dismissedAlerts}
            />

            {/* Enhanced Status Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-blue-25">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium">TEMPO HOJE</p>
                      <p className="text-lg font-bold text-blue-800">
                        {Math.floor(userData.dailyScreenTime / 60)}h {userData.dailyScreenTime % 60}m
                      </p>
                    </div>
                  </div>
                  {screenTimePercent > 80 && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      Alto!
                    </Badge>
                  )}
                </div>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(screenTimePercent, 100)}%` }}
                  ></div>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-25">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Coins className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-yellow-600 font-medium">MOEDAS</p>
                      <p className="text-lg font-bold text-yellow-800">{userData.coins}</p>
                    </div>
                  </div>
                  {userData.coins >= 100 && (
                    <Badge className="bg-yellow-500 text-white text-xs">
                      Rico!
                    </Badge>
                  )}
                </div>
              </Card>

              <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50 to-purple-25">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Trophy className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-medium">NÍVEL</p>
                      <p className="text-lg font-bold text-purple-800">{userData.level}</p>
                    </div>
                  </div>
                  <div className="text-xs text-purple-600">
                    {xpToNextLevel} XP
                  </div>
                </div>
                <div className="mt-2 w-full bg-purple-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${getCurrentLevelProgress(userData.xp, userData.level)}%` }}
                  ></div>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-400 bg-gradient-to-r from-green-50 to-green-25">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Zap className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">SESSÃO ATUAL</p>
                      <p className="text-lg font-bold text-green-800">{currentSessionTime}m</p>
                    </div>
                  </div>
                  {currentSessionTime > 30 && (
                    <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">
                      Longo!
                    </Badge>
                  )}
                </div>
                <div className="mt-2 w-full bg-green-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((currentSessionTime / 40) * 100, 100)}%` }}
                  ></div>
                </div>
              </Card>
            </div>

            {/* Clean Avatar and Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Avatar Card */}
              <Card className="p-4 bg-white border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Seu Avatar</h3>
                  <Badge 
                    className={`${Math.max(0, 100 - (currentSessionTime * 2)) > 70 ? 'bg-green-600' : 
                              Math.max(0, 100 - (currentSessionTime * 2)) > 40 ? 'bg-yellow-600' : 'bg-red-600'} text-white text-xs`}
                  >
                    {Math.max(0, 100 - (currentSessionTime * 2))}%
                  </Badge>
                </div>
                <div className="flex justify-center">
                  <Avatar 
                    config={userData.avatarConfig} 
                    energy={Math.max(0, 100 - (currentSessionTime * 2))}
                    screenTime={userData.dailyScreenTime}
                  />
                </div>
              </Card>

              {/* Progress Card */}
              <Card className="lg:col-span-2 p-4 space-y-4 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Progresso do Dia</h3>
                  <Badge variant="outline" className="text-xs">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </Badge>
                </div>
                
                {/* Screen Time Progress */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-900">Tempo de Tela</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">
                        {Math.floor(userData.dailyScreenTime / 60)}h {userData.dailyScreenTime % 60}m
                      </span>
                      <span className="text-sm text-gray-500 ml-1">/ 3h</span>
                    </div>
                  </div>
                  <Progress 
                    value={screenTimePercent} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0h</span>
                    <span className="text-center">
                      {screenTimePercent > 80 ? 'Próximo do limite' : 
                       screenTimePercent > 50 ? 'Use com moderação' : 'Tudo certo'}
                    </span>
                    <span>3h</span>
                  </div>
                  {screenTimePercent > 80 && (
                    <Badge variant="destructive" className="text-xs">
                      Muito próximo do limite!
                    </Badge>
                  )}
                </div>

                {/* XP Progress */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-900">Experiência</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">
                        Nível {userData.level}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">({xpToNextLevel} XP restante)</span>
                    </div>
                  </div>
                  <Progress 
                    value={getCurrentLevelProgress(userData.xp, userData.level)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{userData.xp} XP</span>
                    <span>{userData.xp + xpToNextLevel} XP</span>
                  </div>
                </div>

                {/* Manual Time Input */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <label className="font-medium text-gray-900">Adicionar Tempo</label>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Minutos"
                      value={manualTime}
                      onChange={(e) => setManualTime(e.target.value)}
                      className="flex-1"
                      min="1"
                      max="300"
                    />
                    <Button 
                      onClick={addManualTime}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!manualTime || isNaN(parseInt(manualTime)) || parseInt(manualTime) <= 0}
                    >
                      Adicionar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Registre tempo de tela não monitorado automaticamente
                  </p>
                </div>
              </Card>
            </div>

            {/* Quick Actions Section */}
            <QuickActions 
              onTakeBreak={takeBreak}
              onStartFocusMode={handleStartFocusMode}
              onSetGoal={handleSetGoal}
              currentEnergy={Math.max(0, 100 - (currentSessionTime * 2))}
              isBreakTime={currentSessionTime > 40}
            />

            {/* Streak Display */}
            {userData.streakData && (
              <StreakDisplay 
                currentStreak={userData.streakData.currentStreak}
                longestStreak={userData.streakData.longestStreak}
                lastBreakDate={userData.streakData.lastBreakDate}
              />
            )}
          </TabsContent>

          <TabsContent value="missions">
            <Missions 
              userData={userData}
              onMissionComplete={completeMission}
            />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsPanel 
              userData={userData}
              onClaimReward={(achievement) => {
                updateUserData(prev => ({
                  ...prev,
                  coins: Math.min(prev.coins + achievement.reward.coins, 9999),
                  xp: Math.min(prev.xp + achievement.reward.xp, 10000),
                  achievements: [...(prev.achievements || []), achievement.id]
                }));
              }}
            />
          </TabsContent>

          <TabsContent value="avatar">
            <AvatarCustomization
              userData={userData}
              onSpendCoins={spendCoins}
              onUpdateAvatar={updateAvatar}
              currentEnergy={Math.max(0, 100 - (currentSessionTime * 2))}
            />
          </TabsContent>

          <TabsContent value="reports">
            <WeeklyReport userData={userData} />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              {/* Settings Header */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900">
                    Configurações
                  </h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Gerencie suas preferências, dispositivo e conta
                </p>
              </div>

              {/* Settings Tabs */}
              <Tabs defaultValue="device" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white rounded-lg border shadow-sm p-1">
                  <TabsTrigger 
                    value="device" 
                    className="rounded-md data-[state=active]:bg-gray-100 font-medium transition-colors duration-200 text-sm"
                  >
                    Dispositivo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="rounded-md data-[state=active]:bg-gray-100 font-medium transition-colors duration-200 text-sm"
                  >
                    Notificações
                  </TabsTrigger>
                  <TabsTrigger 
                    value="account" 
                    className="rounded-md data-[state=active]:bg-gray-100 font-medium transition-colors duration-200 text-sm"
                  >
                    Conta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="device" className="mt-4">
                  <ScreenTimeIntegration 
                    onScreenTimeUpdate={handleScreenTimeUpdate}
                    isAuthenticated={isAuthenticated}
                  />
                </TabsContent>

                <TabsContent value="notifications" className="mt-4">
                  <NotificationManager 
                    userData={userData}
                    onSettingsUpdate={handleNotificationSettings}
                  />
                </TabsContent>

                <TabsContent value="account" className="mt-4">
                  <AuthManager 
                    userData={userData}
                    onUserDataUpdate={handleUserDataUpdate}
                    onAuthStateChange={handleAuthStateChange}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>

        {/* Clean Break Dialog */}
        <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
          <DialogContent className="max-w-md bg-white border border-gray-200">
            <DialogHeader className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">😴</span>
              </div>
              <DialogTitle className="text-lg font-medium text-gray-900">
                Hora da pausa!
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600 space-y-1">
                <p>Você está usando a tela há mais de <strong>40 minutos</strong>.</p>
                <p>Que tal fazer uma pausa de 5 minutos?</p>
              </DialogDescription>
            </DialogHeader>
            
            {/* Benefits of taking a break */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 my-4">
              <h4 className="font-medium text-sm text-gray-900 mb-2">Benefícios da Pausa:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                <div className="flex items-center space-x-1">
                  <Coins className="h-3 w-3 text-gray-600" />
                  <span>+10 moedas</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="h-3 w-3 text-gray-600" />
                  <span>+15 XP</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3 text-gray-600" />
                  <span>Energia restaurada</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>👁️</span>
                  <span>Descanso visual</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-4">
              <Button 
                onClick={takeBreak} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Fazer Pausa
              </Button>
              <Button 
                variant="outline" 
                onClick={skipBreak} 
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Continuar
              </Button>
            </div>
            
            <p className="text-xs text-center text-gray-500 mt-3">
              Pausas regulares melhoram o foco e produtividade
            </p>
          </DialogContent>
        </Dialog>

          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
        </div>
      </div>
    </SecurityManager>
  );
}
