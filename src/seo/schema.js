// Dados estruturados (JSON-LD): a empresa é a entidade principal; o fundador aparece ligado a ela.
import { SITE_URL } from '../config.js';
import { CONTATO, SERVICOS } from '../data/empresa.js';
import { CAMINHO_SOBRE, DESCRICAO_PADRAO, FOTO_FUNDADOR, FUNDADOR, LOGO, MARCA, PROFISSAO, REDES_OFICIAIS, SLOGAN, urlAbsoluta } from './marca.js';

export const ID_ORGANIZACAO = `${SITE_URL}/#organizacao`;
export const ID_PESSOA = `${SITE_URL}/#alex-sousa`;
export const ID_WEBSITE = `${SITE_URL}/#website`;

export function entidadesGlobais() {
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
      email: CONTATO.email,
      contactPoint: [
        { '@type': 'ContactPoint', contactType: 'sales', email: CONTATO.email, telephone: `+${CONTATO.whatsapp}`, availableLanguage: 'Portuguese' },
      ],
      founder: { '@id': ID_PESSOA },
      areaServed: { '@type': 'Country', name: 'Brasil' },
      sameAs: REDES_OFICIAIS,
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

const pessoa = () => ({
  '@type': 'Person',
  '@id': ID_PESSOA,
  name: FUNDADOR,
  url: `${SITE_URL}${CAMINHO_SOBRE}`,
  jobTitle: PROFISSAO,
  image: FOTO_FUNDADOR,
  worksFor: { '@id': ID_ORGANIZACAO },
  sameAs: REDES_OFICIAIS,
});

export function entidadesSobre() {
  const url = `${SITE_URL}${CAMINHO_SOBRE}`;
  return [
    pessoa(),
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

export function entidadesServicos() {
  return [
    {
      '@type': 'ItemList',
      '@id': `${SITE_URL}/servicos#lista`,
      name: `Serviços da ${MARCA}`,
      itemListElement: SERVICOS.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'Service', name: s.nome, description: s.descricao, provider: { '@id': ID_ORGANIZACAO }, url: `${SITE_URL}/servicos#${s.id}` },
      })),
    },
  ];
}

const trilha = (itens) => ({
  '@type': 'BreadcrumbList',
  itemListElement: itens.map(([nome, caminho], i) => ({ '@type': 'ListItem', position: i + 1, name: nome, item: `${SITE_URL}${caminho}` })),
});

export const entidadesTrilha = (nome, caminho) => [trilha([['Início', '/'], [nome, caminho]])];

// Só usa o que está cadastrado no Gestão: sem clientes, notas ou resultados inventados.
export function entidadesProjeto(p) {
  const url = `${SITE_URL}/projetos/${p.slug}`;
  const imagens = [p.capa?.url, ...(p.galeria || []).map((g) => g.url)].filter(Boolean).map(urlAbsoluta);
  const obra = {
    '@type': 'CreativeWork',
    '@id': `${url}#projeto`,
    name: p.nome,
    description: p.resumo,
    url,
    inLanguage: 'pt-BR',
    creator: { '@id': ID_ORGANIZACAO },
    isPartOf: { '@id': ID_WEBSITE },
  };
  if (imagens.length) obra.image = [...new Set(imagens)];
  if (p.segmento) obra.genre = p.segmento;
  if (p.tecnologias?.length) obra.keywords = p.tecnologias.join(', ');
  if (p.conclusao) obra.dateCreated = p.conclusao;
  return [obra, trilha([['Início', '/'], ['Projetos', '/projetos'], [p.nome, `/projetos/${p.slug}`]])];
}
