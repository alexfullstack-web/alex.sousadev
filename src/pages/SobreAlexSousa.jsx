import { Link } from 'react-router-dom';
import { ArrowRight, Github, Instagram, Send } from 'lucide-react';
import CtaFinal from '../components/CtaFinal.jsx';
import Icone from '../components/Icone.jsx';
import Reveal from '../components/Reveal.jsx';
import Cartao from '../components/ui/Cartao.jsx';
import SecaoTopo from '../components/ui/SecaoTopo.jsx';
import { ALEX, CONTATO, EMPRESA } from '../data/empresa.js';
import { useSeo } from '../hooks/useSeo.js';
import { CAMINHO_SOBRE, FOTO_FUNDADOR } from '../seo/marca.js';
import { entidadesSobre } from '../seo/schema.js';

// A apresentação pessoal fica concentrada aqui; no resto do site, a empresa é a protagonista.
export default function SobreAlexSousa() {
  useSeo({
    tituloCompleto: 'Sobre Alex Sousa, Desenvolvedor Full Stack | Alex Sousa Tech',
    descricao: 'Conheça Alex Sousa, desenvolvedor Full Stack e fundador da Alex Sousa Tech: áreas de atuação, tecnologias e perfil profissional.',
    caminho: CAMINHO_SOBRE,
    imagem: FOTO_FUNDADOR,
    imagemAlt: 'Alex Sousa, desenvolvedor Full Stack e fundador da Alex Sousa Tech',
    entidades: entidadesSobre(),
  });

  return (
    <>
      <header className="sobre-topo">
        <Reveal className="sobre-topo__texto">
          <span className="rotulo">Fundador · {EMPRESA.nome}</span>
          <h1>{ALEX.nome}</h1>
          <p className="sobre-topo__cargo">{ALEX.cargo}</p>
          <p className="sobre-topo__apresentacao">{ALEX.apresentacao}</p>
          <div className="sobre-topo__acoes">
            <a href={CONTATO.github} target="_blank" rel="noopener noreferrer" className="btn btn--contorno">
              <Github size={18} aria-hidden="true" /> GitHub
            </a>
            <a href={CONTATO.instagram} target="_blank" rel="noopener noreferrer" className="btn btn--contorno">
              <Instagram size={18} aria-hidden="true" /> Instagram
            </a>
            <Link to="/orcamento" className="btn btn--primario">
              <Send size={18} aria-hidden="true" /> Falar sobre um projeto
            </Link>
          </div>
        </Reveal>
        <Reveal className="sobre-topo__foto" style={{ '--atraso': '120ms' }}>
          <div className="sobre-topo__moldura">
            <span className="sobre-topo__anel" aria-hidden="true" />
            <picture>
              <source media="(max-width: 699px)" srcSet="/img/site/alex-sm.webp" />
              <img src="/img/site/alex.webp" alt="Alex Sousa, desenvolvedor Full Stack e fundador da Alex Sousa Tech" width="760" height="1128" fetchPriority="high" />
            </picture>
            <span className="sobre-topo__selo">
              <img src="/img/site/logo-as.webp" alt="" width="240" height="141" />
              Full Stack
            </span>
          </div>
        </Reveal>
      </header>

      <section className="secao" aria-labelledby="areas-titulo">
        <SecaoTopo id="areas-titulo" rotulo="Atuação" titulo="Áreas de atuação" texto="Do código à bancada: desenvolvimento de software, design e conhecimentos técnicos em eletrônica e áudio." />
        <ul className="grade grade--3 areas">
          {ALEX.areas.map((a, i) => (
            <Reveal as="li" key={a.titulo} style={{ '--atraso': `${(i % 3) * 70}ms` }}>
              <Cartao interativo className="area">
                <span className={`icone-caixa icone-caixa--p${i % 3 === 1 ? ' icone-caixa--verde' : ''}`}>
                  <Icone nome={a.icone} size={18} />
                </span>
                <h3>{a.titulo}</h3>
              </Cartao>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="secao" aria-labelledby="tec-titulo">
        <SecaoTopo id="tec-titulo" rotulo="Stack" titulo="Tecnologias do meu trabalho e estudo" texto={`As ferramentas que uso no dia a dia para construir os projetos da ${EMPRESA.nome}.`} centro />
        <Reveal className="tecnologias">
          <ul className="tecnologias__lista">
            {ALEX.tecnologias.map((t) => (
              <li key={t}>
                <span className="tecnologias__ponto" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="secao secao--estreita" aria-labelledby="empresa-link-titulo">
        <Reveal>
          <Cartao destaque className="sobre-empresa">
            <img src="/img/site/logo-as.webp" alt="" width="240" height="141" className="sobre-empresa__logo" />
            <h2 id="empresa-link-titulo">A Alex Sousa Tech</h2>
            <p>A empresa reúne esse conhecimento em soluções digitais para outros negócios: sites, sistemas, lojas virtuais e ferramentas sob medida.</p>
            <Link to="/empresa" className="link-seta">
              Conheça a empresa <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Cartao>
        </Reveal>
      </section>

      <CtaFinal titulo="Tem um projeto em mente?" />
    </>
  );
}
