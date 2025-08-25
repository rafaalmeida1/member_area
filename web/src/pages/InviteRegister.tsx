import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, Phone, Key } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { apiService, InvitePreview } from '@/services/api';
import './InviteRegister.css';
import NutriotinistImage from '@/components/NutriotinistImage';

export function InviteRegister() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { toast } = useToast();
  
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);

  useEffect(() => {
    const loadInvite = async () => {
      if (!token) {
        toast({
          title: "Token inválido",
          description: "Link de convite inválido.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      try {
        setIsLoadingInvite(true);
        const inviteData = await apiService.getInviteByToken(token);
        setInvite(inviteData);
        
        // Salvar ID do profissional que convidou
        if (inviteData.createdBy?.id) {
          localStorage.setItem('invited_by_professional_id', inviteData.createdBy.id.toString());
        }
      } catch (error) {
        console.error('Erro ao carregar convite:', error);
        toast({
          title: "Convite inválido",
          description: "Este link de convite não é válido ou expirou.",
          variant: "destructive",
        });
        navigate('/login');
      } finally {
        setIsLoadingInvite(false);
      }
    };

    loadInvite();
  }, [token, navigate, toast]);

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Token inválido",
        description: "Link de convite inválido.",
        variant: "destructive",
      });
      return;
    }

    // Validações
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const authResponse = await apiService.acceptInvite(token, {
        name: formData.name,
        phone: formData.phone,
        password: formData.password
      });
      
      updateUser(authResponse.user);
      toast({
        title: "Conta criada!",
        description: "Bem-vindo! Sua conta foi criada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no registro",
        description: error instanceof Error ? error.message : "Erro ao criar conta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingInvite) {
    return (
      <div className="invite-register-container">
        <div className="invite-register-form-container">
          <div className="invite-register-form-card">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Carregando convite...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invite) {
    return null;
  }

  return (
    <div className="invite-register-container">
      {/* Theme Toggle */}
      <div className="theme-toggle-container">
        <ThemeToggle />
      </div>
      
      {/* Background Image */}
      <NutriotinistImage />
      
      {/* Register Form */}
      <div className="invite-register-form-container">
        <div className="invite-register-form-card">
          {/* Logo */}
          <div className="invite-register-logo">
            <span className="logo-text">TM</span>
          </div>

          {/* Invite Info */}
          <div className="invite-info">
            <div className="invite-icon">
              <Key size={24} />
            </div>
            <h2 className="invite-title">Convite Aceito</h2>
            <p className="invite-description">
              Você foi convidado por <strong>{invite.createdBy?.name || 'um profissional'}</strong>
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="invite-register-form overflow-auto max-h-screen">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nome Completo
              </label>
              <div className="input-container">
                <User className="input-icon" size={18} />
                <input
                  id="name"
                  type="text"
                  value={invite.name}
                  onChange={handleInputChange('name')}
                  className="form-input"
                  placeholder="Seu nome completo"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                E-mail
              </label>
              <div className="input-container">
                <Mail className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  value={invite.email}
                  onChange={handleInputChange('email')}
                  className="form-input"
                  placeholder="Seu e-mail"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Telefone
              </label>
              <div className="input-container">
                <Phone className="input-icon" size={18} />
                <input
                  id="phone"
                  type="tel"
                  value={invite?.phone}
                  onChange={handleInputChange('phone')}
                  className="form-input"
                  placeholder="Seu telefone"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <div className="input-container">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className="form-input"
                  placeholder="Sua senha"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Senha
              </label>
              <div className="input-container">
                <Lock className="input-icon" size={18} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className="form-input"
                  placeholder="Confirme sua senha"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="invite-register-button"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'aceitar convite'}
              </button>
            </div>
          </form>
          
          {/* Footer */}
          <div className="invite-register-footer">
            <p className="footer-text">
              Já tem uma conta?{' '}
              <a href="/login" className="footer-link">
                Faça login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}