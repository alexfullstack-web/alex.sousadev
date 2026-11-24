import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Eye, Handshake, Layers, MessagesSquare, RefreshCw, Send, Target } from 'lucide-react';
import CtaFinal from '../components/CtaFinal.jsx';
import HeroVisual from '../components/HeroVisual.jsx';
import Icone from '../components/Icone.jsx';
import Processo from '../components/Processo.jsx';
import Reveal from '../components/Reveal.jsx';
import Aviso from '../components/ui/Aviso.jsx';
import Cartao from '../components/ui/Cartao.jsx';
import { EsqueletoCartoes } from '../components/ui/Carregando.jsx';
import SecaoTopo from '../components/ui/SecaoTopo.jsx';
import { ALEX, DIFERENCIAIS, EMPRESA, SERVICOS, SOBRE_EMPRESA } from '../data/empresa.js';
import { plataformasDoPlano, precoPlano, usePlanos } from '../hooks/usePlanos.js';
import { useSeo } from '../hooks/useSeo.js';

// Planos reais do Gestão (nada fixo aqui).
function PlanosDestaque() {
  const { planos, erro, recarregar } = usePlanos();
  if (erro && !planos) {
    return (
      <Aviso tipo="alerta">
        <p>{erro}</p>
        <div>
          <button type="button" className="btn btn--contorno btn--p" onClick={recarregar}>
            <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
          </button>
        </div>
      </Aviso>
    );
  }
  if (!planos) return <EsqueletoCartoes rotulo="Carregando planos" />;
  if (!planos.length) return <p className="vazio">Os planos estão sendo preparados para publicação.</p>;
  return (
    <ul className="grade grade--3">
      {planos.slice(0, 6).map((p, i) => (
        <Reveal as="li" key={p.id} style={{ '--atraso': `${(i % 3) * 80}ms` }}>
          <Cartao className="cartao--plano" para="/planos" rotuloLink={`Plano ${p.name}: ver planos`}>
            <div className="plano-mini__topo">
              <span className="icone-caixa">
                <Layers size={22} strokeWidth={1.75} aria-hidden="true" />
              </span>
              {p.trialDays > 0 && <span className="selo selo--ok">{p.trialDays} dias de teste</span>}
            </div>
            <h3>{p.name}</h3>
            <p className="plano-mini__preco num">{precoPlano(p)}</p>
            <p>Inclui {plataformasDoPlano(p)}.</p>
            <span className="cartao__rodape">
              <span className="cartao__seta">
                Ver plano <ArrowRight size={15} aria-hidden="true" />
              </span>
            </span>
          </Cartao>
        </Reveal>
      ))}
    </ul>
  );
}

const PILARES = [
  { icone: Target, titulo: 'Proposta de valor', texto: SOBRE_EMPRESA.proposta },
  { icone: Compass, titulo: 'Missão', texto: SOBRE_EMPRESA.missao },
  { icone: Handshake, titulo: 'Como trabalhamos', texto: SOBRE_EMPRESA.comoTrabalha },
];

export default function Home() {
  useSeo({ caminho: '/' });
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="hero" aria-labelledby="hero-titulo">
        <div className="hero__texto">
          <p className="hero__marca">
            <span className="hero__marca-logo">
              <img src="/img/site/logo-as.webp" alt="" width="240" height="141" fetchPriority="high" />
            </span>
            <span className="hero__marca-nome">
              {EMPRESA.nome}
              <small>{EMPRESA.slogan}</small>
            </span>
          </p>
          <h1 id="hero-titulo" className="hero__titulo">
            Transformamos ideias em <span className="texto-gradiente">soluções digitais</span>.
          </h1>
          <p className="hero__sub">Desenvolvemos sites, sistemas personalizados, lojas virtuais e soluções tecnológicas para ajudar empresas a crescer no digital.</p>
          <div className="hero__acoes">
            <Link to="/servicos" className="btn btn--contorno btn--g">
              <Eye size={18} aria-hidden="true" /> Conhecer serviços
            </Link>
            <Link to="/orcamento" className="btn btn--primario btn--g">
              Solicitar orçamento <ArrowRight size={18} className="btn__seta" aria-hidden="true" />
            </Link>
          </div>
          <ul className="hero__garantias">
            <li>
              <Icone nome="puzzle" size={17} /> Projetos sob medida
            </li>
            <li>
              <MessagesSquare size={17} strokeWidth={1.75} aria-hidden="true" /> Conversa direta
            </li>
            <li>
              <Icone nome="life-buoy" size={17} /> Suporte e manutenção
            </li>
          </ul>
        </div>
        <HeroVisual />
        <a href="#empresa" className="hero__rolar" aria-label="Ir para a apresentação da empresa">
          <span />
        </a>
      </section>

      {/* ------------------------------------------------------- Apresentação */}
      <section id="empresa" className="secao apresentacao" aria-labelledby="empresa-titulo">
        <div className="apresentacao__grade">
          <div className="apresentacao__texto">
            <SecaoTopo
              id="empresa-titulo"
              rotulo="A empresa"
              titulo="Tecnologia feita para o seu negócio"
              texto={EMPRESA.posicionamento}
              acao={
                <Link to="/empresa" className="link-seta">
                  Conheça a empresa <ArrowRight size={16} aria-hidden="true" />
                </Link>
              }
            />
          </div>
          <ul className="apresentacao__pilares">
            {PILARES.map(({ icone: I, titulo, texto }, i) => (
              <Reveal as="li" key={titulo} style={{ '--atraso': `${i * 90}ms` }}>
                <Cartao interativo className="pilar">
                  <span className={`icone-caixa icone-caixa--p${i === 1 ? ' icone-caixa--verde' : ''}`}>
                    <I size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>{titulo}</h3>
                    <p>{texto}</p>
                  </div>
                </Cartao>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ----------------------------------------------------------- Serviços */}
      <section id="servicos" className="secao" aria-labelledby="servicos-titulo">
        <SecaoTopo
          id="servicos-titulo"
          rotulo="Serviços"
          titulo="Soluções digitais completas"
          texto="Do site institucional ao sistema sob medida, com o mesmo cuidado em design, código e segurança."
          acao={
            <Link to="/servicos" className="link-seta">
              Ver todos os serviços <ArrowRight size={16} aria-hidden="true" />
            </Link>
          }
        />
        <ul className="grade grade--3">
          {SERVICOS.map((s, i) => (
            <Reveal as="li" key={s.id} style={{ '--atraso': `${(i % 3) * 80}ms` }}>
              <Cartao para={`/servicos#${s.id}`} rotuloLink={`${s.nome}: saiba mais`}>
                <span className="icone-caixa">
                  <Icone nome={s.icone} />
                </span>
                <h3>{s.nome}</h3>
                <p>{s.descricao}</p>
                <span className="cartao__rodape">
                  <span className="cartao__seta">
                    Saiba mais <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </span>
              </Cartao>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------ Plataformas (planos) */}
      <section id="plataformas" className="secao" aria-labelledby="plataformas-titulo">
        <SecaoTopo
          id="plataformas-titulo"
          rotulo="Assinaturas"
          titulo="Plataformas por assinatura"
          texto="Sistemas prontos da Alex Sousa Tech para usar no dia a dia, com planos e acesso pela área do cliente."
          acao={
            <Link to="/planos" className="link-seta">
              Ver planos <ArrowRight size={16} aria-hidden="true" />
            </Link>
          }
        />
        <PlanosDestaque />
      </section>

      {/* -------------------------------------------------------- Diferenciais */}
      <section id="diferenciais" className="secao" aria-labelledby="diferenciais-titulo">
        <SecaoTopo id="diferenciais-titulo" rotulo="Diferenciais" titulo="Por que a Alex Sousa Tech" texto="O que você encontra em todo projeto, do primeiro contato à entrega." centro />
        <ul className="grade grade--3">
          {DIFERENCIAIS.map((d, i) => (
            <Reveal as="li" key={d.titulo} style={{ '--atraso': `${(i % 3) * 80}ms` }}>
              <Cartao interativo className="diferencial">
                <span className="icone-caixa icone-caixa--verde">
                  <Icone nome={d.icone} />
                </span>
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
              </Cartao>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ----------------------------------------------------------- Processo */}
      <section id="como-funciona" className="secao" aria-labelledby="processo-titulo">
        <SecaoTopo id="processo-titulo" rotulo="Processo" titulo="Como funciona nosso trabalho" texto="Um caminho claro, com você acompanhando cada etapa." />
        <Processo />
      </section>

      {/* -------------------------------------------------------- Tecnologias */}
      <section id="tecnologias" className="secao" aria-labelledby="tecnologias-titulo">
        <SecaoTopo id="tecnologias-titulo" rotulo="Tecnologias" titulo="Ferramentas modernas, código sólido" texto="As tecnologias usadas no dia a dia para construir os projetos da empresa." centro />
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
        <Reveal className="tecnologias__cta">
          <Link to="/orcamento" className="btn btn--primario">
            <Send size={17} aria-hidden="true" /> Começar um projeto
          </Link>
        </Reveal>
      </section>

      <CtaFinal />
    </>
  );
}
