import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiService, User, AuthResponse } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerPatient: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    birthDate?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user && apiService.isAuthenticated();

  // Inicializar autenticação
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          // Tentar carregar usuário do localStorage primeiro
          const cachedUser = apiService.getCurrentUserFromStorage();
          if (cachedUser) {
            setUser(cachedUser);
          }

          // Depois validar com a API
          try {
            const currentUser = await apiService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Se falhar na validação, fazer logout
            console.warn('Falha na validação do token, fazendo logout:', error);
            apiService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const authResponse: AuthResponse = await apiService.login(email, password);
      setUser(authResponse.user);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${authResponse.user.name}!`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login. Verifique suas credenciais.';
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerPatient = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    birthDate?: string;
  }) => {
    try {
      setIsLoading(true);
      const authResponse: AuthResponse = await apiService.registerPatient(data);
      setUser(authResponse.user);
      
      toast({
        title: "Registro realizado com sucesso!",
        description: `Bem-vindo(a), ${authResponse.user.name}!`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no registro. Tente novamente.';
      toast({
        title: "Erro no registro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      // Se falhar, fazer logout
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    registerPatient,
    logout,
    updateUser,
    refreshUser,
  };

  // Mostrar loading enquanto inicializa
  if (isLoading && !user) {
    return (
      <LoadingSpinner 
        message="Inicializando aplicação..." 
        overlay 
        card 
        size="lg" 
      />
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}