import { Link } from 'react-router-dom';
import { AppWindow, ArrowRight, Check, KeyRound, Layers, LayoutDashboard, RefreshCw, UserPlus, UserRoundCog } from 'lucide-react';
import CtaFinal from '../components/CtaFinal.jsx';
import PaginaTopo from '../components/PaginaTopo.jsx';
import Reveal from '../components/Reveal.jsx';
import Aviso from '../components/ui/Aviso.jsx';
import Cartao from '../components/ui/Cartao.jsx';
import { EsqueletoCartoes } from '../components/ui/Carregando.jsx';
import SecaoTopo from '../components/ui/SecaoTopo.jsx';
import { plataformasDosPlanos, precoPlano, usePlanos } from '../hooks/usePlanos.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesTrilha } from '../seo/schema.js';

const PASSOS = [
  { icone: UserPlus, titulo: 'Crie sua conta', texto: 'Cadastro rápido na área do cliente, com e-mail e senha.' },
  { icone: Layers, titulo: 'Escolha o plano', texto: 'Veja o que cada plano inclui e contrate pela área do cliente.' },
  { icone: KeyRound, titulo: 'Acesse as plataformas', texto: 'Com o pagamento confirmado, o acesso é liberado na sua conta.' },
];

// Planos e plataformas por assinatura. Tudo vem do Gestão (cadastrado no painel): nada fixo aqui.
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
      <PaginaTopo
        trilha="Planos"
        rotulo="Assinaturas"
        titulo="Planos e"
        destaque="plataformas"
        texto="Plataformas da Alex Sousa Tech por assinatura. Crie sua conta, escolha o plano e acompanhe assinaturas e acessos na área do cliente."
      >
        <Link to="/conta/cadastro" className="btn btn--primario">
          <UserPlus size={18} aria-hidden="true" /> Criar conta
        </Link>
        <Link to="/conta" className="btn btn--contorno">
          <UserRoundCog size={18} aria-hidden="true" /> Já sou cliente
        </Link>
      </PaginaTopo>

      <section className="secao secao--colada" aria-label="Lista de planos">
        {erro && !planos ? (
          <Aviso tipo="alerta">
            <p>{erro}</p>
            <div>
              <button type="button" className="btn btn--contorno btn--p" onClick={recarregar}>
                <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
              </button>
            </div>
          </Aviso>
        ) : !planos ? (
          <EsqueletoCartoes rotulo="Carregando planos" />
        ) : !planos.length ? (
          <p className="vazio">Os planos estão sendo preparados. Enquanto isso, fale com a gente pelo WhatsApp.</p>
        ) : (
          <ul className="grade grade--3 planos">
            {planos.map((p, i) => (
              <Reveal as="li" key={p.id} style={{ '--atraso': `${(i % 3) * 80}ms` }}>
                <Cartao interativo destaque={i === 0 && planos.length > 1} className="cartao--plano plano">
                  <div className="plano__topo">
                    <span className="icone-caixa">
                      <Layers size={22} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    {p.trialDays > 0 && <span className="selo selo--ok">{p.trialDays} dias de teste</span>}
                  </div>
                  <h2 className="plano__nome">{p.name}</h2>
                  {p.description && <p>{p.description}</p>}
                  <p className="plano__preco num">{precoPlano(p)}</p>
                  <div className="divisor" />
                  <ul className="plano__itens" aria-label="Plataformas incluídas">
                    {p.platforms.map((x) => (
                      <li key={x.slug ?? x.id ?? x.name}>
                        <Check size={16} strokeWidth={2.4} aria-hidden="true" /> {x.name}
                      </li>
                    ))}
                  </ul>
                  {p.trialDays > 0 && <p className="campo__dica">Teste grátis de {p.trialDays} dias na primeira contratação.</p>}
                  <div className="cartao__rodape">
                    <Link to="/conta?aba=assinaturas" className="btn btn--primario btn--bloco" aria-label={`Contratar o plano ${p.name}`}>
                      Contratar <ArrowRight size={17} className="btn__seta" aria-hidden="true" />
                    </Link>
                  </div>
                </Cartao>
              </Reveal>
            ))}
          </ul>
        )}
      </section>

      <section className="secao" aria-labelledby="passos-titulo">
        <SecaoTopo id="passos-titulo" rotulo="Como funciona" titulo="Do cadastro ao acesso" centro />
        <ol className="grade grade--3 passos">
          {PASSOS.map(({ icone: I, titulo, texto }, i) => (
            <Reveal as="li" key={titulo} style={{ '--atraso': `${i * 90}ms` }}>
              <Cartao interativo className="passo">
                <span className="passo__num num mono" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={`icone-caixa${i === 2 ? ' icone-caixa--verde' : ''}`}>
                  <I size={22} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </Cartao>
            </Reveal>
          ))}
        </ol>
      </section>

      {plataformas.length > 0 && (
        <section id="plataformas" className="secao" aria-labelledby="plataformas-titulo">
          <SecaoTopo
            id="plataformas-titulo"
            rotulo="Plataformas"
            titulo="O que cada plano libera"
            texto="O acesso fica disponível na área do cliente assim que o pagamento é confirmado."
          />
          <ul className="grade grade--3">
            {plataformas.map((x, i) => (
              <Reveal as="li" key={x.slug} style={{ '--atraso': `${(i % 3) * 80}ms` }}>
                <Cartao para="/conta?aba=plataformas" rotuloLink={`${x.name}: acessar pela área do cliente`}>
                  <span className={`icone-caixa${i % 2 ? ' icone-caixa--verde' : ''}`}>
                    {i % 2 ? <LayoutDashboard size={22} strokeWidth={1.75} aria-hidden="true" /> : <AppWindow size={22} strokeWidth={1.75} aria-hidden="true" />}
                  </span>
                  <h3>{x.name}</h3>
                  {x.description && <p>{x.description}</p>}
                  <span className="cartao__rodape">
                    <span className="cartao__seta">
                      Acessar pela área do cliente <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  </span>
                </Cartao>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <CtaFinal titulo="Precisa de algo sob medida?" texto="Se nenhum plano atende ao seu caso, conte a sua ideia e a gente monta a solução com você." />
    </>
  );
}
