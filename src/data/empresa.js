/* Conteúdo institucional da Alex Sousa Tech.
   Regra: só fatos verdadeiros. Nada de tamanho de equipe, tempo de mercado, clientes,
   números, depoimentos ou resultados que não existam. */

export const EMPRESA = {
  nome: 'Alex Sousa Tech',
  slogan: 'Desenvolvimento • Tecnologia • Inovação',
  posicionamento: 'Empresa de tecnologia especializada no desenvolvimento de soluções digitais personalizadas para empresas e empreendedores.',
};

// Canais reais, os mesmos que já estavam configurados no site.
export const CONTATO = {
  email: 'alexsousadev.21@gmail.com',
  whatsapp: '5599984686139',
  whatsappRotulo: '(99) 98468-6139',
  instagram: 'https://instagram.com/alex.sousadev',
  instagramUsuario: '@alex.sousadev',
  github: 'https://github.com/alexfullstack-web',
  githubUsuario: 'alexfullstack-web',
};

export const linkWhatsapp = (mensagem = 'Olá! Vim pelo site da Alex Sousa Tech e gostaria de falar sobre um projeto.') =>
  `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(mensagem)}`;

export const NAV = [
  { to: '/', rotulo: 'Início' },
  { to: '/empresa', rotulo: 'Empresa' },
  { to: '/sobre-alex-sousa', rotulo: 'Sobre' },
  { to: '/servicos', rotulo: 'Serviços' },
  { to: '/projetos', rotulo: 'Projetos' },
  { to: '/contato', rotulo: 'Contato' },
];

// icone = nome do ícone (ver components/IconeServico.jsx)
export const SERVICOS = [
  {
    id: 'sites',
    icone: 'globe',
    nome: 'Desenvolvimento de sites',
    descricao: 'Sites institucionais rápidos, responsivos e preparados para aparecer no Google.',
    beneficio: 'Sua empresa apresentada com credibilidade, em qualquer tela.',
  },
  {
    id: 'sistemas',
    icone: 'layout-dashboard',
    nome: 'Sistemas web personalizados',
    descricao: 'Sistemas de gestão feitos para a rotina do seu negócio: cadastros, controles, relatórios e permissões.',
    beneficio: 'Processos organizados em um só lugar, do jeito que você trabalha.',
  },
  {
    id: 'lojas',
    icone: 'shopping-bag',
    nome: 'Lojas virtuais',
    descricao: 'Lojas com catálogo, carrinho e pedidos, prontas para vender pela internet.',
    beneficio: 'Um canal de vendas aberto todos os dias.',
  },
  {
    id: 'cardapios',
    icone: 'utensils',
    nome: 'Cardápios digitais',
    descricao: 'Cardápios online com fotos, categorias e pedido direto pelo WhatsApp.',
    beneficio: 'Pedidos mais claros e atualização de preços sem reimprimir nada.',
  },
  {
    id: 'landing-pages',
    icone: 'rocket',
    nome: 'Landing pages',
    descricao: 'Páginas focadas em uma oferta ou campanha, com um objetivo claro de conversão.',
    beneficio: 'Mais contatos a partir dos anúncios e divulgações.',
  },
  {
    id: 'aplicacoes',
    icone: 'app-window',
    nome: 'Aplicações web',
    descricao: 'Ferramentas que rodam no navegador, com login, painel e integração com outros serviços.',
    beneficio: 'Sua ideia funcionando no computador e no celular, sem instalar nada.',
  },
  {
    id: 'automacao',
    icone: 'workflow',
    nome: 'Automação de processos',
    descricao: 'Integrações e rotinas automáticas para tarefas que hoje são feitas à mão.',
    beneficio: 'Menos retrabalho e menos erros no dia a dia.',
  },
  {
    id: 'ia',
    icone: 'sparkles',
    nome: 'Soluções com inteligência artificial',
    descricao: 'Assistentes e recursos de IA integrados ao seu site ou sistema, com uso responsável dos dados.',
    beneficio: 'Atendimento e organização de informações com mais agilidade.',
  },
  {
    id: 'manutencao',
    icone: 'wrench',
    nome: 'Manutenção e melhorias',
    descricao: 'Correções, novas funcionalidades e atualizações em sites e sistemas já existentes.',
    beneficio: 'Seu projeto seguro, atualizado e evoluindo com o negócio.',
  },
];

export const PROCESSO = [
  { titulo: 'Entendimento', descricao: 'Conversamos sobre a ideia, o público e o problema que o projeto precisa resolver.' },
  { titulo: 'Planejamento', descricao: 'Definimos funcionalidades, telas, tecnologias e prazos antes de escrever qualquer código.' },
  { titulo: 'Desenvolvimento', descricao: 'Construímos a solução em etapas, mostrando o andamento para você acompanhar.' },
  { titulo: 'Testes e ajustes', descricao: 'Testamos em computador e celular e ajustamos os detalhes com o seu retorno.' },
  { titulo: 'Entrega e acompanhamento', descricao: 'Publicamos o projeto e seguimos com suporte e manutenção conforme o contratado.' },
];

export const DIFERENCIAIS = [
  { icone: 'puzzle', titulo: 'Desenvolvimento personalizado', texto: 'Cada projeto é construído para o seu caso, sem modelos prontos adaptados às pressas.' },
  { icone: 'target', titulo: 'Soluções pensadas para cada negócio', texto: 'Entendemos a rotina e os objetivos antes de definir a melhor solução.' },
  { icone: 'smartphone', titulo: 'Design moderno e responsivo', texto: 'Interfaces atuais que funcionam bem no celular, no tablet e no computador.' },
  { icone: 'code', titulo: 'Código organizado', texto: 'Código limpo e estruturado, mais fácil de manter e de evoluir.' },
  { icone: 'mouse-pointer', titulo: 'Atenção à experiência do usuário', texto: 'Caminhos claros, textos objetivos e telas que qualquer pessoa entende.' },
  { icone: 'life-buoy', titulo: 'Suporte e manutenção', texto: 'Acompanhamento depois da entrega, conforme o que for contratado.' },
];

export const SOBRE_EMPRESA = {
  proposta:
    'A Alex Sousa Tech desenvolve soluções digitais personalizadas: sites, sistemas, lojas virtuais e ferramentas sob medida. Antes de propor qualquer solução, buscamos entender a necessidade de cada cliente, para que o projeto resolva o problema certo.',
  missao: 'Ajudar empresas e empreendedores a crescer no digital com tecnologia bem feita, acessível e pensada para a realidade de cada negócio.',
  comoTrabalha:
    'Trabalhamos com conversa clara do início ao fim: entendimento da ideia, planejamento, desenvolvimento em etapas, testes e entrega com acompanhamento. Você sabe o que está sendo feito e por quê.',
};

// Apresentação pessoal: só na página Sobre.
export const ALEX = {
  nome: 'Alex Sousa',
  cargo: 'Desenvolvedor Full Stack e fundador da Alex Sousa Tech',
  apresentacao:
    'Sou desenvolvedor Full Stack e atuo na criação de soluções digitais, unindo desenvolvimento, tecnologia e design para transformar ideias em projetos funcionais.',
  areas: [
    { icone: 'layers', titulo: 'Desenvolvimento Full Stack' },
    { icone: 'monitor', titulo: 'Desenvolvimento de interfaces web' },
    { icone: 'layout-dashboard', titulo: 'Criação de sistemas personalizados' },
    { icone: 'server', titulo: 'Desenvolvimento de APIs e aplicações backend' },
    { icone: 'database', titulo: 'Banco de dados e integração de sistemas' },
    { icone: 'pen-tool', titulo: 'Design digital' },
    { icone: 'cpu', titulo: 'Eletrônica' },
    { icone: 'smartphone', titulo: 'Assistência técnica de celulares' },
    { icone: 'audio', titulo: 'Conhecimentos técnicos em áudio e sonorização' },
  ],
  tecnologias: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'Prisma', 'Bancos de dados', 'APIs REST'],
};

// Opções do formulário de orçamento (escolhas do visitante, não promessas da empresa).
export const OPCOES_ORCAMENTO = {
  tipos: [...SERVICOS.map((s) => s.nome), 'Outro tipo de projeto'],
  faixas: ['Até R$ 1.000', 'De R$ 1.000 a R$ 3.000', 'De R$ 3.000 a R$ 7.000', 'Acima de R$ 7.000', 'Ainda não sei'],
  prazos: ['Sem pressa', 'Em até 1 mês', 'Em até 2 meses', 'Em até 3 meses', 'Tenho uma data definida'],
  preferencias: [
    { valor: 'WHATSAPP', rotulo: 'WhatsApp' },
    { valor: 'EMAIL', rotulo: 'E-mail' },
    { valor: 'PHONE', rotulo: 'Ligação' },
  ],
};
