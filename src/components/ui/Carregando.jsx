import { Loader2 } from 'lucide-react';

// Indicadores de carregamento. Nenhum mostra porcentagem: o site não tem como medir o progresso
// real dessas esperas, então nada de número inventado.

// Carregamento de página (troca de rota com código ainda não baixado).
export function CarregandoPagina() {
  return (
    <div className="carregando-pagina" role="status" aria-live="polite">
      <div className="carregando-pagina__marca">
        <span className="carregando-pagina__anel" aria-hidden="true" />
        <img src="/img/site/logo-as.webp" alt="" width="240" height="141" />
      </div>
      <div className="barra-carregando" aria-hidden="true" />
      <span className="sr-only">Carregando a página…</span>
    </div>
  );
}

// Texto curto com ícone girando, para trechos dentro de cartões.
export function CarregandoTexto({ children }) {
  return (
    <p className="carregando-inline" role="status">
      <Loader2 size={18} className="girando" aria-hidden="true" /> {children}
    </p>
  );
}

// Esqueletos de cartões enquanto os dados chegam.
export function EsqueletoCartoes({ quantidade = 3, rotulo = 'Carregando' }) {
  return (
    <div className="grade grade--3" aria-busy="true" aria-label={rotulo} role="status">
      {Array.from({ length: quantidade }, (_, i) => (
        <div key={i} className="esqueleto esqueleto--cartao" />
      ))}
    </div>
  );
}
