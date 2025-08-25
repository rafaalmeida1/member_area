// Mock data para simular API
export interface Module {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  content: ContentBlock[];
  createdAt: string;
  category: string;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'audio' | 'video';
  content: string;
  order: number;
}

export interface Nutritionist {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  specialties: string[];
}

export const mockNutritionist: Nutritionist = {
  id: '1',
  name: 'Dra. Ana Paula Silva',
  title: 'Nutricionista Clínica',
  bio: 'Especialista em nutrição funcional e emagrecimento saudável. CRN 12345/SP',
  image: '/src/assets/nutritionist-banner.jpg',
  specialties: ['Nutrição Funcional', 'Emagrecimento', 'Nutrição Esportiva', 'Saúde da Mulher']
};

export const mockModules: Module[] = [
  {
    id: '1',
    title: 'Introdução à Alimentação Saudável',
    description: 'Fundamentos básicos para uma alimentação equilibrada e nutritiva.',
    coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
    category: 'Fundamentos',
    createdAt: '2024-01-15',
    content: [
      {
        id: '1-1',
        type: 'text',
        content: 'A alimentação saudável é a base para uma vida plena e cheia de energia. Neste módulo, vamos explorar os princípios fundamentais de uma nutrição equilibrada.',
        order: 1
      },
      {
        id: '1-2',
        type: 'video',
        content: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 2
      },
      {
        id: '1-3',
        type: 'text',
        content: 'Os macronutrientes são essenciais: carboidratos fornecem energia, proteínas constroem e reparam tecidos, e gorduras auxiliam na absorção de vitaminas.',
        order: 3
      }
    ]
  },
  {
    id: '2',
    title: 'Planejamento de Refeições',
    description: 'Como organizar suas refeições semanais de forma prática e nutritiva.',
    coverImage: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
    category: 'Planejamento',
    createdAt: '2024-01-20',
    content: [
      {
        id: '2-1',
        type: 'text',
        content: 'O planejamento alimentar é fundamental para manter uma rotina saudável. Vamos aprender técnicas práticas para organizar suas refeições.',
        order: 1
      },
      {
        id: '2-2',
        type: 'audio',
        content: 'https://www.soundjay.com/misc/bell-ringing-05.wav',
        order: 2
      }
    ]
  },
  {
    id: '3',
    title: 'Alimentos Funcionais',
    description: 'Descubra os superalimentos e como incorporá-los no seu dia a dia.',
    coverImage: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&h=300&fit=crop',
    category: 'Alimentos',
    createdAt: '2024-01-25',
    content: [
      {
        id: '3-1',
        type: 'text',
        content: 'Os alimentos funcionais vão além da nutrição básica, oferecendo benefícios específicos para a saúde.',
        order: 1
      }
    ]
  },
  {
    id: '4',
    title: 'Hidratação e Saúde',
    description: 'A importância da água e como manter-se adequadamente hidratado.',
    coverImage: 'https://images.unsplash.com/photo-1506459225024-1428097a7e18?w=400&h=300&fit=crop',
    category: 'Hidratação',
    createdAt: '2024-02-01',
    content: [
      {
        id: '4-1',
        type: 'text',
        content: 'A hidratação adequada é essencial para o funcionamento optimal do organismo.',
        order: 1
      }
    ]
  }
];