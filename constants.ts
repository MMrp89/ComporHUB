import { Course, Section, SectionVariant, Lesson, Attachment } from './types';

export const CATEGORIES = [
  'Tráfego Pago & Meta Ads',
  'Google Ads & YouTube',
  'Funis de Vendas & ROI',
  'Copywriting & Criativos',
  'Gestão & Processos de Agência',
  'Automação & CRM',
];

const SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const FEATURED_COURSE: Course = {
  id: 'featured-masterclass-roas',
  title: 'Masterclass: Escala de Tráfego Pago & ROAS 5x+',
  category: 'Tráfego Pago & Meta Ads',
  thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1920&q=80',
  duration: '6 Aulas • 3h 45m',
  description: 'O método completo e validado para escalar campanhas de Meta Ads e Google Ads com previsibilidade, gestão de criativos de alta retenção e controle estrito de CAC e Blended ROAS.',
  instructor: 'Mário Morgado',
  instructorRole: 'Head de Performance & Growth',
  lessons: [
    {
      id: 'l-feat-1',
      title: '01. Arquitetura de Conta & Estratégia de Escala CBO/ABO',
      duration: '22m',
      videoUrl: SAMPLE_VIDEO,
      isFree: true,
      description: 'Como montar uma estrutura robusta à prova de bloqueios e pronta para receber orçamentos 5x maiores sem estourar o CPA.',
      attachments: [
        {
          id: 'att-feat-1',
          name: 'Planilha_Calculadora_ROAS_e_CAC.xlsx',
          type: 'spreadsheet',
          url: '#',
          size: '1.4 MB',
          description: 'Calculadora automática para encontrar o ponto de equilíbrio (breakeven) e margem de lucro por campanha.'
        },
        {
          id: 'att-feat-2',
          name: 'Guia_Estrutura_de_Contas_Meta_2026.pdf',
          type: 'pdf',
          url: '#',
          size: '3.8 MB',
          description: 'Manual visual com esquemas de públicos abertos, lookalikes e segmentações vantajosas.'
        }
      ]
    },
    {
      id: 'l-feat-2',
      title: '02. Laboratório de Criativos: Análise de Hook Rate & Hold Rate',
      duration: '35m',
      videoUrl: SAMPLE_VIDEO,
      isFree: true,
      description: 'A anatomia dos criativos vencedores. Métricas de retenção nos primeiros 3 segundos e copies que convertem em escala.',
      attachments: [
        {
          id: 'att-feat-3',
          name: 'Templates_Criativos_Photoshop_Figma.zip',
          type: 'zip',
          url: '#',
          size: '48.2 MB',
          description: 'Pack com 15 layouts de anúncios estáticos e scripts de vídeos curtos prontos para edição.'
        },
        {
          id: 'att-feat-4',
          name: 'Checklist_Auditoria_de_Criativos.pdf',
          type: 'pdf',
          url: '#',
          size: '890 KB',
          description: 'Checklist de 12 pontos para aprovação de novos criativos antes de subir na conta.'
        }
      ]
    },
    {
      id: 'l-feat-3',
      title: '03. Google Ads para E-commerce: Performance Max & Search Alpha',
      duration: '40m',
      videoUrl: SAMPLE_VIDEO,
      isFree: false,
      description: 'Dominando feeds do Google Merchant Center, segmentações avançadas e termos negativos para maximizar a conversão.',
      attachments: [
        {
          id: 'att-feat-5',
          name: 'Lista_Palavras_Chave_Negativas_Universal.xlsx',
          type: 'spreadsheet',
          url: '#',
          size: '640 KB',
          description: 'Mais de 2.000 palavras-chave negativas essenciais para economizar orçamento no Google Ads.'
        }
      ]
    },
    {
      id: 'l-feat-4',
      title: '04. Funil de Vendas de Alta Conversão & Otimização de Checkout',
      duration: '38m',
      videoUrl: SAMPLE_VIDEO,
      isFree: false,
      description: 'Reduzindo o abandono de carrinho e aumentando o ticket médio com upsells, order bumps e automações de CRM.',
      attachments: [
        {
          id: 'att-feat-6',
          name: 'Blueprint_Funil_Vendas_Infoproduto_Ecommerce.pdf',
          type: 'pdf',
          url: '#',
          size: '5.1 MB',
          description: 'Mapeamento visual do fluxo de tráfego, página de vendas e checkout.'
        }
      ]
    },
    {
      id: 'l-feat-5',
      title: '05. Dashboards White-Label & Gestão de Relatórios para Clientes',
      duration: '28m',
      videoUrl: SAMPLE_VIDEO,
      isFree: false,
      description: 'Como apresentar dados e ROI de forma cristalina para clientes sem gastar horas montando relatórios manuais.',
      attachments: [
        {
          id: 'att-feat-7',
          name: 'Modelo_Relatorio_Executivo_Mensal.pdf',
          type: 'pdf',
          url: '#',
          size: '2.3 MB',
          description: 'Template de relatório executivo que comprova o valor do gestor de tráfego.'
        }
      ]
    },
    {
      id: 'l-feat-6',
      title: '06. Plano de Ação: Escalando de R$ 10k para R$ 100k/mês',
      duration: '42m',
      videoUrl: SAMPLE_VIDEO,
      isFree: false,
      description: 'O passo a passo estratégico para gerenciar grandes volumes de verba sem perder a margem de contribuição.',
      attachments: [
        {
          id: 'att-feat-8',
          name: 'Roadmap_Escala_Orcamento_Planilha.xlsx',
          type: 'spreadsheet',
          url: '#',
          size: '1.1 MB',
          description: 'Cronograma e matriz de decisão para aumentos graduais de orçamento diário.'
        }
      ]
    }
  ],
  tips: [
    "Monitore o Blended ROAS diariamente para ter clareza do retorno global sobre o investimento.",
    "Criativos representam mais de 70% do sucesso no Meta Ads atual. Teste pelo menos 5 novos ângulos semanais.",
    "Nunca aumente o orçamento em mais de 20% a cada 48h em conjuntos ABO para não reiniciar o aprendizado da máquina.",
    "Analise os materiais complementares em PDF e Planilhas anexados em cada aula para acelerar sua implementação."
  ],
  attachments: [
    {
      id: 'att-master-pack',
      name: 'Kit_Completo_Materiais_Escala_Compor_HUB.zip',
      type: 'zip',
      url: '#',
      size: '62.4 MB',
      description: 'Todos os PDFs, Planilhas, Modelos de Relatório e Scripts do curso compactados em um único arquivo.'
    },
    {
      id: 'att-master-pdf',
      name: 'Apostila_Oficial_Gestao_Trafego_Pago_2026.pdf',
      type: 'pdf',
      url: '#',
      size: '12.8 MB',
      description: 'Apostila completa de 94 páginas com resumos teóricos e práticos.'
    }
  ]
};

// Realistic library of courses with attached downloadable assets
export const INITIAL_COURSES: Course[] = [
  FEATURED_COURSE,
  {
    id: 'course-meta-ads-pro',
    title: 'Meta Ads Pro: Segmentações, Públicos & Pixel CAPI',
    category: 'Tráfego Pago & Meta Ads',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    duration: '5 Aulas • 2h 50m',
    description: 'Aprenda a configurar a API de Conversões do Meta, gerenciar eventos prioritários e explorar públicos de alta conversão.',
    instructor: 'Lucas Farias',
    instructorRole: 'Especialista em Tracking & Meta Ads',
    lessons: [
      {
        id: 'c-meta-1',
        title: '01. Configuração do Pixel e API de Conversões (CAPI)',
        duration: '32m',
        videoUrl: SAMPLE_VIDEO,
        isFree: true,
        description: 'Tracking avançado com Google Tag Manager (GTM) e servidor para 100% de precisão nos eventos.',
        attachments: [
          {
            id: 'meta-att-1',
            name: 'Container_GTM_Pre_Configurado_Meta_CAPI.json',
            type: 'doc',
            url: '#',
            size: '220 KB',
            description: 'Arquivo JSON pronto para importar no Google Tag Manager com todos os eventos essenciais.'
          }
        ]
      },
      {
        id: 'c-meta-2',
        title: '02. Criação de Públicos Personalizados e Lookalikes',
        duration: '28m',
        videoUrl: SAMPLE_VIDEO,
        isFree: true,
        description: 'Construindo públicos de compradores, visitantes de carrinho e engajamento no Instagram.',
        attachments: [
          {
            id: 'meta-att-2',
            name: 'Guia_Estrategico_Publicos_Meta.pdf',
            type: 'pdf',
            url: '#',
            size: '2.1 MB',
            description: 'Matriz de segmentação por temperatura de público (Frio, Morno, Quente).'
          }
        ]
      },
      {
        id: 'c-meta-3',
        title: '03. Testes A/B Científicos de Criativos',
        duration: '35m',
        videoUrl: SAMPLE_VIDEO,
        isFree: false,
        description: 'Metodologia para testar manchetes, ganchos e CTAs sem desperdiçar verba.'
      },
      {
        id: 'c-meta-4',
        title: '04. Estratégias de Remarketing Dinâmico',
        duration: '30m',
        videoUrl: SAMPLE_VIDEO,
        isFree: false,
        description: 'Recuperando vendas com catálogos de produtos e mensagens personalizadas de urgência.'
      },
      {
        id: 'c-meta-5',
        title: '05. Contingência & Aquecimento de Ativos',
        duration: '45m',
        videoUrl: SAMPLE_VIDEO,
        isFree: false,
        description: 'Proteja suas contas de anúncios com uma estrutura de contingência profissional.'
      }
    ],
    tips: [
      "A API de Conversões (CAPI) recupera em média 25% mais dados de eventos perdidos pelo iOS.",
      "Teste criativos sempre com público amplo (Broad) para validar a força do anúncio por si só."
    ],
    attachments: [
      {
        id: 'meta-att-global-1',
        name: 'Checklist_Contingencia_Meta_Ads.pdf',
        type: 'pdf',
        url: '#',
        size: '1.8 MB',
        description: 'Passo a passo para blindar seus BMs, perfis e contas de anúncios.'
      },
      {
        id: 'meta-att-global-2',
        name: 'Planilha_Teste_AB_Criativos.xlsx',
        type: 'spreadsheet',
        url: '#',
        size: '950 KB',
        description: 'Acompanhamento do CTR e CPA por variação de criativo testado.'
      }
    ]
  },
  {
    id: 'course-google-ads-expert',
    title: 'Google Ads Expert: Rede de Pesquisa & Performance Max',
    category: 'Google Ads & YouTube',
    thumbnail: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80',
    duration: '4 Aulas • 2h 15m',
    description: 'Domine a intenção de busca no Google. Como estruturar campanhas de Pesquisa de alto índice de qualidade e campanhas PMax focadas em ROAS.',
    instructor: 'Renato Silveira',
    instructorRole: 'Google Premier Partner',
    lessons: [
      {
        id: 'c-goog-1',
        title: '01. Índice de Qualidade & Correspondência de Palavras',
        duration: '30m',
        videoUrl: SAMPLE_VIDEO,
        isFree: true,
        description: 'Como pagar menos por clique e aparecer nas primeiras posições do Google.',
        attachments: [
          {
            id: 'goog-att-1',
            name: 'Guia_Indice_Qualidade_10_de_10.pdf',
            type: 'pdf',
            url: '#',
            size: '3.2 MB',
            description: 'As 3 regras para alcançar nota 10/10 no índice de qualidade do Google Ads.'
          }
        ]
      },
      {
        id: 'c-goog-2',
        title: '02. Configuração Avançada de Performance Max (PMax)',
        duration: '42m',
        videoUrl: SAMPLE_VIDEO,
        isFree: true,
        description: 'Alimentando o algoritmo com sinais de público precisos e exclusões estratégicas.'
      },
      {
        id: 'c-goog-3',
        title: '03. Google Shopping & Otimização de Títulos no Feed',
        duration: '33m',
        videoUrl: SAMPLE_VIDEO,
        isFree: false,
        description: 'Como ranquear no topo do Google Shopping reestruturando os títulos dos seus produtos.'
      },
      {
        id: 'c-goog-4',
        title: '04. Estratégias de Lances: Maximizar Conversões vs tROAS',
        duration: '30m',
        videoUrl: SAMPLE_VIDEO,
        isFree: false,
        description: 'O momento exato de transicionar lances manuais para lances automatizados inteligentes.'
      }
    ],
    tips: [
      "Adicione palavras-chave negativas semanalmente na aba de Termos de Pesquisa.",
      "No Google Ads, o CTR do anúncio dita mais de 50% do seu custo por clique real."
    ],
    attachments: [
      {
        id: 'goog-att-all',
        name: 'Kit_Templates_Anuncios_Google_Search.zip',
        type: 'zip',
        url: '#',
        size: '14.5 MB',
        description: 'Modelos de textos, títulos e extensões de anúncio de alta taxa de clique.'
      }
    ]
  },
  {
    id: 'course-creative-lab',
    title: 'Design & Copywriting de Criativos que Vendem',
    category: 'Copywriting & Criativos',
    thumbnail: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
    duration: '4 Aulas • 2h 20m',
    description: 'Transforme ideias em criativos de alta conversão. Estrutura de roteiros para UGC, ganchos magnéticos e psicologia de compra.',
    instructor: 'Camila Rossi',
    instructorRole: 'Diretora de Criação & Copywriter',
    lessons: [
      {
        id: 'c-creat-1',
        title: '01. Os 10 Ganchos (Hooks) Mais Poderosos para Vídeos Curtos',
        duration: '35m',
        videoUrl: SAMPLE_VIDEO,
        isFree: true,
        description: 'Como prender a atenção do usuário nos primeiros 3 segundos do Reels e TikTok.',
        attachments: [
          {
            id: 'creat-att-1',
            name: '50_Ganchos_Validados_para_Reels_e_TikTok.pdf',
            type: 'pdf',
            url: '#',
            size: '4.7 MB',
            description: '50 modelos prontos de frases de impacto para abertura de vídeos de tráfego pago.'
          }
        ]
      },
      {
        id: 'c-creat-2',
        title: '02. Roteirização de Anúncios UGC (User Generated Content)',
        duration: '40m',
        videoUrl: SAMPLE_VIDEO,
        isFree: true,
        description: 'Como orientar criadores de conteúdo e clientes para gravarem depoimentos autênticos.'
      },
      {
        id: 'c-creat-3',
        title: '03. Anúncios Estáticos: Tipografia, Contraste e Quebra de Padrão',
        duration: '32m',
        videoUrl: SAMPLE_VIDEO,
        isFree: false,
        description: 'Design estratégico no Feed do Instagram para aumentar a taxa de cliques (CTR).'
      },
      {
        id: 'c-creat-4',
        title: '04. Framework de Análise de Fadiga de Criativo',
        duration: '33m',
        videoUrl: SAMPLE_VIDEO,
        isFree: false,
        description: 'Como identificar quando um anúncio saturou antes de perder dinheiro.'
      }
    ],
    tips: [
      "O gancho do anúncio (primeiros 3 segundos) define mais de 80% do CPA final.",
      "Criativos simples com estética nativa (parecidos com stories de amigos) costumam converter melhor que vídeos ultra-produzidos."
    ],
    attachments: [
      {
        id: 'creat-att-all',
        name: 'Pack_Figma_Templates_Anuncios_Feed_Stories.zip',
        type: 'zip',
        url: '#',
        size: '32.1 MB',
        description: 'Mais de 30 templates editáveis no Figma prontos para exportação.'
      }
    ]
  },
  {
    id: 'course-agency-scale',
    title: 'Gestão de Agência & Relatórios para Clientes de Tráfego',
    category: 'Gestão & Processos de Agência',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
    duration: '4 Aulas • 2h 05m',
    description: 'Como precificar seus serviços, reter clientes com relatórios claros de ROI e organizar o fluxo de trabalho da sua equipe.',
    instructor: 'Mário Morgado',
    instructorRole: 'Fundador & Consultor de Performance',
    lessons: [
      {
        id: 'c-ag-1',
        title: '01. Modelos de Precificação: Fixo + Variável sobre ROAS',
        duration: '28m',
        videoUrl: SAMPLE_VIDEO,
        isFree: true,
        description: 'Como cobrar comissões sobre resultados sem assumir riscos desnecessários.',
        attachments: [
          {
            id: 'ag-att-1',
            name: 'Contrato_Prestacao_Servicos_Trafego_Pago.docx',
            type: 'doc',
            url: '#',
            size: '145 KB',
            description: 'Modelo jurídico completo de contrato de prestação de serviços de gestão de tráfego.'
          }
        ]
      },
      {
        id: 'c-ag-2',
        title: '02. Onboarding Perfeito de Novos Clientes',
        duration: '32m',
        videoUrl: SAMPLE_VIDEO,
        isFree: true,
        description: 'O formulário de briefing e alinhamento de expectativas que evita cancelamentos prematuros.'
      },
      {
        id: 'c-ag-3',
        title: '03. Reunião Mensal de Resultados: A Apresentação Ideal',
        duration: '35m',
        videoUrl: SAMPLE_VIDEO,
        isFree: false,
        description: 'Mostrando faturamento real e lucro líquido sem afogar o cliente em termos técnicos.'
      },
      {
        id: 'c-ag-4',
        title: '04. Delegando Tarefas e Contratando Designers/Copywriters',
        duration: '30m',
        videoUrl: SAMPLE_VIDEO,
        isFree: false,
        description: 'Processos de esteira de produção para gerenciar mais de 20 clientes simultâneos.'
      }
    ],
    tips: [
      "Clientes não compram cliques ou impressões; eles compram faturamento previsível e tranquilidade.",
      "Envie micro-atualizações semanais pelo WhatsApp com o faturamento gerado para manter o cliente seguro."
    ],
    attachments: [
      {
        id: 'ag-att-pack',
        name: 'Kit_Processos_e_Documentos_Agencia.zip',
        type: 'zip',
        url: '#',
        size: '18.3 MB',
        description: 'Contratos, briefings de onboarding, planilhas de precificação e apresentações em PowerPoint.'
      }
    ]
  },
  {
    id: 'course-funnel-cro',
    title: 'Funis de Vendas, CRO & Otimização de Taxa de Conversão',
    category: 'Funis de Vendas & ROI',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    duration: '3 Aulas • 1h 45m',
    description: 'Dobre o resultado do seu tráfego sem gastar 1 real a mais em anúncios otimizando as páginas de destino e o checkout.',
    instructor: 'Lucas Farias',
    instructorRole: 'Especialista em CRO & Funis',
    lessons: [
      {
        id: 'c-cro-1',
        title: '01. Diagnóstico de Gargalos no Funil de Vendas',
        duration: '35m',
        videoUrl: SAMPLE_VIDEO,
        isFree: true,
        description: 'Onde seus visitantes estão travando: Página, Carrinho ou Checkout?',
        attachments: [
          {
            id: 'cro-att-1',
            name: 'Planilha_Diagnostico_Funil_Vendas.xlsx',
            type: 'spreadsheet',
            url: '#',
            size: '820 KB',
            description: 'Insira suas métricas e descubra automaticamente onde está a maior perda financeira do seu funil.'
          }
        ]
      },
      {
        id: 'c-cro-2',
        title: '02. Otimização de Landing Pages de Alta Conversão',
        duration: '40m',
        videoUrl: SAMPLE_VIDEO,
        isFree: true,
        description: 'Estrutura visual, velocidade de carregamento e provas sociais que convertem.'
      },
      {
        id: 'c-cro-3',
        title: '03. Recuperação de Vendas via WhatsApp & E-mail',
        duration: '30m',
        videoUrl: SAMPLE_VIDEO,
        isFree: false,
        description: 'Sequências de mensagens automáticas que recuperam até 35% dos checkouts abandonados.'
      }
    ],
    tips: [
      "Uma página que demora mais de 3 segundos para carregar perde em média 40% dos visitantes do anúncio.",
      "Order bumps no checkout com ticket baixo aumentam o faturamento total em até 18% imediatamente."
    ],
    attachments: [
      {
        id: 'cro-att-all',
        name: 'Scripts_Recuperacao_Carrinho_WhatsApp.pdf',
        type: 'pdf',
        url: '#',
        size: '1.9 MB',
        description: 'Mensagens prontas para copiar e colar na sua automação de recuperação.'
      }
    ]
  }
];

export const generateMockSections = (): Section[] => {
  return [
    {
      title: 'Em Destaque • Tráfego & Performance',
      variant: 'landscape',
      courses: INITIAL_COURSES
    },
    {
      title: 'Cursos com Pacotes de Materiais & Planilhas',
      variant: 'landscape',
      courses: INITIAL_COURSES.filter(c => c.attachments && c.attachments.length > 0)
    },
    {
      title: 'Formações Recomendadas Compor HUB',
      variant: 'portrait',
      courses: INITIAL_COURSES
    },
    {
      title: 'Criativos, Copywriting & Design',
      variant: 'landscape',
      courses: INITIAL_COURSES.filter(c => c.category.includes('Criativos') || c.category.includes('Funis'))
    }
  ];
};
