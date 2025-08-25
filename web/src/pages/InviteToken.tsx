import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import './InviteToken.css';
import NutriotinistImage from '@/components/NutriotinistImage';

export function InviteToken() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!token.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o token do convite.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Redirecionar para a página de registro com o token
      navigate(`/invite/${token.trim()}`);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Token inválido. Verifique o token e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="invite-token-container">
      {/* Theme Toggle */}
      {/* <div className="theme-toggle-container">
        <ThemeToggle />
      </div> */}
      
      {/* Background Image */}
      <NutriotinistImage />
      
      {/* Invite Token Form */}
      <div className="invite-token-form-container">
        <div className="invite-token-form-card">
          {/* Logo */}
          <div className="invite-token-logo">
            <span className="logo-text">TM</span>
          </div>

          {/* Header */}
          <div className="invite-token-header">
            <div className="header-icon">
              <Mail size={24} />
            </div>
            <h2 className="header-title">Tenho um Convite</h2>
            <p className="header-description">
              Insira o token do convite que você recebeu por email
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="invite-token-form">
            <div className="form-group">
              <label htmlFor="token" className="form-label">
                Token do Convite
              </label>
              <div className="input-container">
                <Mail className="input-icon" size={18} />
                <input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="form-input"
                  placeholder="Cole aqui o token do seu convite"
                  disabled={isLoading}
                />
              </div>
              <p className="input-help">
                O token foi enviado para seu email junto com o convite.
              </p>
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="invite-token-button"
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'continuar com o convite'}
              </button>
            </div>
          </form>
          
          {/* Footer */}
          <div className="invite-token-footer">
            <button
              className="back-button"
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              <ArrowLeft size={16} />
              Voltar para o Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}