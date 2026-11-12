# Relatório — Reformulação do site oficial Alex Sousa Tech

**Data**: 11/11/2026 · **Situação**: pronto e testado no ambiente local. **Não houve deploy**: o site em produção continua o anterior até você publicar.

## Diagnóstico do site anterior

- **Identidade de portfólio pessoal**: o site se apresentava como o portfólio de Alex Sousa, com tema espacial (fundo de estrelas, Lua, pôster), a fonte Chakra Petch e seções de "missão" e "jornada".
- **Dependia do Business OS**, outro sistema: dados do site, projetos, formulário, acompanhamento de pedidos por protocolo (`QuoteStatus`) e o assistente **João Pedro IA**.
- **Projetos escritos no código** (9) e imagens soltas em `public/`, sem um lugar único de manutenção.
- **Segurança**: o arquivo `.env` estava versionado no git. Ele só tinha valores públicos (`VITE_...`). Revisei o histórico e não encontrei chave, token ou senha.
- **Pontos fortes mantidos**: React + Vite + React Router, pré-renderização das páginas para SEO, sitemap dinâmico na Vercel, Turnstile, aviso de privacidade, botão de WhatsApp e animações leves.

## Mudanças realizadas

**Identidade**
- Site institucional da **empresa**. Slogan "Desenvolvimento • Tecnologia • Inovação" e logo oficial.
- **Paleta**: azul-marinho, preto, azul elétrico, azul luminoso, branco e cinza.
- **Fontes**: Sora nos títulos e Manrope no texto.
- **Imagem de compartilhamento nova**: `public/img/og-empresa.jpg`, 1200×630, com o logo oficial.

**Páginas e rotas**: `/`, `/empresa`, `/sobre-alex-sousa`, `/servicos`, `/projetos`, `/projetos/:slug`, `/orcamento`, `/contato`, `/privacidade` e página de não encontrado.

- **Início**:
  - topo "Transformamos ideias em soluções digitais." com os botões "Solicitar orçamento" e "Conhecer nossos serviços";
  - ilustração ideia → código → produto;
  - empresa, os 9 serviços, projetos em destaque, processo em 5 etapas, 6 diferenciais e chamada final.
- **Serviços**: cada um dos 9 com ícone, descrição, benefício e botão de orçamento, que já abre o formulário com o tipo escolhido.
- **Projetos**:
  - só os **reais**, vindos do Gestão;
  - a página de cada projeto mostra a necessidade, a solução, as tecnologias, a galeria e o link de demonstração quando houver.
- **Sobre Alex Sousa**: só a experiência real, com o texto, as áreas e as tecnologias fornecidas e as fotos dele. Nenhuma certificação, ano ou número inventado.
- **Orçamento**: formulário completo, ligado ao Atendimento do Gestão (detalhes abaixo).
- **Contato**: WhatsApp, e-mail, Instagram e GitHub reais.
- **Cabeçalho**:
  - Início, Empresa, Sobre, Serviços, Projetos, Contato e o botão "Solicitar orçamento";
  - fica sólido ao rolar;
  - no celular, o menu prende o foco do teclado e fecha com Esc.
- **Rodapé** conforme a especificação.

**Integração com o Gestão**
- **Projetos**:
  - lidos pelo servidor da Vercel com uma chave secreta (`api/portfolio`);
  - o navegador nunca vê a chave;
  - publicar, editar, reordenar ou despublicar no Gestão aparece no site sem novo deploy, em até 5 minutos.
- **Orçamento**:
  - envia para o Atendimento do Gestão, com empresa, faixa de investimento, prazo, forma de contato preferida e aceite da política de privacidade;
  - mostra o erro de cada campo vindo da API;
  - a confirmação só aparece depois do registro;
  - depois, oferece o WhatsApp com o resumo pronto.

**SEO**
- **Título, descrição e canonical** próprios por página, com Open Graph e Twitter.
- **Schema.org**: `Organization`, `WebSite`, `ProfilePage` + `Person`, `ItemList` de `Service`, `CreativeWork` e `BreadcrumbList`.
- **Sitemap dinâmico** com as 8 páginas fixas e os projetos publicados, mais o `robots.txt`.
- **Pré-renderização mantida**.

**Movimento e acessibilidade**
- Animações curtas de entrada e a ilustração do topo; nada se move com `prefers-reduced-motion`.
- Link "Pular para o conteúdo", foco visível e textos alternativos.

## Arquivos

**Criados**
- `api/_gestao.js`, `api/portfolio/index.js`, `api/portfolio/[slug].js`
- `src/data/empresa.js`, `src/lib/gestao.js`, `src/hooks/useProjetos.js`
- `src/components/Header.jsx`, `HeroVisual.jsx`, `PaginaTopo.jsx`, `Processo.jsx`, `CtaFinal.jsx`
- `src/pages/Empresa.jsx`, `Servicos.jsx`, `Contato.jsx`
- `public/img/og-empresa.jpg`, `docs/RELATORIO-REFORMULACAO.md`

**Modificados**
- `README.md`, `docs/SEO.md`, `.env.example`, `.gitignore`, `package.json`, `package-lock.json`
- `index.html`, `public/manifest.webmanifest`, `vite.config.js`
- `api/_sitemap.js`, `api/sitemap.js`, `scripts/prerender.mjs`
- `src/App.jsx`, `main.jsx`, `config.js`, `hooks/useSeo.js`, `seo/cabecalho.js`, `seo/marca.js`, `seo/schema.js`
- **Componentes**: `Footer`, `Icone`, `Logo`, `ProjectCard`, `QuoteForm`, `TechBackground` e `WhatsAppFloat`.
- **Páginas**: `Home`, `SobreAlexSousa`, `Projetos`, `Projeto`, `Orcamento`, `Privacidade` (trecho do João Pedro retirado) e `NaoEncontrado`.
- **Estilos**: `styles/base.css` e `styles/site.css`.

**Removidos**: 90 arquivos.
- **Componentes**:
  - **João Pedro IA**: `JoaoPedro.jsx` e o texto dele na política de privacidade;
  - `QuoteStatus`, `Sections`, `CodePanel`, `SpaceBackground`, `Orcamento`, `LoadingScreen`, `Navbar`.
- **Pastas e dados antigos**: `src/hero/`, `src/mission/`, `src/journey/`, `src/context/`, `src/data/site.js`, `src/api.js`, `src/lib/api.js`, os estilos antigos, `public/css` e `public/js`.
- **Imagens sem uso**: espaço, Lua, pôster, logos antigos, prévias e as imagens dos projetos. As imagens dos projetos foram para o Gestão e são servidas por ele.
- **Legado do Business OS**: `public/sitemap.xml` estático e desatualizado, e `scripts/gerar-sitemap.mjs`, que não era usado.
- **Configuração**: o `.env` saiu do git, continua no seu computador e agora está no `.gitignore`.
- **Dependências**: `axios` e `@fontsource/chakra-petch` (removidas); `@fontsource/sora` (adicionada).

## Funcionalidades preservadas

- Stack: React, JavaScript, Vite, React Router e CSS.
- Pré-renderização com hidratação, sitemap dinâmico, redirecionamento do domínio `.vercel.app` e cabeçalhos de segurança da Vercel.
- Turnstile opcional, campo-armadilha e tempo mínimo no formulário.
- Botão flutuante de WhatsApp, política de privacidade e fundo animado leve (canvas).
- **Recursos de IA**: só o João Pedro IA foi removido, como pedido. O projeto **Mariana IA** continua no portfólio, e "Integrações e IA" é um dos serviços.

## Testes realizados (ambiente local, Gestão e site rodando juntos)

| Teste | Resultado |
|-------|-----------|
| Build + pré-renderização | 9 páginas fixas e 9 projetos gerados, sem erros |
| Rotas | Todas respondem 200 com título correto; slug inexistente dá "não encontrada" com `noindex` |
| Links internos | 26 conferidos, todos 200 |
| Formulário | Validação dos 7 obrigatórios, foco no primeiro erro, máscara do WhatsApp, tipo pré-selecionado, envio real gravado no Gestão com todos os detalhes, envio de robô não gravado |
| Integração | Ordem, despublicação, projeto novo, galeria e textos novos aparecem sem rebuild; chave trocada → 502 e recuperação com a chave nova |
| Celular (390 px) | Sem rolagem horizontal em 8 rotas; menu com foco preso e Esc |
| Desktop (1440 px) | Sem rolagem horizontal em todas as páginas |
| Animações | Regras de `prefers-reduced-motion` aplicadas no CSS e nos componentes animados |
| Console | Nenhum erro de JavaScript |
| João Pedro IA / Business OS | Nenhuma ocorrência no código-fonte nem no build |
| Identidade de portfólio pessoal | Nenhuma página com "portfólio pessoal"; títulos e Schema.org são da empresa |
| SEO | Canonical, Open Graph e JSON-LD em todas as páginas; sitemap reserva com 17 endereços; robots com o sitemap |
| Segredos | A chave não aparece em nenhum arquivo do projeto nem no build; `.env*` fora do git e do pacote |

**Não testado aqui**: o deploy na Vercel, o domínio real, o Turnstile real (precisa das chaves da Cloudflare), Lighthouse ou PageSpeed, e leitores de tela reais.

## Pendências

1. Configurar as variáveis na Vercel e no Render e gerar a chave no Gestão (passo a passo no `README.md`).
2. Confirmar se os 6 sites de clientes do portfólio (Maison Élan, Clínica Odontológica, Valença Moraes, Doce Neve, Brasa Burger e Serralheria) são trabalhos para clientes reais. Se forem modelos de demonstração, ajuste os textos no Gestão ou despublique antes de ir ao ar.
3. **Acompanhamento de pedido por protocolo** foi retirado junto com o Business OS. O Gestão ainda não tem essa função; se quiser, ela pode entrar numa fase futura.
4. Endereço oficial: `site.alexsousatech.com.br` (atualizado em 12/11/2026). O antigo `portfolio.` redireciona para ele, se ainda estiver ligado ao projeto na Vercel.
5. O backend do Business OS não é mais usado pelo site. Pode ser desligado quando você quiser.
