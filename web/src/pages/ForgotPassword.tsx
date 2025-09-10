import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { apiService } from '@/services/api';
import './ForgotPassword.css';
import NutriotinistImage from '@/components/NutriotinistImage';
import { Button } from '@/components/ui/button';

export function ForgotPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "E-mail obrigatório",
        description: "Por favor, informe seu e-mail.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiService.forgotPassword(email);
      setEmailSent(true);
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para instruções de recuperação.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar e-mail de recuperação.';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-form-container">
          <div className="forgot-password-form-card">
            <div className="success-state">
              <div className="success-icon">
                <CheckCircle size={32} />
              </div>
              <h2 className="success-title">E-mail Enviado!</h2>
              <p className="success-description">
                Enviamos um e-mail para <strong>{email}</strong> com instruções para redefinir sua senha.
              </p>
              <div className="success-instructions">
                <p>• Verifique sua caixa de entrada e spam</p>
                <p>• O link é válido por 24 horas</p>
                <p>• Se não receber, tente novamente</p>
              </div>
              <div className="success-actions">
                <button
                  className="secondary-button"
                  onClick={() => setEmailSent(false)}
                >
                  Enviar Novamente
                </button>
                <button
                  className="primary-button"
                  onClick={() => navigate('/login')}
                >
                  Voltar ao Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      
      {/* Background Image */}
      <NutriotinistImage />
      
      {/* Forgot Password Form */}
      <div className="forgot-password-form-container">
        <div className="forgot-password-form-card">
          {/* Logo */}
          <div className="forgot-password-logo">
            <span className="logo-text">TM</span>
          </div>

          {/* Header */}
          <div className="forgot-password-header">
            <h2 className="header-title">Esqueceu sua senha?</h2>
            <p className="header-description">
              Digite seu e-mail e enviaremos instruções para redefinir sua senha
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                E-mail
              </label>
              <div className="input-container">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Seu e-mail"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <Button
                type="submit"
                className="forgot-password-button w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'enviar instruções'}
              </Button>
            </div>
          </form>
          
          {/* Footer */}
          <div className="forgot-password-footer">
            <button
              className="back-button"
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              <ArrowLeft size={16} />
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}