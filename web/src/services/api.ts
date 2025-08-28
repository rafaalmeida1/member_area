import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Configuração base da API - Usando proxy da Vercel para evitar Mixed Content
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Tipos para as respostas da API
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  stacktrace?: string;
}

export interface User {
  id: number;
  name: string; 
  email: string;
  phone?: string;
  birthDate?: string;
  role: 'PATIENT' | 'PROFESSIONAL';
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  category: string;
  orderIndex: number;
  contentCount: number;
  createdBy: {
    id: number;
    name: string;
  };
  createdAt: string;
  visibility?: 'GENERAL' | 'SPECIFIC';
  allowedPatients?: User[];
}

export interface ModuleDetail extends Module {
  content: ContentBlock[];
  allowedPatients?: User[];
}

export interface ContentBlock {
  id: string;
  type: 'TEXT' | 'VIDEO' | 'AUDIO';
  content: string;
  order: number;
  createdAt: string;
}

export interface Invite {
  id: number;
  email: string;
  name: string;
  phone?: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  token: string;
  expiresAt: string;
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
  };
  prefill?: Record<string, string | undefined>;
  fullLink?: string;
}

export interface InvitePreview {
  email: string;
  prefill?: Record<string, string | undefined>;
  isValid: boolean;
  expiresAt: string;
  createdBy?: {
    id: number;
    name: string;
  };
  name?: string;
  phone?: string;
}

export interface MediaAsset {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  publicUrl: string;
  externalUrl: string;
  storageType: 'LOCAL' | 'EXTERNAL';
  mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  description?: string;
  createdAt: string;
}

export interface ProfessionalProfile {
  id: number;
  name: string;
  title: string;
  bio?: string;
  image?: string;
  backgroundImage?: string;
  backgroundPositionX?: number; // 0-100
  backgroundPositionY?: number; // 0-100
  // Cores personalizadas do tema
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  themeAccentColor?: string;
  themeBackgroundColor?: string;
  themeSurfaceColor?: string;
  themeTextColor?: string;
  themeTextSecondaryColor?: string;
  specialties: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  isActive: boolean;
  createdAt: string;
  invitedAt?: string;
  stats?: PatientStats;
}

export interface PatientStats {
  id: number;
  totalModulesViewed: number;
  totalTimeSpent: number;
  lastActivity: string;
  modulesCompleted: number;
  averageSessionTime: number;
  favoriteCategories: string[];
  progressPercentage: number;
}

export interface UserStats {
  totalModulesViewed: number;
  totalTimeSpent: number;
  lastActivity: string;
  modulesCompleted: number;
  averageSessionTime: number;
  favoriteCategories: string[];
  progressPercentage: number;
  weeklyActivity: {
    date: string;
    modulesViewed: number;
    timeSpent: number;
  }[];
}

export interface Notification {
  id: number;
  type: 'MODULE_NEW' | 'MODULE_UPDATED' | 'PROFESSIONAL_MESSAGE' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  moduleId?: string; // UUID é uma string
  moduleTitle?: string;
}

export interface UpdateProfessionalProfileRequest {
  name: string;
  title: string;
  bio?: string;
  image?: string;
  backgroundImage?: string;
  backgroundPositionX?: number;
  backgroundPositionY?: number;
  // Cores personalizadas do tema
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  themeAccentColor?: string;
  themeBackgroundColor?: string;
  themeSurfaceColor?: string;
  themeTextColor?: string;
  themeTextSecondaryColor?: string;
  specialties?: string[];
}

export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
  mutedColor: string;
  shadowColor: string;
  overlayColor: string;
  // Novas cores para personalização completa
  sidebarBackgroundColor: string;
  sidebarHeaderColor: string;
  sidebarTextColor: string;
  sidebarActiveColor: string;
  sidebarHoverColor: string;
  userInfoBackgroundColor: string;
  userInfoTextColor: string;
  userAvatarColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  buttonPrimaryColor: string;
  buttonSecondaryColor: string;
  buttonTextColor: string;
  cardBackgroundColor: string;
  cardBorderColor: string;
  inputBackgroundColor: string;
  inputBorderColor: string;
  inputTextColor: string;
  tabActiveColor: string;
  tabInactiveColor: string;
  tabTextColor: string;
  notificationBackgroundColor: string;
  notificationTextColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  infoColor: string;
}

// Classe principal do serviço de API
class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token automaticamente
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Interceptor para tratar respostas de erro
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Carregar token do localStorage
    this.loadToken();
  }

  private loadToken() {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      this.token = savedToken;
    }
  }

  private saveToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  // =================== AUTH ENDPOINTS ===================

  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/login', {
      email,
      password,
    });

    if (response.data.status === 'success' && response.data.data) {
      this.saveToken(response.data.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro no login');
  }

  async registerPatient(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    birthDate?: string;
  }): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/register/patient', data);

    if (response.data.status === 'success' && response.data.data) {
      this.saveToken(response.data.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro no registro');
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/users/me');

    if (response.data.status === 'success' && response.data.data) {
      localStorage.setItem('user_data', JSON.stringify(response.data.data));
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar usuário');
  }

  async forgotPassword(email: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/auth/forgot-password', { email });

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao enviar email de recuperação');
    }
  }

  async validateResetToken(token: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.get(`/auth/reset-password/validate/${token}`);

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Token inválido ou expirado');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/auth/reset-password', {
      token,
      newPassword,
    });

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao redefinir senha');
    }
  }

  logout() {
    this.clearToken();
  }

  getCurrentUserFromStorage(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // =================== MODULES ENDPOINTS ===================

  async getModules(category?: string, page = 0, size = 20): Promise<{
    content: Module[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    last: boolean;
    first: boolean;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (category && category !== 'Todos') {
      params.append('category', category);
    }

    const response: AxiosResponse<ApiResponse<{
      content: Module[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
      last: boolean;
      first: boolean;
    }>> = await this.api.get(`/modules?${params}`);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar módulos');
  }

  async getModuleById(id: string): Promise<ModuleDetail> {
    const response: AxiosResponse<ApiResponse<ModuleDetail>> = await this.api.get(`/modules/${id}`);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar módulo');
  }

  async getCategories(): Promise<string[]> {
    const response: AxiosResponse<ApiResponse<string[]>> = await this.api.get('/categories');

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar categorias');
  }



  async createModule(data: {
    title: string;
    description: string;
    coverImage?: string;
    category: string;
    content: Array<{
      type: 'TEXT' | 'VIDEO' | 'AUDIO';
      content: string;
      order: number;
    }>;
    visibility?: 'GENERAL' | 'SPECIFIC';
    allowedPatientIds?: number[];
  }): Promise<ModuleDetail> {
    const response: AxiosResponse<ApiResponse<ModuleDetail>> = await this.api.post('/modules', data);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao criar módulo');
  }

  async updateModule(id: string, data: {
    title?: string;
    description?: string;
    coverImage?: string;
    category?: string;
    content?: Array<{
      type: 'TEXT' | 'VIDEO' | 'AUDIO';
      content: string;
      order: number;
    }>;
    visibility?: 'GENERAL' | 'SPECIFIC';
    allowedPatientIds?: number[];
  }): Promise<ModuleDetail> {
    const response: AxiosResponse<ApiResponse<ModuleDetail>> = await this.api.patch(`/modules/${id}`, data);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao atualizar módulo');
  }

  async deleteModule(id: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/modules/${id}`);

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao deletar módulo');
    }
  }

  // =================== INVITES ENDPOINTS ===================

  async getInvites(page = 0, size = 20): Promise<{
    content: Invite[];
    totalElements: number;
    totalPages: number;
  }> {
    const response: AxiosResponse<ApiResponse<{
      content: Invite[];
      totalElements: number;
      totalPages: number;
    }>> = await this.api.get(`/invites?page=${page}&size=${size}`);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar convites');
  }

  async createInvite(data: {
    email: string;
    name: string;
    phone?: string;
    expirationDays?: number;
    prefill?: Record<string, string | undefined>;
  }): Promise<Invite> {
    const response: AxiosResponse<ApiResponse<Invite>> = await this.api.post('/invites', data);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao criar convite');
  }

  async getInviteByToken(token: string): Promise<InvitePreview> {
    const response: AxiosResponse<ApiResponse<InvitePreview>> = await this.api.get(`/invites/${token}`);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Convite não encontrado ou expirado');
  }

  async acceptInvite(token: string, data: {
    password: string;
    phone?: string;
    name: string;
    email: string;
  }): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post(`/invites/${token}/accept`, data);

    if (response.data.status === 'success' && response.data.data) {
      this.saveToken(response.data.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao aceitar convite');
  }

  async resendInvite(inviteId: number): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post(`/invites/${inviteId}/resend`);

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao reenviar convite');
    }
  }

  async cancelInvite(inviteId: number): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post(`/invites/${inviteId}/cancel`);

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao cancelar convite');
    }
  }

  // =================== MEDIA ENDPOINTS ===================

  async uploadMedia(file: File, description?: string): Promise<MediaAsset> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const response: AxiosResponse<ApiResponse<MediaAsset>> = await this.api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao fazer upload');
  }

  async linkExternalMedia(data: {
    url: string;
    type: 'IMAGE' | 'VIDEO' | 'AUDIO';
    description?: string;
  }): Promise<MediaAsset> {
    const response: AxiosResponse<ApiResponse<MediaAsset>> = await this.api.post('/media/link', data);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao vincular mídia externa');
  }

  async getMyMedia(page = 0, size = 20): Promise<{
    content: MediaAsset[];
    totalElements: number;
    totalPages: number;
  }> {
    const response: AxiosResponse<ApiResponse<{
      content: MediaAsset[];
      totalElements: number;
      totalPages: number;
    }>> = await this.api.get(`/media/my?page=${page}&size=${size}`);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar mídias');
  }

  async deleteMedia(id: number): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/media/${id}`);

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao deletar mídia');
    }
  }

  // =================== USER ENDPOINTS ===================

  async updateProfile(data: {
    name?: string;
    phone?: string;
    birthDate?: string;
  }): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.patch('/users/me', data);

    if (response.data.status === 'success' && response.data.data) {
      localStorage.setItem('user_data', JSON.stringify(response.data.data));
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao atualizar perfil');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/users/change-password', {
      currentPassword,
      newPassword,
    });

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao alterar senha');
    }
  }

  // =================== PATIENTS ENDPOINTS (For professionals) ===================

  async getPatients(page = 0, size = 20): Promise<{
    content: User[];
    totalElements: number;
    totalPages: number;
  }> {
    const response: AxiosResponse<ApiResponse<{
      content: User[];
      totalElements: number;
      totalPages: number;
    }>> = await this.api.get(`/patients?page=${page}&size=${size}`);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar pacientes');
  }

  async getPatientsList(): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get('/users/patients/list');

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar lista de pacientes');
  }

  async uploadFile(file: File, type: 'IMAGE' | 'VIDEO' | 'AUDIO', description?: string): Promise<MediaAsset> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (description) {
      formData.append('description', description);
    }

    const response: AxiosResponse<ApiResponse<MediaAsset>> = await this.api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao fazer upload do arquivo');
  }

  async getFile(id: number): Promise<MediaAsset> {
    const response: AxiosResponse<ApiResponse<MediaAsset>> = await this.api.get(`/media/${id}`);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
  }

  async deleteFile(id: number): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/media/${id}`);

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao deletar mídia');
    }
  }

  // Professional Profile Methods
  async getProfessionalProfile(): Promise<ProfessionalProfile> {
    const response: AxiosResponse<ApiResponse<ProfessionalProfile>> = await this.api.get('/professional/profile');

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar perfil profissional');
  }

  async getProfessionalProfileById(userId: number): Promise<ProfessionalProfile> {
    const response: AxiosResponse<ApiResponse<ProfessionalProfile>> = await this.api.get(`/professional/profile/${userId}`);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar perfil profissional');
  }

  async getBannerData(): Promise<ProfessionalProfile> {
    const response: AxiosResponse<ApiResponse<ProfessionalProfile>> = await this.api.get('/professional/banner');

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar dados do banner');
  }

  async updateProfessionalProfile(data: UpdateProfessionalProfileRequest): Promise<ProfessionalProfile> {
    const response: AxiosResponse<ApiResponse<ProfessionalProfile>> = await this.api.put('/professional/profile', data);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao atualizar perfil profissional');
  }

  // Notificações
  async getNotifications(): Promise<Notification[]> {
    const response: AxiosResponse<ApiResponse<Notification[]>> = await this.api.get('/notifications');
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Erro ao buscar notificações');
  }

  async getNotificationsPaginated(page: number = 0, size: number = 20): Promise<{
    content: Notification[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
  }> {
    const response: AxiosResponse<ApiResponse<{
      content: Notification[];
      totalPages: number;
      totalElements: number;
      currentPage: number;
    }>> = await this.api.get(`/notifications/all?page=${page}&size=${size}`);
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Erro ao buscar notificações');
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.put(`/notifications/${notificationId}/read`);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao marcar notificação como lida');
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.put('/notifications/read-all');
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao marcar todas as notificações como lidas');
    }
  }

  async getUnreadNotificationsCount(): Promise<number> {
    const response: AxiosResponse<ApiResponse<number>> = await this.api.get('/notifications/unread-count');
    if (response.data.status === 'success' && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Erro ao buscar contador de notificações não lidas');
  }

  // Patient Management Methods
  async getAllPatientsWithStats(): Promise<Patient[]> {
    const response: AxiosResponse<ApiResponse<Patient[]>> = await this.api.get('/users/patients/stats');

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar pacientes com estatísticas');
  }

  async updatePatient(patientId: number, data: Record<string, unknown>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.patch(`/users/${patientId}`, data);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao atualizar paciente');
  }

  async deactivatePatient(patientId: number): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/users/${patientId}`);

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao desativar paciente');
    }
  }

  // User Stats Methods
  async getUserStats(): Promise<UserStats> {
    const response: AxiosResponse<ApiResponse<UserStats>> = await this.api.get('/users/stats');

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar estatísticas do usuário');
  }

  async updateCurrentUser(data: Record<string, unknown>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.patch('/users/me', data);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao atualizar usuário');
  }

  // MARK: - Theme
  async getTheme(): Promise<ThemeColors> {
    try {
      const response = await this.api.get('/api/theme');
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar tema:', error);
      // Retornar tema padrão em caso de erro
      return {
        primaryColor: '#DBCFCB',
        secondaryColor: '#D8C4A4',
        accentColor: '#A67B5B',
        backgroundColor: '#FFFFFF',
        surfaceColor: '#FAFAFA',
        textColor: '#2C2C2C',
        textSecondaryColor: '#666666',
        borderColor: '#E0E0E0',
        mutedColor: '#F0F0F0',
        shadowColor: '#0000001A',
        overlayColor: '#00000033',
        // Novas cores com valores padrão
        sidebarBackgroundColor: '#FAFAFA',
        sidebarHeaderColor: '#DBCFCB',
        sidebarTextColor: '#2C2C2C',
        sidebarActiveColor: '#DBCFCB',
        sidebarHoverColor: '#F0F0F0',
        userInfoBackgroundColor: '#F5F5F5',
        userInfoTextColor: '#2C2C2C',
        userAvatarColor: '#DBCFCB',
        headerBackgroundColor: '#FAFAFA',
        headerTextColor: '#2C2C2C',
        buttonPrimaryColor: '#DBCFCB',
        buttonSecondaryColor: '#D8C4A4',
        buttonTextColor: '#FFFFFF',
        cardBackgroundColor: '#FFFFFF',
        cardBorderColor: '#E0E0E0',
        inputBackgroundColor: '#FFFFFF',
        inputBorderColor: '#E0E0E0',
        inputTextColor: '#2C2C2C',
        tabActiveColor: '#DBCFCB',
        tabInactiveColor: '#F0F0F0',
        tabTextColor: '#2C2C2C',
        notificationBackgroundColor: '#FFFFFF',
        notificationTextColor: '#2C2C2C',
        successColor: '#10B981',
        errorColor: '#EF4444',
        warningColor: '#F59E0B',
        infoColor: '#3B82F6'
      };
    }
  }

  async updateTheme(theme: ThemeColors): Promise<void> {
    try {
      const response = await this.api.patch('/professional/profile/theme', theme);
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Erro ao atualizar tema');
      }
    } catch (error) {
      console.error('Erro ao atualizar tema:', error);
      throw error;
    }
  }

  // Module Reorder Methods
  async reorderModules(reorderRequests: Array<{ moduleId: string; newOrderIndex: number }>): Promise<Module[]> {
    const response: AxiosResponse<ApiResponse<Module[]>> = await this.api.patch('/modules/reorder', reorderRequests);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao reordenar módulos');
  }

}

// Instância singleton do serviço
export const apiService = new ApiService();