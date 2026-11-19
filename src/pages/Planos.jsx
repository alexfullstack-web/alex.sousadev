import { Link } from 'react-router-dom';
import { RefreshCw, UserPlus } from 'lucide-react';
import CtaFinal from '../components/CtaFinal.jsx';
import Icone from '../components/Icone.jsx';
import PaginaTopo from '../components/PaginaTopo.jsx';
import Reveal from '../components/Reveal.jsx';
import { plataformasDoPlano, plataformasDosPlanos, precoPlano, usePlanos } from '../hooks/usePlanos.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesTrilha } from '../seo/schema.js';

// Planos e plataformas por assinatura. Tudo vem do Gestão (cadastrado no painel): nada fixo aqui.
// Montada só com os componentes e classes que o site já usa (mesma lista da página Serviços).
export default function Planos() {
  useSeo({
    titulo: 'Planos',
    descricao: 'Plataformas da Alex Sousa Tech por assinatura: escolha um plano, crie sua conta e acompanhe tudo na área do cliente.',
    caminho: '/planos',
    entidades: entidadesTrilha('Planos', '/planos'),
  });
  const { planos, erro, recarregar } = usePlanos();
  const plataformas = plataformasDosPlanos(planos);

  return (
    <>
      <PaginaTopo titulo="Planos" texto="Plataformas da Alex Sousa Tech por assinatura. Crie sua conta, escolha o plano e acompanhe assinaturas e acessos na área do cliente.">
        <Link to="/conta/cadastro" className="botao botao--primario">
          <UserPlus size={18} aria-hidden="true" /> Criar conta
        </Link>
        <Link to="/conta" className="botao botao--contorno">
          Já sou cliente
        </Link>
      </PaginaTopo>

      <section className="secao secao--colada" aria-label="Lista de planos">
        {erro && !planos ? (
          <div className="aviso" role="alert">
            <p>{erro}</p>
            <button type="button" className="botao botao--contorno botao--p" onClick={recarregar}>
              <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
            </button>
          </div>
        ) : !planos ? (
          <div className="projetos-grade" aria-busy="true" aria-label="Carregando planos">
            {[0, 1, 2].map((i) => (
              <div key={i} className="projeto projeto--esqueleto" />
            ))}
          </div>
        ) : !planos.length ? (
          <p className="vazio">Os planos estão sendo preparados. Enquanto isso, fale com a gente pelo WhatsApp.</p>
        ) : (
          <ul className="servicos-lista">
            {planos.map((p, i) => (
              <Reveal as="li" key={p.id} className="servico-linha" style={{ '--atraso': `${(i % 2) * 60}ms` }}>
                <span className="servico-linha__icone">
                  <Icone nome="layers" size={26} />
                </span>
                <div className="servico-linha__texto">
                  <h2>{p.name}</h2>
                  {p.description && <p>{p.description}</p>}
                  <p className="servico-linha__beneficio">
                    <strong>{precoPlano(p)}.</strong> Inclui {plataformasDoPlano(p)}.{p.trialDays > 0 && ` Teste grátis de ${p.trialDays} dias na primeira contratação.`}
                  </p>
                </div>
                <Link to="/conta?aba=assinaturas" className="botao botao--contorno botao--p servico-linha__acao" aria-label={`Contratar o plano ${p.name}`}>
                  Contratar
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </section>

      {plataformas.length > 0 && (
        <section id="plataformas" className="secao" aria-labelledby="plataformas-titulo">
          <Reveal className="secao__topo">
            <div>
              <h2 id="plataformas-titulo">Plataformas</h2>
              <p className="secao__texto">O que cada plano libera. O acesso fica disponível na área do cliente assim que o pagamento é confirmado.</p>
            </div>
          </Reveal>
          <ul className="servicos-grade">
            {plataformas.map((x, i) => (
              <Reveal as="li" key={x.slug} className="servico" style={{ '--atraso': `${(i % 3) * 70}ms` }}>
                <Link to="/conta?aba=plataformas" className="servico__link" aria-label={`${x.name}: acessar pela área do cliente`}>
                  <span className="servico__icone">
                    <Icone nome="app-window" />
                  </span>
                  <h3>{x.name}</h3>
                  {x.description && <p>{x.description}</p>}
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <CtaFinal titulo="Precisa de algo sob medida?" texto="Se nenhum plano atende ao seu caso, conte a sua ideia e a gente monta a solução com você." />
    </>
  );
}
