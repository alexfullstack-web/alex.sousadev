# Site comercial — planos no lugar da vitrine de projetos

Data: 19/11/2026. Regra principal: **não alterar o design**. Mudanças visuais autorizadas: (1) menu "Projetos" → "Planos"; (2) na página inicial, a seção "Projetos e soluções desenvolvidas" vira "Plataformas por assinatura", com os componentes existentes; (3) rodapé "Projetos" → "Planos".

## O que mudou

- **`/planos`** (nova): planos e plataformas reais do Gestão (`/customer/catalog`), montada com `PaginaTopo`, a lista da página Serviços (`servicos-lista` / `servico-linha`), os cartões `servicos-grade` / `servico`, `CtaFinal` e os botões `botao`. Carregamento, erro e vazio usam `projeto--esqueleto`, `aviso` e `vazio`, que já existiam.
- **Página inicial**: seção "Plataformas por assinatura" com os planos nos mesmos cartões da seção Serviços.
- **Menu e rodapé**: os dois usam a lista `NAV` (`src/data/empresa.js`); a troca foi de um item.
- **Contratar**: leva a `/conta?aba=assinaturas`. Sem login, a aba é aberta depois do cadastro ou login.
- **Vitrine de projetos removida do site**: páginas `/projetos` e `/projetos/:slug`, `ProjectCard`, `useProjetos`, funções `api/portfolio`, projetos no build, no sitemap e nos dados estruturados. `/projetos` e `/projetos/:slug` redirecionam (308) para `/servicos`. Botões "Ver projetos" (Empresa e 404) e textos do João Pedro IA atualizados.
- **O Gestão não foi alterado**: módulo Portfólio e projetos no banco intactos.
- **`/api/status`** passa a verificar se o Gestão oferece os planos a este domínio (`CUSTOMER_ORIGINS`), no lugar da leitura do portfólio.
- **`GESTAO_SITE_KEY`** não é mais usada pelo site.

## Nenhum CSS novo

O CSS compilado é idêntico antes e depois (mesmo hash MD5).

## Comparação visual

24 capturas (12 páginas × computador 1440 px e celular 390 px), com animações paradas e o céu estrelado (aleatório) oculto nos dois lados. Duas séries do site antigo saíram 100% iguais, então qualquer diferença é real.

| Página | Diferença encontrada |
|---|---|
| Todas | Item do menu ("Planos") e link do rodapé ("Planos"). Como "Planos" é mais curto que "Projetos", os itens do menu ficam alguns pixels mais à direita; tamanho, cor, espaçamento entre itens e comportamento não mudaram. |
| Empresa | Botão "Ver projetos" → "Ver planos" |
| 404 | Texto e botão "Ver projetos" → "Ver serviços" |
| Início | A seção trocada. Escondendo essa seção nas duas versões, a página é idêntica pixel a pixel, exceto menu e rodapé. |
| Serviços, Sobre, Orçamento, Contato, Política, Termos, Entrar, Criar conta | Só menu e rodapé |

Observação: a seção nova tem altura fracionada (641,5 px no computador), então o conteúdo abaixo dela é desenhado meio pixel mais baixo e o texto fica levemente diferente na comparação pixel a pixel, sem diferença visível.

## Testes

- Novo roteiro no navegador (e2e15), **24/24**: menu, rodapé, seção da página inicial, `/planos` com dados reais (preço mudado no banco aparece na hora), plano não público oculto, contratar sem conta → cadastro → "Minhas assinaturas", contratação aguardando pagamento, redirecionamentos 308, `/api/portfolio` removido, sitemap, Portfólio preservado no banco, orçamento gravado no Gestão, páginas institucionais, aviso quando o Gestão está fora, nenhum erro de JavaScript.
- Regressão: área do cliente (e2e13) 31/31, assinaturas (e2e14) 37/37, páginas legais 19/19.
- `/api/status`: domínio autorizado → 200; domínio não autorizado → 503 com a variável a corrigir.

## Pendências

- **João Pedro IA**: o componente existe, mas não está montado em nenhuma página, nem nesta versão nem na publicada no GitHub. Só os textos dele foram atualizados. Ligá-lo mudaria o visual e depende do backend dele (Business OS); fica para quando você decidir.
- **Pagamentos (PIX e cartão) e histórico de pagamentos**: Fases 5 e 6, depois das credenciais do Mercado Pago.
