import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CtaFinal from '../components/CtaFinal.jsx';
import Icone from '../components/Icone.jsx';
import PaginaTopo from '../components/PaginaTopo.jsx';
import Processo from '../components/Processo.jsx';
import Reveal from '../components/Reveal.jsx';
import { DIFERENCIAIS, EMPRESA, SOBRE_EMPRESA } from '../data/empresa.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesTrilha } from '../seo/schema.js';

export default function Empresa() {
  useSeo({
    titulo: 'Empresa',
    descricao: 'Conheça a Alex Sousa Tech: proposta de valor, missão e a forma como desenvolvemos soluções digitais personalizadas para empresas e empreendedores.',
    caminho: '/empresa',
    entidades: entidadesTrilha('Empresa', '/empresa'),
  });
  return (
    <>
      <PaginaTopo titulo="Sobre a Alex Sousa Tech" texto={EMPRESA.posicionamento}>
        <Link to="/orcamento" className="botao botao--primario">
          Solicitar orçamento
        </Link>
        <Link to="/projetos" className="botao botao--contorno">
          Ver projetos
        </Link>
      </PaginaTopo>

      <section className="secao" aria-labelledby="proposta-titulo">
        <div className="empresa-blocos">
          <Reveal className="empresa-bloco empresa-bloco--destaque">
            <h2 id="proposta-titulo">Proposta de valor</h2>
            <p>{SOBRE_EMPRESA.proposta}</p>
          </Reveal>
          <Reveal className="empresa-bloco" style={{ '--atraso': '80ms' }}>
            <h2>Missão</h2>
            <p>{SOBRE_EMPRESA.missao}</p>
          </Reveal>
          <Reveal className="empresa-bloco" style={{ '--atraso': '160ms' }}>
            <h2>Como trabalhamos</h2>
            <p>{SOBRE_EMPRESA.comoTrabalha}</p>
          </Reveal>
        </div>
      </section>

      <section className="secao" aria-labelledby="etapas-titulo">
        <Reveal className="secao__topo">
          <div>
            <h2 id="etapas-titulo">Etapas de cada projeto</h2>
            <p className="secao__texto">Do primeiro contato à entrega, você sabe o que está sendo feito e por quê.</p>
          </div>
        </Reveal>
        <Processo />
      </section>

      <section className="secao" aria-labelledby="dif-titulo">
        <Reveal className="secao__topo">
          <div>
            <h2 id="dif-titulo">Diferenciais</h2>
          </div>
          <Link to="/sobre-alex-sousa" className="link-seta">
            Quem está por trás da empresa <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Reveal>
        <ul className="diferenciais">
          {DIFERENCIAIS.map((d, i) => (
            <Reveal as="li" key={d.titulo} className="diferencial" style={{ '--atraso': `${(i % 3) * 70}ms` }}>
              <Icone nome={d.icone} size={22} />
              <h3>{d.titulo}</h3>
              <p>{d.texto}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <CtaFinal />
    </>
  );
}
