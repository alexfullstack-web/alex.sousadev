import { Link } from 'react-router-dom';
import { ArrowRight, Github, Instagram } from 'lucide-react';
import CtaFinal from '../components/CtaFinal.jsx';
import Icone from '../components/Icone.jsx';
import Reveal from '../components/Reveal.jsx';
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
          <p className="sobre-topo__marca">{EMPRESA.nome}</p>
          <h1>{ALEX.nome}</h1>
          <p className="sobre-topo__cargo">{ALEX.cargo}</p>
          <p className="sobre-topo__apresentacao">{ALEX.apresentacao}</p>
          <div className="sobre-topo__redes">
            <a href={CONTATO.github} target="_blank" rel="noopener noreferrer" className="botao botao--contorno botao--p">
              <Github size={17} aria-hidden="true" /> GitHub
            </a>
            <a href={CONTATO.instagram} target="_blank" rel="noopener noreferrer" className="botao botao--contorno botao--p">
              <Instagram size={17} aria-hidden="true" /> Instagram
            </a>
          </div>
        </Reveal>
        <Reveal className="sobre-topo__foto" style={{ '--atraso': '120ms' }}>
          <picture>
            <source media="(max-width: 699px)" srcSet="/img/site/alex-sm.webp" />
            <img src="/img/site/alex.webp" alt="Alex Sousa, desenvolvedor Full Stack e fundador da Alex Sousa Tech" width="760" height="1128" fetchPriority="high" />
          </picture>
        </Reveal>
      </header>

      <section className="secao" aria-labelledby="areas-titulo">
        <Reveal className="secao__topo">
          <div>
            <h2 id="areas-titulo">Áreas de atuação</h2>
            <p className="secao__texto">Do código à bancada: desenvolvimento de software, design e conhecimentos técnicos em eletrônica e áudio.</p>
          </div>
        </Reveal>
        <ul className="areas">
          {ALEX.areas.map((a, i) => (
            <Reveal as="li" key={a.titulo} className="area" style={{ '--atraso': `${(i % 3) * 60}ms` }}>
              <Icone nome={a.icone} size={20} />
              <span>{a.titulo}</span>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="secao" aria-labelledby="tec-titulo">
        <Reveal className="tecnologias">
          <div>
            <h2 id="tec-titulo">Tecnologias do meu trabalho e estudo</h2>
            <p className="secao__texto">As ferramentas que uso no dia a dia para construir os projetos da {EMPRESA.nome}.</p>
          </div>
          <ul className="tecnologias__lista">
            {ALEX.tecnologias.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="secao" aria-labelledby="empresa-link-titulo">
        <Reveal className="sobre-empresa">
          <h2 id="empresa-link-titulo">A Alex Sousa Tech</h2>
          <p>A empresa reúne esse conhecimento em soluções digitais para outros negócios: sites, sistemas, lojas virtuais e ferramentas sob medida.</p>
          <Link to="/empresa" className="link-seta">
            Conheça a empresa <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Reveal>
      </section>

      <CtaFinal titulo="Tem um projeto em mente?" />
    </>
  );
}
