import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { useSeo } from '../hooks/useSeo.js';
import QuoteForm from '../components/QuoteForm.jsx';
import QuoteStatus from '../components/QuoteStatus.jsx';

export default function Orcamento() {
  const { dados, erro, recarregar } = useSite();
  const [params] = useSearchParams();
  const [versao, setVersao] = useState(0);
  useSeo({ titulo: 'Solicitar orçamento', descricao: 'Peça um orçamento de site, sistema web, SaaS, aplicativo ou automação. Sem cadastro, com protocolo para acompanhar.', caminho: '/orcamento' });
  const tipo = dados?.orcamentos?.opcoes?.tipos?.some((t) => t.valor === params.get('tipo')) ? params.get('tipo') : '';
  return (
    <div className="pagina pagina--orcamento">
      <Link to="/" className="voltar">
        <ArrowLeft size={16} aria-hidden="true" /> Início
      </Link>
      <div className="orc-layout">
        <header className="orc-layout__lado">
          <h1 className="pagina__titulo">Solicitar orçamento</h1>
          <p className="secao__desc">Conte o que você precisa. Não é preciso criar conta. A equipe responde pela forma que você escolher.</p>
          <ol className="orc-passos">
            <li>Você descreve o projeto e escolhe como continuar.</li>
            <li>Registrando no sistema, você recebe um protocolo na hora.</li>
            <li>A equipe analisa e define valor e prazo com você.</li>
          </ol>
          <QuoteStatus versao={versao} />
        </header>
        <div className="orc-layout__form">
          {erro && !dados ? (
            <div className="aviso-erro" role="alert">
              <p>{erro}</p>
              <button type="button" className="botao botao--contorno botao--p" onClick={recarregar}>
                <RefreshCw size={15} aria-hidden="true" /> Tentar de novo
              </button>
            </div>
          ) : !dados ? (
            <div className="orc-form orc-form--esqueleto" aria-busy="true" aria-label="Carregando formulário" />
          ) : (
            <QuoteForm key={tipo} tipoInicial={tipo} onRegistrado={() => setVersao((n) => n + 1)} />
          )}
        </div>
      </div>
    </div>
  );
}
