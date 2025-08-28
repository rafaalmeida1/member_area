import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '@/services/api';
import './ResetPassword.css';
import NutriotinistImage from '@/components/NutriotinistImage';

export function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validar token ao carregar a página
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast({
          title: "Token inválido",
          description: "O link de redefinição de senha é inválido.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      try {
        setIsValidatingToken(true);
        await apiService.validateResetToken(token);
        setTokenValid(true);
      } catch (error) {
        toast({
          title: "Link expirado ou inválido",
          description: "Este link de redefinição de senha expirou ou é inválido. Solicite um novo.",
          variant: "destructive",
        });
        setTimeout(() => navigate('/forgot-password'), 3000);
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token, navigate, toast]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    
    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas,
      criteria: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasNonalphas
      }
    };
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password || !formData.confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A confirmação de senha deve ser igual à nova senha.",
        variant: "destructive",
      });
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha fraca",
        description: "A senha deve atender a todos os critérios de segurança.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await apiService.resetPassword(token!, formData.password);
      
      setResetSuccess(true);
      toast({
        title: "Senha redefinida com sucesso!",
        description: "Você será redirecionado para o login em breve.",
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Erro ao redefinir senha",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  if (isValidatingToken) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-form-container">
          <div className="reset-password-form-card">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Validando link de redefinição...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-form-container">
          <div className="reset-password-form-card">
            <div className="error-state">
              <div className="error-icon">
                <AlertCircle size={32} />
              </div>
              <h2 className="error-title">Link Inválido</h2>
              <p className="error-description">
                Este link de redefinição de senha expirou ou é inválido.
              </p>
              <button
                className="error-button"
                onClick={() => navigate('/forgot-password')}
              >
                Solicitar Novo Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-form-container">
          <div className="reset-password-form-card">
            <div className="success-state">
              <div className="success-icon">
                <CheckCircle size={32} />
              </div>
              <h2 className="success-title">Senha Redefinida!</h2>
              <p className="success-description">
                Sua senha foi redefinida com sucesso. Você será redirecionado para o login.
              </p>
              <div className="redirecting">
                Redirecionando...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">

      
      {/* Background Image */}
      <NutriotinistImage />
      
      {/* Reset Password Form */}
      <div className="reset-password-form-container">
        <div className="reset-password-form-card">
          {/* Logo */}
          <div className="reset-password-logo">
            <span className="logo-text">TM</span>
          </div>

          {/* Header */}
          <div className="reset-password-header">
            <div className="header-icon">
              <Lock size={24} />
            </div>
            <h2 className="header-title">Redefinir Senha</h2>
            <p className="header-description">
              Digite sua nova senha abaixo
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Nova Senha
              </label>
              <div className="input-container">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className="form-input"
                  placeholder="Digite sua nova senha"
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
                Confirmar Nova Senha
              </label>
              <div className="input-container">
                <Lock className="input-icon" size={18} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className="form-input"
                  placeholder="Confirme sua nova senha"
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

            {/* Critérios de Senha */}
            {formData.password && (
              <div className="password-criteria">
                <label className="criteria-label">Critérios de Segurança:</label>
                <div className="criteria-list">
                  {[
                    { label: 'Mínimo 8 caracteres', valid: passwordValidation.criteria.minLength },
                    { label: 'Pelo menos uma letra maiúscula', valid: passwordValidation.criteria.hasUpperCase },
                    { label: 'Pelo menos uma letra minúscula', valid: passwordValidation.criteria.hasLowerCase },
                    { label: 'Pelo menos um número', valid: passwordValidation.criteria.hasNumbers },
                    { label: 'Pelo menos um caractere especial', valid: passwordValidation.criteria.hasNonalphas },
                  ].map((criterion, index) => (
                    <div key={index} className="criteria-item">
                      <div className={`criteria-dot ${criterion.valid ? 'valid' : ''}`} />
                      <span className={`criteria-text ${criterion.valid ? 'valid' : ''}`}>
                        {criterion.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="form-actions">
              <button
                type="submit"
                className="reset-password-button"
                disabled={isLoading || !passwordValidation.isValid}
              >
                {isLoading ? 'Redefinindo...' : 'redefinir senha'}
              </button>
            </div>
          </form>
          
          {/* Footer */}
          <div className="reset-password-footer">
            <p className="footer-text">
              Lembrou sua senha?{' '}
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