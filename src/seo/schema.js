// Dados estruturados (JSON-LD): quem é a marca, quem é o fundador e como as páginas se ligam a eles.
import { SITE_URL } from '../config.js';
import { CAMINHO_SOBRE, DESCRICAO_PADRAO, FOTO_FUNDADOR, FUNDADOR, LOGO, MARCA, PROFISSAO, SLOGAN, redesOficiais, urlAbsoluta } from './marca.js';

export const ID_ORGANIZACAO = `${SITE_URL}/#organizacao`;
export const ID_PESSOA = `${SITE_URL}/#alex-sousa`;
export const ID_WEBSITE = `${SITE_URL}/#website`;

export function entidadesGlobais(dados) {
  const sameAs = redesOficiais(dados);
  const redes = sameAs.length ? { sameAs } : {};
  return [
    {
      '@type': 'Organization',
      '@id': ID_ORGANIZACAO,
      name: MARCA,
      url: `${SITE_URL}/`,
      slogan: SLOGAN,
      description: DESCRICAO_PADRAO,
      logo: { '@type': 'ImageObject', url: LOGO.url, width: LOGO.largura, height: LOGO.altura },
      image: LOGO.url,
      founder: { '@id': ID_PESSOA },
      areaServed: { '@type': 'Country', name: 'Brasil' },
      ...redes,
    },
    {
      '@type': 'Person',
      '@id': ID_PESSOA,
      name: FUNDADOR,
      url: `${SITE_URL}${CAMINHO_SOBRE}`,
      jobTitle: PROFISSAO,
      image: FOTO_FUNDADOR,
      worksFor: { '@id': ID_ORGANIZACAO },
      ...redes,
    },
    {
      '@type': 'WebSite',
      '@id': ID_WEBSITE,
      name: MARCA,
      url: `${SITE_URL}/`,
      inLanguage: 'pt-BR',
      publisher: { '@id': ID_ORGANIZACAO },
    },
  ];
}

export function entidadesSobre() {
  const url = `${SITE_URL}${CAMINHO_SOBRE}`;
  return [
    {
      '@type': 'ProfilePage',
      '@id': `${url}#pagina`,
      url,
      name: `Sobre ${FUNDADOR}, fundador da ${MARCA}`,
      inLanguage: 'pt-BR',
      isPartOf: { '@id': ID_WEBSITE },
      mainEntity: { '@id': ID_PESSOA },
    },
  ];
}

// Só usa o que está cadastrado no projeto: sem clientes, notas ou resultados inventados.
export function entidadesProjeto(p, slug) {
  const url = `${SITE_URL}/projetos/${slug}`;
  const imagens = [p.capaUrl, ...(p.galeria || [])].filter(Boolean).map(urlAbsoluta);
  const obra = {
    '@type': 'CreativeWork',
    '@id': `${url}#projeto`,
    name: p.nome,
    description: p.resumo,
    url,
    inLanguage: 'pt-BR',
    creator: { '@id': ID_PESSOA },
    publisher: { '@id': ID_ORGANIZACAO },
    isPartOf: { '@id': ID_WEBSITE },
  };
  if (imagens.length) obra.image = [...new Set(imagens)];
  if (p.categoriaRotulo) obra.genre = p.categoriaRotulo;
  if (p.tecnologias?.length) obra.keywords = p.tecnologias.join(', ');
  if (p.dataConclusao) obra.dateCreated = String(p.dataConclusao).slice(0, 10);
  return [
    obra,
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Projetos', item: `${SITE_URL}/projetos` },
        { '@type': 'ListItem', position: 3, name: p.nome, item: url },
      ],
    },
  ];
}
