import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarCheck, ChevronLeft, ChevronRight, Github, RefreshCw, Send, X } from 'lucide-react';
import { mensagemDeErro, site } from '../api.js';
import { useSeo } from '../hooks/useSeo.js';
import ProjectCard from '../components/ProjectCard.jsx';

const mesAno = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const TIPO_POR_CATEGORIA = { SITE: 'SITE_INSTITUCIONAL', SISTEMA_WEB: 'SISTEMA_GESTAO', SAAS: 'SAAS', APLICATIVO: 'APLICATIVO', IA: 'IA' };

function Visualizador({ imagens, i, onFechar, onMudar }) {
  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') onFechar();
      if (e.key === 'ArrowRight') onMudar((i + 1) % imagens.length);
      if (e.key === 'ArrowLeft') onMudar((i - 1 + imagens.length) % imagens.length);
    };
    document.addEventListener('keydown', k);
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.body.style.overflow = antes;
    };
  }, [i, imagens.length, onFechar, onMudar]);
  return (
    <div className="visualizador" role="dialog" aria-modal="true" aria-label={`Imagem ${i + 1} de ${imagens.length}`} onClick={onFechar}>
      <img src={imagens[i]} alt={`Imagem ${i + 1} de ${imagens.length}`} onClick={(e) => e.stopPropagation()} />
      <button type="button" className="visualizador__fechar" onClick={onFechar} aria-label="Fechar" autoFocus>
        <X size={22} aria-hidden="true" />
      </button>
      {imagens.length > 1 && (
        <>
          <button type="button" className="visualizador__nav visualizador__nav--ant" onClick={(e) => (e.stopPropagation(), onMudar((i - 1 + imagens.length) % imagens.length))} aria-label="Imagem anterior">
            <ChevronLeft size={26} aria-hidden="true" />
          </button>
          <button type="button" className="visualizador__nav visualizador__nav--prox" onClick={(e) => (e.stopPropagation(), onMudar((i + 1) % imagens.length))} aria-label="Próxima imagem">
            <ChevronRight size={26} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}

export default function Projeto() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [erro, setErro] = useState('');
  const [naoExiste, setNaoExiste] = useState(false);
  const [aberta, setAberta] = useState(null);
  const carregar = useCallback(() => {
    setErro('');
    setP(null);
    setNaoExiste(false);
    site
      .projeto(slug)
      .then(setP)
      .catch((e) => (e?.response?.status === 404 ? setNaoExiste(true) : setErro(mensagemDeErro(e, 'Não foi possível abrir o projeto.'))));
  }, [slug]);
  useEffect(() => {
    carregar();
    window.scrollTo(0, 0);
  }, [carregar]);
  useSeo({ titulo: p?.nome || (naoExiste ? 'Projeto não encontrado' : 'Projeto'), descricao: p?.resumo, caminho: `/projetos/${slug}`, imagem: p?.capaUrl || undefined, noindex: naoExiste });
  const fechar = useCallback(() => setAberta(null), []);

  if (naoExiste) {
    return (
      <div className="pagina pagina--estreita">
        <h1 className="pagina__titulo">Projeto não encontrado</h1>
        <p className="secao__desc">Ele pode ter sido retirado do portfólio ou o endereço mudou.</p>
        <Link to="/projetos" className="botao botao--primario">
          Ver todos os projetos
        </Link>
      </div>
    );
  }
  if (erro) {
    return (
      <div className="pagina pagina--estreita">
        <div className="aviso-erro" role="alert">
          <p>{erro}</p>
          <button type="button" className="botao botao--contorno botao--p" onClick={carregar}>
            <RefreshCw size={15} aria-hidden="true" /> Tentar de novo
          </button>
        </div>
      </div>
    );
  }
  if (!p) return <div className="pagina"><div className="projeto-detalhe projeto-detalhe--esqueleto" aria-busy="true" aria-label="Carregando projeto" /></div>;

  const imagens = [p.capaUrl, ...p.galeria.filter((g) => g !== p.capaUrl)].filter(Boolean);
  return (
    <article className="pagina" aria-labelledby="projeto-nome">
      <Link to="/projetos" className="voltar">
        <ArrowLeft size={16} aria-hidden="true" /> Todos os projetos
      </Link>
      <div className="projeto-detalhe">
        <div className="projeto-detalhe__info">
          <p className="projeto-detalhe__cat">{[p.categoriaRotulo, p.etiqueta].filter(Boolean).join(' · ')}</p>
          <h1 id="projeto-nome" className="pagina__titulo">
            {p.nome}
          </h1>
          <p className="projeto-detalhe__resumo">{p.resumo}</p>
          {p.dataConclusao && (
            <p className="projeto-detalhe__data">
              <CalendarCheck size={16} aria-hidden="true" /> Concluído em {mesAno(p.dataConclusao)}
            </p>
          )}
          <div className="projeto-detalhe__acoes">
            {p.urlDemo && (
              <a href={p.urlDemo} target="_blank" rel="noopener noreferrer" className="botao botao--primario">
                Ver demonstração <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            )}
            {p.urlGithub && (
              <a href={p.urlGithub} target="_blank" rel="noopener noreferrer" className="botao botao--contorno">
                <Github size={17} aria-hidden="true" /> Código no GitHub
              </a>
            )}
          </div>
        </div>
        <button type="button" className="projeto-detalhe__capa" onClick={() => imagens.length && setAberta(0)} disabled={!imagens.length} aria-label={imagens.length ? 'Ampliar imagem do projeto' : undefined}>
          {p.capaUrl ? <img src={p.capaUrl} alt={`Tela do projeto ${p.nome}`} /> : <span className="projeto__sem-capa" />}
        </button>
      </div>

      <div className="projeto-detalhe__grade">
        <section aria-labelledby="sobre-projeto">
          <h2 id="sobre-projeto" className="subtitulo">
            Sobre o projeto
          </h2>
          <p className="texto-longo">{p.descricao || p.resumo}</p>
          {imagens.length > 1 && (
            <>
              <h2 className="subtitulo">Galeria</h2>
              <ul className="galeria">
                {imagens.map((src, i) => (
                  <li key={src}>
                    <button type="button" onClick={() => setAberta(i)} aria-label={`Ampliar imagem ${i + 1}`}>
                      <img src={src} alt={`Imagem ${i + 1} do projeto ${p.nome}`} loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
        <aside className="projeto-detalhe__lado">
          {p.tecnologias.length > 0 && (
            <>
              <h2 className="subtitulo">Tecnologias</h2>
              <ul className="projeto__tecs projeto__tecs--grandes">
                {p.tecnologias.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </>
          )}
          <div className="quero-igual">
            <h2 className="subtitulo">Quer algo parecido?</h2>
            <p>Conte a sua ideia: a equipe avalia e define valor e prazo com você.</p>
            <Link to={`/orcamento?tipo=${TIPO_POR_CATEGORIA[p.categoria] || 'OUTRO'}`} className="botao botao--primario botao--p">
              <Send size={15} aria-hidden="true" /> Solicitar orçamento
            </Link>
          </div>
        </aside>
      </div>

      {p.outros?.length > 0 && (
        <section className="secao secao--colada" aria-labelledby="outros">
          <h2 id="outros" className="secao__titulo">
            Outros projetos
          </h2>
          <div className="projetos-grade projetos-grade--pagina">
            {p.outros.map((o) => (
              <ProjectCard key={o.slug} p={o} />
            ))}
          </div>
        </section>
      )}
      {aberta !== null && <Visualizador imagens={imagens} i={aberta} onFechar={fechar} onMudar={setAberta} />}
    </article>
  );
}
