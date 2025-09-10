import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { parseApiError } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import NutriotinistImage from '@/components/NutriotinistImage';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { markForAnimation } = useTheme();
  const { toast } = useToast();
  const location = useLocation();

  // Pré-preencher e-mail se vier na query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });
    } catch (error) {
      const parsed = parseApiError(error);
      toast({
        title: parsed.title,
        description: parsed.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteRedirect = () => {
    markForAnimation();
  };

  return (
    <div className="login-container">
      
      {/* Background Image no meio do espaço do background */}
     <NutriotinistImage />
      
      {/* Login Form */}
      <div className="login-form-container">
        <Card className="login-form-card pb-10">
          <CardHeader>
            {/* Logo */}
            <div className="login-logo">
              <span className="logo-text">TM</span>
            </div>
          </CardHeader>
          
          {/* Form */}
          <CardContent>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <Label htmlFor="email" className="form-label">
                  E-mail
                </Label>
                <div className="input-container">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    disabled={isLoading}
                  />
                </div>
              </div>
            
            <div className="form-group">
              <Label htmlFor="password" className="form-label">
                Senha
              </Label>
              <div className="input-container">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>
            
            <div className="form-actions">
              <a href="/forgot-password" className="forgot-password">
                Esqueceu sua senha? Clique aqui
              </a>
              
              <Button
                type="submit"
                className="login-button w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
          
          {/* Footer */}
          <div className="login-footer">
            <p className="footer-text">
              Tem um link de acesso?{' '}
              <a href="/invite" className="footer-link" onClick={handleInviteRedirect}>
                Acessar
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}