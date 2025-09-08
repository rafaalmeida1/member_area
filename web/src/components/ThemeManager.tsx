import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Check, 
  RefreshCw, 
  Eye,
  Save,
  X
} from 'lucide-react';
import { themeService, ThemeColors, PredefinedTheme } from '@/services/themeService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/use-toast';

interface ThemeManagerProps {
  onThemeChange?: (colors: ThemeColors) => void;
}

export function ThemeManager({ onThemeChange }: ThemeManagerProps) {
  const [currentColors, setCurrentColors] = useState<ThemeColors | null>(null);
  const [predefinedThemes, setPredefinedThemes] = useState<PredefinedTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewColors, setPreviewColors] = useState<ThemeColors | null>(null);
  const { handleError, handleSuccess } = useErrorHandler();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [colors, themes] = await Promise.all([
        themeService.getUserThemeColors(),
        themeService.getPredefinedThemes()
      ]);
      
      setCurrentColors(colors);
      setPreviewColors(colors);
      setPredefinedThemes(themes);
      
      // Aplicar cores atuais
      themeService.applyThemeColors(colors);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (field: keyof ThemeColors, value: string) => {
    if (!previewColors) return;
    
    const newColors = { ...previewColors, [field]: value };
    setPreviewColors(newColors);
    themeService.applyThemeColors(newColors);
  };

  const handleSaveColors = async () => {
    if (!previewColors) return;
    
    try {
      setSaving(true);
      const savedColors = await themeService.updateUserThemeColors(previewColors);
      setCurrentColors(savedColors);
      handleSuccess('Cores do tema salvas com sucesso!');
      onThemeChange?.(savedColors);
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPredefinedTheme = async (theme: PredefinedTheme) => {
    try {
      setSaving(true);
      const colors = await themeService.applyPredefinedTheme(theme.id);
      setCurrentColors(colors);
      setPreviewColors(colors);
      handleSuccess(`Tema "${theme.name}" aplicado com sucesso!`);
      onThemeChange?.(colors);
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPreview = () => {
    if (currentColors) {
      setPreviewColors(currentColors);
      themeService.applyThemeColors(currentColors);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Gerenciador de Temas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando temas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Gerenciador de Temas
        </CardTitle>
        <CardDescription>
          Personalize as cores do seu perfil profissional. As alterações serão refletidas para todos os seus pacientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="predefined" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predefined">Temas Pré-definidos</TabsTrigger>
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predefined" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {predefinedThemes.map((theme) => (
                <Card key={theme.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{theme.name}</CardTitle>
                      {currentColors?.selectedTheme === theme.id && (
                        <Badge variant="default">
                          <Check className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{theme.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: theme.previewColor }}
                        />
                        <div className="flex-1 grid grid-cols-4 gap-1">
                          <div 
                            className="h-4 rounded"
                            style={{ backgroundColor: theme.colors.themePrimaryColor }}
                          />
                          <div 
                            className="h-4 rounded"
                            style={{ backgroundColor: theme.colors.themeSecondaryColor }}
                          />
                          <div 
                            className="h-4 rounded"
                            style={{ backgroundColor: theme.colors.themeAccentColor }}
                          />
                          <div 
                            className="h-4 rounded"
                            style={{ backgroundColor: theme.colors.themeBackgroundColor }}
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleApplyPredefinedTheme(theme)}
                        disabled={saving}
                      >
                        {saving ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Aplicar Tema
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            {previewColors && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Cores Principais */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Cores Principais</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="primary">Cor Primária</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="primary"
                            type="color"
                            value={previewColors.themePrimaryColor}
                            onChange={(e) => handleColorChange('themePrimaryColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={previewColors.themePrimaryColor}
                            onChange={(e) => handleColorChange('themePrimaryColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="secondary">Cor Secundária</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="secondary"
                            type="color"
                            value={previewColors.themeSecondaryColor}
                            onChange={(e) => handleColorChange('themeSecondaryColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={previewColors.themeSecondaryColor}
                            onChange={(e) => handleColorChange('themeSecondaryColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="accent">Cor de Destaque</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="accent"
                            type="color"
                            value={previewColors.themeAccentColor}
                            onChange={(e) => handleColorChange('themeAccentColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={previewColors.themeAccentColor}
                            onChange={(e) => handleColorChange('themeAccentColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cores de Interface */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Interface</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="background">Fundo</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="background"
                            type="color"
                            value={previewColors.themeBackgroundColor}
                            onChange={(e) => handleColorChange('themeBackgroundColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={previewColors.themeBackgroundColor}
                            onChange={(e) => handleColorChange('themeBackgroundColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="surface">Superfície</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="surface"
                            type="color"
                            value={previewColors.themeSurfaceColor}
                            onChange={(e) => handleColorChange('themeSurfaceColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={previewColors.themeSurfaceColor}
                            onChange={(e) => handleColorChange('themeSurfaceColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="text">Texto</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="text"
                            type="color"
                            value={previewColors.themeTextColor}
                            onChange={(e) => handleColorChange('themeTextColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={previewColors.themeTextColor}
                            onChange={(e) => handleColorChange('themeTextColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Botões de Ação */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleSaveColors} disabled={saving}>
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Cores
                  </Button>
                  
                  <Button variant="outline" onClick={handleResetPreview}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}