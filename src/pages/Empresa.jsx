import { Link } from 'react-router-dom';
import { ArrowRight, Compass, CreditCard, Handshake, Send, Target } from 'lucide-react';
import CtaFinal from '../components/CtaFinal.jsx';
import Icone from '../components/Icone.jsx';
import PaginaTopo from '../components/PaginaTopo.jsx';
import Processo from '../components/Processo.jsx';
import Reveal from '../components/Reveal.jsx';
import Cartao from '../components/ui/Cartao.jsx';
import SecaoTopo from '../components/ui/SecaoTopo.jsx';
import { DIFERENCIAIS, EMPRESA, SOBRE_EMPRESA } from '../data/empresa.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesTrilha } from '../seo/schema.js';

const BLOCOS = [
  { icone: Target, titulo: 'Proposta de valor', texto: SOBRE_EMPRESA.proposta, destaque: true },
  { icone: Compass, titulo: 'Missão', texto: SOBRE_EMPRESA.missao },
  { icone: Handshake, titulo: 'Como trabalhamos', texto: SOBRE_EMPRESA.comoTrabalha },
];

export default function Empresa() {
  useSeo({
    titulo: 'Empresa',
    descricao: 'Conheça a Alex Sousa Tech: proposta de valor, missão e a forma como desenvolvemos soluções digitais personalizadas para empresas e empreendedores.',
    caminho: '/empresa',
    entidades: entidadesTrilha('Empresa', '/empresa'),
  });
  return (
    <>
      <PaginaTopo trilha="Empresa" rotulo={EMPRESA.slogan} titulo="Sobre a" destaque="Alex Sousa Tech" texto={EMPRESA.posicionamento}>
        <Link to="/orcamento" className="btn btn--primario">
          <Send size={18} aria-hidden="true" /> Solicitar orçamento
        </Link>
        <Link to="/planos" className="btn btn--contorno">
          <CreditCard size={18} aria-hidden="true" /> Ver planos
        </Link>
      </PaginaTopo>

      <section className="secao secao--colada" aria-labelledby="proposta-titulo">
        <ul className="empresa-blocos">
          {BLOCOS.map(({ icone: I, titulo, texto, destaque }, i) => (
            <Reveal as="li" key={titulo} className={destaque ? 'empresa-blocos__destaque' : undefined} style={{ '--atraso': `${i * 90}ms` }}>
              <Cartao interativo destaque={destaque}>
                <span className={`icone-caixa${i === 1 ? ' icone-caixa--verde' : ''}`}>
                  <I size={22} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h2 id={i === 0 ? 'proposta-titulo' : undefined} className="empresa-blocos__titulo">
                  {titulo}
                </h2>
                <p>{texto}</p>
              </Cartao>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="secao" aria-labelledby="etapas-titulo">
        <SecaoTopo id="etapas-titulo" rotulo="Processo" titulo="Etapas de cada projeto" texto="Do primeiro contato à entrega, você sabe o que está sendo feito e por quê." />
        <Processo />
      </section>

      <section className="secao" aria-labelledby="dif-titulo">
        <SecaoTopo
          id="dif-titulo"
          rotulo="Diferenciais"
          titulo="O que nos diferencia"
          acao={
            <Link to="/sobre-alex-sousa" className="link-seta">
              Quem está por trás da empresa <ArrowRight size={16} aria-hidden="true" />
            </Link>
          }
        />
        <ul className="grade grade--3">
          {DIFERENCIAIS.map((d, i) => (
            <Reveal as="li" key={d.titulo} style={{ '--atraso': `${(i % 3) * 80}ms` }}>
              <Cartao interativo>
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

      <CtaFinal />
    </>
  );
}
