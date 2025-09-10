import { apiService } from './api';

export interface TrackPageViewRequest {
  pagePath: string;
  sessionId: string;
}

export interface TrackModuleViewRequest {
  moduleId: number;
  moduleTitle: string;
  category: string;
  timeSpent: number; // em segundos
  sessionId: string;
}

export interface TrackModuleCompletionRequest {
  moduleId: number;
  moduleTitle: string;
  category: string;
  timeSpent: number; // em segundos
  completionPercentage: number;
  sessionId: string;
}

export interface EndSessionRequest {
  sessionId: string;
  totalTimeSpent: number; // em segundos
}

class UserActivityService {
  private sessionId: string | null = null;
  private sessionStartTime: number | null = null;
  private pageViewStartTime: number | null = null;
  private currentPagePath: string | null = null;

  // Inicializar sessão
  async startSession(): Promise<string> {
    try {
      const response = await apiService.api.post('/api/user-activity/session/start');
      this.sessionId = response.data.data;
      this.sessionStartTime = Date.now();
      return this.sessionId;
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      throw error;
    }
  }

  // Finalizar sessão
  async endSession(): Promise<void> {
    if (!this.sessionId || !this.sessionStartTime) {
      return;
    }

    try {
      const totalTimeSpent = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      
      await apiService.api.post('/api/user-activity/session/end', {
        sessionId: this.sessionId,
        totalTimeSpent
      });

      this.sessionId = null;
      this.sessionStartTime = null;
      this.pageViewStartTime = null;
      this.currentPagePath = null;
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
    }
  }

  // Rastrear visualização de página
  async trackPageView(pagePath: string): Promise<void> {
    if (!this.sessionId) {
      await this.startSession();
    }

    // Finalizar tracking da página anterior se existir
    if (this.currentPagePath && this.pageViewStartTime) {
      const timeSpent = Math.floor((Date.now() - this.pageViewStartTime) / 1000);
      if (timeSpent > 0) {
        await this.trackPageViewTime(this.currentPagePath, timeSpent);
      }
    }

    // Iniciar tracking da nova página
    this.currentPagePath = pagePath;
    this.pageViewStartTime = Date.now();

    try {
      await apiService.api.post('/api/user-activity/track/page-view', {
        pagePath,
        sessionId: this.sessionId
      });
    } catch (error) {
      console.error('Erro ao rastrear visualização de página:', error);
    }
  }

  // Rastrear tempo gasto em uma página
  private async trackPageViewTime(pagePath: string, timeSpent: number): Promise<void> {
    // Esta funcionalidade pode ser expandida no futuro
    // Por enquanto, apenas logamos o tempo gasto
    console.log(`Tempo gasto em ${pagePath}: ${timeSpent} segundos`);
  }

  // Rastrear visualização de módulo
  async trackModuleView(moduleId: number, moduleTitle: string, category: string, timeSpent: number): Promise<void> {
    if (!this.sessionId) {
      await this.startSession();
    }

    try {
      await apiService.api.post('/api/user-activity/track/module-view', {
        moduleId,
        moduleTitle,
        category,
        timeSpent,
        sessionId: this.sessionId
      });
    } catch (error) {
      console.error('Erro ao rastrear visualização de módulo:', error);
    }
  }

  // Rastrear conclusão de módulo
  async trackModuleCompletion(moduleId: number, moduleTitle: string, category: string, timeSpent: number, completionPercentage: number): Promise<void> {
    if (!this.sessionId) {
      await this.startSession();
    }

    try {
      await apiService.api.post('/api/user-activity/track/module-completion', {
        moduleId,
        moduleTitle,
        category,
        timeSpent,
        completionPercentage,
        sessionId: this.sessionId
      });
    } catch (error) {
      console.error('Erro ao rastrear conclusão de módulo:', error);
    }
  }

  // Obter ID da sessão atual
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  // Verificar se há uma sessão ativa
  hasActiveSession(): boolean {
    return this.sessionId !== null;
  }
}

export const userActivityService = new UserActivityService();
