import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import CtaFinal from '../components/CtaFinal.jsx';
import HeroVisual from '../components/HeroVisual.jsx';
import Icone from '../components/Icone.jsx';
import Processo from '../components/Processo.jsx';
import Reveal from '../components/Reveal.jsx';
import { DIFERENCIAIS, EMPRESA, SERVICOS, SOBRE_EMPRESA } from '../data/empresa.js';
import { plataformasDoPlano, precoPlano, usePlanos } from '../hooks/usePlanos.js';
import { useSeo } from '../hooks/useSeo.js';

function Secao({ id, titulo, texto, acao, children, className = '' }) {
  return (
    <section id={id} className={`secao ${className}`} aria-labelledby={`${id}-titulo`}>
      <Reveal className="secao__topo">
        <div>
          <h2 id={`${id}-titulo`}>{titulo}</h2>
          {texto && <p className="secao__texto">{texto}</p>}
        </div>
        {acao}
      </Reveal>
      {children}
    </section>
  );
}

// Planos reais do Gestão, nos mesmos cartões da seção Serviços.
function PlanosDestaque() {
  const { planos, erro, recarregar } = usePlanos();
  if (erro && !planos) {
    return (
      <div className="aviso" role="alert">
        <p>{erro}</p>
        <button type="button" className="botao botao--contorno botao--p" onClick={recarregar}>
          <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
        </button>
      </div>
    );
  }
  if (!planos) {
    return (
      <div className="projetos-grade" aria-busy="true" aria-label="Carregando planos">
        {[0, 1, 2].map((i) => (
          <div key={i} className="projeto projeto--esqueleto" />
        ))}
      </div>
    );
  }
  if (!planos.length) return <p className="vazio">Os planos estão sendo preparados para publicação.</p>;
  return (
    <ul className="servicos-grade">
      {planos.slice(0, 6).map((p, i) => (
        <Reveal as="li" key={p.id} className="servico" style={{ '--atraso': `${(i % 3) * 70}ms` }}>
          <Link to="/planos" className="servico__link" aria-label={`Plano ${p.name}: ver planos`}>
            <span className="servico__icone">
              <Icone nome="layers" />
            </span>
            <h3>{p.name}</h3>
            <p>
              {precoPlano(p)}. Inclui {plataformasDoPlano(p)}.
            </p>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}

export default function Home() {
  useSeo({ caminho: '/' });
  return (
    <>
      <section className="hero" aria-labelledby="hero-titulo">
        <div className="hero__brilho" aria-hidden="true" />
        <div className="hero__texto">
          <p className="hero__marca">
            <img src="/img/site/logo-as.webp" alt="" width="240" height="141" />
            <span>
              {EMPRESA.nome}
              <small>{EMPRESA.slogan}</small>
            </span>
          </p>
          <h1 id="hero-titulo" className="hero__titulo">
            Transformamos ideias em soluções digitais.
          </h1>
          <p className="hero__sub">Desenvolvemos sites, sistemas personalizados, lojas virtuais e soluções tecnológicas para ajudar empresas a crescer no digital.</p>
          <div className="hero__acoes">
            <Link to="/orcamento" className="botao botao--primario botao--g">
              Solicitar orçamento
            </Link>
            <Link to="/servicos" className="botao botao--contorno botao--g">
              Conhecer nossos serviços
            </Link>
          </div>
        </div>
        <HeroVisual />
      </section>

      <Secao
        id="empresa"
        titulo="Tecnologia feita para o seu negócio"
        texto={SOBRE_EMPRESA.proposta}
        acao={
          <Link to="/empresa" className="link-seta">
            Conheça a empresa <ArrowRight size={16} aria-hidden="true" />
          </Link>
        }
      />

      <Secao
        id="servicos"
        titulo="Serviços"
        texto="Do site institucional ao sistema sob medida, com o mesmo cuidado em design, código e segurança."
        acao={
          <Link to="/servicos" className="link-seta">
            Ver todos os serviços <ArrowRight size={16} aria-hidden="true" />
          </Link>
        }
      >
        <ul className="servicos-grade">
          {SERVICOS.map((s, i) => (
            <Reveal as="li" key={s.id} className="servico" style={{ '--atraso': `${(i % 3) * 70}ms` }}>
              <Link to={`/servicos#${s.id}`} className="servico__link">
                <span className="servico__icone">
                  <Icone nome={s.icone} />
                </span>
                <h3>{s.nome}</h3>
                <p>{s.descricao}</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Secao>

      <Secao
        id="plataformas"
        titulo="Plataformas por assinatura"
        texto="Sistemas prontos da Alex Sousa Tech para usar no dia a dia, com planos e acesso pela área do cliente."
        acao={
          <Link to="/planos" className="link-seta">
            Ver planos <ArrowRight size={16} aria-hidden="true" />
          </Link>
        }
      >
        <PlanosDestaque />
      </Secao>

      <Secao id="como-funciona" titulo="Como funciona nosso trabalho" texto="Um caminho claro, com você acompanhando cada etapa.">
        <Processo />
      </Secao>

      <Secao id="diferenciais" titulo="Por que a Alex Sousa Tech">
        <ul className="diferenciais">
          {DIFERENCIAIS.map((d, i) => (
            <Reveal as="li" key={d.titulo} className="diferencial" style={{ '--atraso': `${(i % 3) * 70}ms` }}>
              <Icone nome={d.icone} size={22} />
              <h3>{d.titulo}</h3>
              <p>{d.texto}</p>
            </Reveal>
          ))}
        </ul>
      </Secao>

      <CtaFinal />
    </>
  );
}
