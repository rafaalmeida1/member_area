# Componentes UI Padronizados

Todos os componentes do Shadcn UI foram personalizados para seguir o design minimalista do projeto com as cores `#DBCFCB` e `#D8C4A4`.

## 🎨 Cores do Tema

- **Primária**: `#D8C4A4` (bege claro)
- **Secundária**: `#DBCFCB` (bege mais claro)
- **Background**: Branco com transparência
- **Texto**: Cinza escuro

## 📦 Componentes Disponíveis

### Button
```tsx
import { Button } from '@/components/ui/button'

// Variantes disponíveis
<Button variant="default">Botão Principal</Button>
<Button variant="secondary">Botão Secundário</Button>
<Button variant="outline">Botão Outline</Button>
<Button variant="ghost">Botão Ghost</Button>
<Button variant="link">Botão Link</Button>
<Button variant="destructive">Botão Destrutivo</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="default">Padrão</Button>
<Button size="lg">Grande</Button>
<Button size="icon">Ícone</Button>
```

### Input
```tsx
import { Input } from '@/components/ui/input'

<Input placeholder="Digite aqui..." />
```

### Textarea
```tsx
import { Textarea } from '@/components/ui/textarea'

<Textarea placeholder="Digite aqui..." />
```

### Card
```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
  <CardFooter>
    Rodapé
  </CardFooter>
</Card>
```

### Badge
```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="default">Padrão</Badge>
<Badge variant="secondary">Secundário</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destrutivo</Badge>
```

### Select
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opção 1</SelectItem>
    <SelectItem value="option2">Opção 2</SelectItem>
  </SelectContent>
</Select>
```

### Tabs
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Aba 1</TabsTrigger>
    <TabsTrigger value="tab2">Aba 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Conteúdo 1</TabsContent>
  <TabsContent value="tab2">Conteúdo 2</TabsContent>
</Tabs>
```

### Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger>Abrir Modal</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Modal</DialogTitle>
    </DialogHeader>
    Conteúdo do modal
  </DialogContent>
</Dialog>
```

### Slider
```tsx
import { Slider } from '@/components/ui/slider'

<Slider defaultValue={[50]} max={100} step={1} />
```

## 🎯 Características do Design

### Botões
- **Hover**: Transform com translateY(-1px) e shadow
- **Transições**: 300ms suaves
- **Bordas**: Rounded-lg (8px)

### Inputs
- **Bordas**: Rounded-lg com cor personalizada
- **Focus**: Ring com cor do tema
- **Transições**: 300ms suaves

### Cards
- **Background**: Branco com transparência e backdrop-blur
- **Bordas**: Rounded-xl com cor personalizada
- **Shadow**: Hover com shadow-xl

### Badges
- **Bordas**: Rounded-full
- **Transições**: 300ms suaves
- **Hover**: Mudança de cor suave

## 🚀 Como Usar

1. **Importe** o componente desejado
2. **Use** as variantes e tamanhos disponíveis
3. **Personalize** com className quando necessário

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu Título</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default" size="lg">
          Clique Aqui
        </Button>
      </CardContent>
    </Card>
  )
}
```

Todos os componentes seguem o mesmo padrão visual e são responsivos por padrão. 