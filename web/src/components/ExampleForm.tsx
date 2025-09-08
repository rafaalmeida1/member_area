import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormErrorHandler } from '@/hooks/useErrorHandler';
import { validateEmail, validateRequired, validateUrl } from '@/lib/errorUtils';
import { publicLinksService } from '@/services/publicLinksService';

interface FormData {
  title: string;
  url: string;
  description: string;
  linkType: string;
}

interface FormErrors {
  [key: string]: string;
}

/**
 * Componente de exemplo mostrando como usar o sistema de tratamento de erros
 */
export function ExampleForm() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    url: '',
    description: '',
    linkType: 'WEBSITE'
  });
  
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { handleFormError, clearFormErrors } = useFormErrorHandler();

  // Validação client-side
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    const titleError = validateRequired(formData.title, 'Título');
    if (titleError) errors.title = titleError;
    
    const urlError = validateUrl(formData.url);
    if (urlError) errors.url = urlError;
    
    const typeError = validateRequired(formData.linkType, 'Tipo do link');
    if (typeError) errors.linkType = typeError;
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar erros anteriores
    clearFormErrors(setFieldErrors);
    
    // Validação client-side
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Chamada para a API
      await publicLinksService.createLink({
        title: formData.title,
        url: formData.url,
        description: formData.description,
        linkType: formData.linkType
      });
      
      // Reset do formulário em caso de sucesso
      setFormData({
        title: '',
        url: '',
        description: '',
        linkType: 'WEBSITE'
      });
      
    } catch (error) {
      // Tratamento de erro usando o hook
      handleFormError(error, setFieldErrors);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Exemplo de Formulário</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Título */}
          <div>
            <Label htmlFor="title">
              Título *
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={fieldErrors.title ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {fieldErrors.title && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.title}</p>
            )}
          </div>

          {/* Campo URL */}
          <div>
            <Label htmlFor="url">
              URL *
            </Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              className={fieldErrors.url ? 'border-red-500' : ''}
              placeholder="https://exemplo.com"
              disabled={isLoading}
            />
            {fieldErrors.url && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.url}</p>
            )}
          </div>

          {/* Campo Descrição */}
          <div>
            <Label htmlFor="description">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={fieldErrors.description ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {fieldErrors.description && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.description}</p>
            )}
          </div>

          {/* Campo Tipo */}
          <div>
            <Label htmlFor="linkType">
              Tipo do Link *
            </Label>
            <select
              id="linkType"
              value={formData.linkType}
              onChange={(e) => handleInputChange('linkType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                fieldErrors.linkType ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="WEBSITE">Website</option>
              <option value="SOCIAL">Rede Social</option>
              <option value="CONTACT">Contato</option>
              <option value="OTHER">Outro</option>
            </select>
            {fieldErrors.linkType && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.linkType}</p>
            )}
          </div>

          {/* Botão Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Salvando...' : 'Salvar Link'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Exemplo de uso com hook de operação API
 */
export function ExampleWithApiHook() {
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const { handleFormError } = useFormErrorHandler();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação client-side
    const emailError = validateEmail(email);
    if (emailError) {
      setFieldErrors({ email: emailError });
      return;
    }
    
    try {
      // Exemplo de chamada API
      // await apiService.forgotPassword(email);
      console.log('Email enviado:', email);
      
      // Reset em caso de sucesso
      setEmail('');
      setFieldErrors({});
      
    } catch (error) {
      handleFormError(error, setFieldErrors);
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Recuperar Senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors({});
                }
              }}
              className={fieldErrors.email ? 'border-red-500' : ''}
              placeholder="seu@email.com"
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full">
            Enviar Email
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
