/* Conteúdo do site — edite aqui textos, links e projetos. */

export const CONTACT = {
  email: 'alexsousadev.21@gmail.com',
  github: 'https://github.com/alexfullstack-web',
  githubUser: 'alexfullstack-web',
  whatsapp: 'https://wa.me/5599984686139',
  whatsappLabel: '(99) 98468-6139',
  instagram: 'https://instagram.com/alex.sousadev',
  instagramUser: 'alex.sousadev',
};

export const NAV = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'tecnologias', label: 'Stack' },
  { id: 'missao', label: 'Missão' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'experiencia', label: 'Experiência' },
];

export const TRAITS = ['Aprendizado contínuo', 'Organização', 'Atenção a detalhes', 'Comunicação direta'];

export const STACK_GROUPS = [
  { title: 'Frontend', orbit: 0, items: ['HTML5', 'CSS3', 'JavaScript', 'React'] },
  { title: 'Backend', orbit: 1, items: ['Node.js', 'Express.js', 'JWT & bcrypt', 'REST APIs'] },
  { title: 'Dados', orbit: 2, items: ['Prisma', 'MongoDB'] },
];

export const PIPELINE = ['Frontend', 'REST API', 'Node.js + Express', 'JWT · bcrypt', 'Prisma', 'MongoDB'];

export const PROJECTS = [
  {
    id: 'erp',
    mission: 'Missão 01',
    tag: 'Projeto principal',
    title: 'ERP Alex Sousa',
    desc: 'Sistema de gestão empresarial que reúne CRM, clientes, leads, projetos, financeiro e controle de usuários em uma única plataforma.',
    stack: ['Node.js', 'Express', 'JWT', 'bcrypt', 'Prisma', 'MongoDB'],
    modules: ['Dashboard', 'CRM', 'Clientes', 'Leads', 'Financeiro', 'Usuários', 'APIs'],
    link: { href: 'https://github.com/alexfullstack-web', label: 'Ver no GitHub' },
  },
  {
    id: 'alex-sousa-tech',
    mission: 'Missão 02',
    tag: 'Site da empresa',
    title: 'Alex Sousa Tech',
    desc: 'Site institucional da minha empresa, apresentando os serviços de desenvolvimento web, apps, SaaS e automação que ofereço, do front-end à IA.',
    stack: ['HTML', 'CSS', 'JavaScript', 'Node.js'],
    image: { src: 'img/site/alexsousatech-preview.webp', alt: 'Página inicial do site Alex Sousa Tech', w: 1348, h: 643 },
    link: { href: 'https://alexsousatech.vercel.app/', label: 'Visitar site' },
  },
  {
    id: 'mariana-ia',
    mission: 'Missão 03',
    tag: 'Assistente de atendimento',
    title: 'Mariana IA',
    desc: 'Assistente de suporte e atendimento integrada a sistemas web, feita para responder dúvidas e acompanhar solicitações de usuários em tempo real.',
    stack: ['Node.js', 'Express', 'API de IA', 'MongoDB'],
    image: { src: 'img/site/mariana-ia.webp', alt: 'Mariana IA — assistente de suporte e atendimento', w: 900, h: 900 },
    link: { href: '#contato', label: 'Saiba mais', ghost: true },
  },
];

export const TIMELINE = [
  {
    date: '2026 — Atualmente',
    role: 'Desenvolvedor Full Stack',
    desc: 'Desenvolvimento de sistemas web completos — frontend, API, autenticação e banco de dados — com HTML, CSS, JavaScript, React, Node.js, Express, JWT, bcrypt, Prisma e MongoDB. Projetos de referência: ERP Alex Sousa e Mariana IA.',
  },
];

/*
  Etapas da missão do foguete (Terra → Lua).
  range: fração do scroll da seção em que a etapa fica ativa.
  code: linhas com tokens [texto, tipo] para o painel de código.
*/
export const MISSION_STAGES = [
  {
    key: 'ignicao',
    label: 'IGNIÇÃO',
    title: 'Todo projeto começa na base de lançamento',
    desc: 'Entendo o problema, defino o escopo e desenho a arquitetura antes da primeira linha de código.',
    chips: ['Requisitos', 'Escopo', 'Arquitetura'],
    file: 'missao.config.js',
    range: [0, 0.1],
    code: [
      [['const ', 'kw'], ['missao', 'var'], [' = {', 'p']],
      [['  cliente', 'prop'], [': ', 'p'], ["'sua empresa'", 'str'], [',', 'p']],
      [['  objetivo', 'prop'], [': ', 'p'], ["'sistema web completo'", 'str'], [',', 'p']],
      [['  etapas', 'prop'], [': [', 'p'], ["'front'", 'str'], [', ', 'p'], ["'back'", 'str'], [', ', 'p'], ["'dados'", 'str'], ['],', 'p']],
      [['  destino', 'prop'], [': ', 'p'], ["'🌕 produção'", 'str'], [',', 'p']],
      [['};', 'p']],
      [],
      [['await ', 'kw'], ['lancar', 'fn'], ['(missao);', 'p']],
    ],
  },
  {
    key: 'front',
    label: 'FRONT-END',
    title: 'Interfaces rápidas e responsivas',
    desc: 'Telas em React com componentes reutilizáveis, pensadas para desktop, tablet e celular.',
    chips: ['React', 'JavaScript', 'HTML5', 'CSS3'],
    file: 'Dashboard.jsx',
    range: [0.1, 0.22],
    code: [
      [['import ', 'kw'], ['{ useEffect, useState } ', 'var'], ['from ', 'kw'], ["'react'", 'str'], [';', 'p']],
      [],
      [['export default function ', 'kw'], ['Dashboard', 'fn'], ['() {', 'p']],
      [['  const ', 'kw'], ['[clientes, setClientes]', 'var'], [' = ', 'p'], ['useState', 'fn'], ['([]);', 'p']],
      [],
      [['  ', 'p'], ['useEffect', 'fn'], ['(() => {', 'p']],
      [['    ', 'p'], ['api', 'var'], ['.', 'p'], ['get', 'fn'], ["('/clientes')", 'str'], ['.', 'p'], ['then', 'fn'], ['(setClientes);', 'p']],
      [['  }, []);', 'p']],
      [],
      [['  return ', 'kw'], ['<', 'p'], ['ListaClientes ', 'tag'], ['dados', 'prop'], ['={clientes} />;', 'p']],
      [['}', 'p']],
    ],
  },
  {
    key: 'back',
    label: 'BACK-END',
    title: 'Servidores seguros em Node.js',
    desc: 'APIs com Express, autenticação JWT e senhas protegidas com bcrypt.',
    chips: ['Node.js', 'Express', 'JWT', 'bcrypt'],
    file: 'auth.routes.js',
    range: [0.22, 0.34],
    code: [
      [['router', 'var'], ['.', 'p'], ['post', 'fn'], ["('/login'", 'str'], [', ', 'p'], ['async ', 'kw'], ['(req, res) => {', 'p']],
      [['  const ', 'kw'], ['{ email, senha }', 'var'], [' = req.body;', 'p']],
      [['  const ', 'kw'], ['usuario', 'var'], [' = ', 'p'], ['await ', 'kw'], ['prisma.usuario.', 'var'], ['findUnique', 'fn'], ['({', 'p']],
      [['    where', 'prop'], [': { email },', 'p']],
      [['  });', 'p']],
      [],
      [['  const ', 'kw'], ['ok', 'var'], [' = ', 'p'], ['await ', 'kw'], ['bcrypt.', 'var'], ['compare', 'fn'], ['(senha, usuario.senha);', 'p']],
      [['  if ', 'kw'], ['(!ok) ', 'p'], ['return ', 'kw'], ['res.', 'var'], ['status', 'fn'], ['(401).', 'p'], ['end', 'fn'], ['();', 'p']],
      [],
      [['  const ', 'kw'], ['token', 'var'], [' = jwt.', 'p'], ['sign', 'fn'], ['({ id: usuario.id }, SECRET);', 'p']],
      [['  res.', 'p'], ['json', 'fn'], ['({ token });', 'p']],
      [['});', 'p']],
    ],
  },
  {
    key: 'apis',
    label: 'APIs',
    title: 'Sistemas que conversam entre si',
    desc: 'Rotas REST claras e integrações com serviços externos, documentadas e previsíveis.',
    chips: ['REST', 'JSON', 'Integrações'],
    file: 'clientes.routes.js',
    range: [0.34, 0.46],
    code: [
      [['const ', 'kw'], ['rotas', 'var'], [' = ', 'p'], ['Router', 'fn'], ['();', 'p']],
      [],
      [['rotas.', 'var'], ['get', 'fn'], ["('/clientes'", 'str'], [', autenticar, listar);', 'p']],
      [['rotas.', 'var'], ['post', 'fn'], ["('/clientes'", 'str'], [', autenticar, criar);', 'p']],
      [['rotas.', 'var'], ['put', 'fn'], ["('/clientes/:id'", 'str'], [', autenticar, atualizar);', 'p']],
      [['rotas.', 'var'], ['delete', 'fn'], ["('/clientes/:id'", 'str'], [', autenticar, remover);', 'p']],
      [],
      [['app.', 'var'], ['use', 'fn'], ["('/api/v1'", 'str'], [', rotas);', 'p']],
      [['// GET /api/v1/clientes → 200 OK', 'cm']],
    ],
  },
  {
    key: 'dados',
    label: 'BANCO DE DADOS',
    title: 'Dados bem modelados',
    desc: 'Modelagem com Prisma e MongoDB pensada para manutenção e crescimento.',
    chips: ['Prisma', 'MongoDB'],
    file: 'schema.prisma',
    range: [0.46, 0.58],
    code: [
      [['model ', 'kw'], ['Cliente ', 'tag'], ['{', 'p']],
      [['  id', 'prop'], ['        String   ', 'var'], ['@id @default(auto()) @map("_id")', 'fn']],
      [['  nome', 'prop'], ['      String', 'var']],
      [['  email', 'prop'], ['     String   ', 'var'], ['@unique', 'fn']],
      [['  projetos', 'prop'], ['  Projeto[]', 'var']],
      [['  criadoEm', 'prop'], ['  DateTime ', 'var'], ['@default(now())', 'fn']],
      [['}', 'p']],
      [],
      [['datasource ', 'kw'], ['db ', 'tag'], ['{', 'p']],
      [['  provider', 'prop'], [' = ', 'p'], ['"mongodb"', 'str']],
      [['}', 'p']],
    ],
  },
  {
    key: 'cloud',
    label: 'CLOUD',
    title: 'No ar, disponível 24 horas',
    desc: 'Deploy em nuvem com variáveis de ambiente, build otimizado e monitoramento.',
    chips: ['Deploy', 'Variáveis de ambiente', 'Build'],
    file: 'server.js',
    range: [0.58, 0.7],
    code: [
      [['import ', 'kw'], ['app ', 'var'], ['from ', 'kw'], ["'./app.js'", 'str'], [';', 'p']],
      [],
      [['const ', 'kw'], ['PORTA', 'var'], [' = process.env.PORT || ', 'p'], ['3000', 'num'], [';', 'p']],
      [],
      [['app.', 'var'], ['listen', 'fn'], ['(PORTA, () => {', 'p']],
      [['  console.', 'var'], ['log', 'fn'], ['(', 'p'], ['`🚀 online na porta ${PORTA}`', 'str'], [');', 'p']],
      [['});', 'p']],
      [],
      [['// $ npm run build && deploy', 'cm']],
      [['// ✓ produção atualizada', 'cm']],
    ],
  },
  {
    key: 'ia',
    label: 'IA',
    title: 'Inteligência artificial aplicada',
    desc: 'Assistentes como a Mariana IA, integrados ao sistema para atender usuários em tempo real.',
    chips: ['API de IA', 'Chatbots', 'Automação'],
    file: 'mariana.service.js',
    range: [0.7, 0.88],
    code: [
      [['export async function ', 'kw'], ['responder', 'fn'], ['(pergunta) {', 'p']],
      [['  const ', 'kw'], ['resposta', 'var'], [' = ', 'p'], ['await ', 'kw'], ['ia.', 'var'], ['gerar', 'fn'], ['({', 'p']],
      [['    sistema', 'prop'], [': ', 'p'], ["'Você é a Mariana, assistente.'", 'str'], [',', 'p']],
      [['    mensagem', 'prop'], [': pergunta,', 'p']],
      [['  });', 'p']],
      [],
      [['  await ', 'kw'], ['historico.', 'var'], ['salvar', 'fn'], ['({ pergunta, resposta });', 'p']],
      [['  return ', 'kw'], ['resposta;', 'p']],
      [['}', 'p']],
    ],
  },
  {
    key: 'lua',
    label: 'POUSO NA LUA',
    title: 'Missão cumprida: projeto no ar',
    desc: 'Do planejamento ao deploy, cada etapa entregue com qualidade. Qual é a próxima missão?',
    chips: ['Entrega', 'Suporte', 'Evolução'],
    file: 'resultado.log',
    range: [0.88, 1],
    code: [
      [['✓ ', 'ok'], ['front-end', 'var'], ['      pronto', 'cm']],
      [['✓ ', 'ok'], ['back-end', 'var'], ['       pronto', 'cm']],
      [['✓ ', 'ok'], ['apis', 'var'], ['           pronto', 'cm']],
      [['✓ ', 'ok'], ['banco de dados', 'var'], [' pronto', 'cm']],
      [['✓ ', 'ok'], ['cloud', 'var'], ['          pronto', 'cm']],
      [['✓ ', 'ok'], ['ia', 'var'], ['             pronto', 'cm']],
      [],
      [['🌕 pouso confirmado — ', 'str'], ['Alex Sousa Tech', 'tag']],
    ],
  },
];
