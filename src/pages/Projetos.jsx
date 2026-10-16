import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { mensagemDeErro, site } from '../api.js';
import { useSite } from '../context/SiteContext.jsx';
import { useSeo } from '../hooks/useSeo.js';
import ProjectCard from '../components/ProjectCard.jsx';

export default function Projetos() {
  const { dados } = useSite();
  const [params, setParams] = useSearchParams();
  const categoria = params.get('categoria') || '';
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  useSeo({ titulo: 'Projetos', descricao: 'Sites, sistemas web, SaaS, aplicativos e projetos de IA desenvolvidos pela Alex Sousa Tech.', caminho: '/projetos' });
  const carregar = () => {
    setErro('');
    site
      .projetos()
      .then((r) => setLista(r.itens))
      .catch((e) => setErro(mensagemDeErro(e, 'Não foi possível carregar os projetos.')));
  };
  useEffect(carregar, []);
  const categorias = useMemo(() => {
    const usadas = new Set((lista || []).map((p) => p.categoria));
    return (dados?.categoriasDeProjeto || []).filter((c) => usadas.has(c.valor));
  }, [lista, dados]);
  const visiveis = (lista || []).filter((p) => !categoria || p.categoria === categoria);
  const escolher = (c) => setParams(c ? { categoria: c } : {}, { replace: true });

  return (
    <div className="pagina">
      <Link to="/" className="voltar">
        <ArrowLeft size={16} aria-hidden="true" /> Início
      </Link>
      <header className="pagina__topo">
        <h1 className="pagina__titulo">Projetos</h1>
        <p className="secao__desc">Cada projeto é cadastrado e publicado pelo Business OS — o que está aqui é real e está no ar.</p>
      </header>
      {categorias.length > 1 && (
        <div className="filtros" role="group" aria-label="Filtrar por categoria">
          <button type="button" className={!categoria ? 'ativo' : ''} aria-pressed={!categoria} onClick={() => escolher('')}>
            Todos
          </button>
          {categorias.map((c) => (
            <button type="button" key={c.valor} className={categoria === c.valor ? 'ativo' : ''} aria-pressed={categoria === c.valor} onClick={() => escolher(c.valor)}>
              {c.rotulo}
            </button>
          ))}
        </div>
      )}
      {erro ? (
        <div className="aviso-erro" role="alert">
          <p>{erro}</p>
          <button type="button" className="botao botao--contorno botao--p" onClick={carregar}>
            <RefreshCw size={15} aria-hidden="true" /> Tentar de novo
          </button>
        </div>
      ) : !lista ? (
        <div className="projetos-grade projetos-grade--pagina" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="projeto projeto--esqueleto" />
          ))}
        </div>
      ) : visiveis.length === 0 ? (
        <p className="vazio">Nenhum projeto publicado {categoria ? 'nesta categoria' : 'ainda'}.</p>
      ) : (
        <div className="projetos-grade projetos-grade--pagina">
          {visiveis.map((p) => (
            <ProjectCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
