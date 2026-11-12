import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import CtaFinal from "../components/CtaFinal.jsx";
import Reveal from "../components/Reveal.jsx";
import { useProjeto } from "../hooks/useProjetos.js";
import { useSeo } from "../hooks/useSeo.js";
import { entidadesProjeto } from "../seo/schema.js";
import NaoEncontrado from "./NaoEncontrado.jsx";

const dataLonga = (iso) => {
  const [a, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, 15)).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

function Conteudo({ p }) {
  const temTexto = Boolean(p.descricao || p.desafio || p.solucao);
  const temFicha = p.tecnologias.length > 0 || Boolean(p.conclusao);
  useSeo({
    titulo: p.nome,
    descricao: p.resumo,
    caminho: `/projetos/${p.slug}`,
    imagem: p.capa?.url,
    imagemAlt: p.capa?.alt,
    entidades: entidadesProjeto(p),
  });
  return (
    <>
      <header className="caso-topo">
        <Reveal className="caso-topo__texto">
          <Link to="/projetos" className="voltar">
            <ArrowLeft size={16} aria-hidden="true" /> Todos os projetos
          </Link>
          {p.segmento && <p className="caso-topo__segmento">{p.segmento}</p>}
          <h1>{p.nome}</h1>
          <p className="caso-topo__resumo">{p.resumo}</p>
          {p.demo && (
            <a
              href={p.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="botao botao--primario"
            >
              Ver demonstração <ExternalLink size={17} aria-hidden="true" />
            </a>
          )}
        </Reveal>
        {p.capa && (
          <Reveal className="caso-topo__capa" style={{ "--atraso": "100ms" }}>
            <img
              src={p.capa.url}
              alt={p.capa.alt}
              width={p.capa.largura || 1200}
              height={p.capa.altura || 750}
              fetchPriority="high"
            />
          </Reveal>
        )}
      </header>

      {(temTexto || temFicha) && (
        <section
          className={`secao caso${temTexto ? "" : " caso--so-ficha"}`}
          aria-label="Detalhes do projeto"
        >
          {temTexto && (
            <div className="caso__texto">
              {p.descricao && (
                <Reveal>
                  <h2>Sobre o projeto</h2>
                  <p className="quebra">{p.descricao}</p>
                </Reveal>
              )}
              {p.desafio && (
                <Reveal>
                  <h2>Necessidade atendida</h2>
                  <p className="quebra">{p.desafio}</p>
                </Reveal>
              )}
              {p.solucao && (
                <Reveal>
                  <h2>Solução desenvolvida</h2>
                  <p className="quebra">{p.solucao}</p>
                </Reveal>
              )}
            </div>
          )}
          {temFicha && (
            <Reveal
              as="aside"
              className="caso__ficha"
              aria-label="Ficha do projeto"
            >
              <dl>
                {p.conclusao && (
                  <div>
                    <dt>Conclusão</dt>
                    <dd>{dataLonga(p.conclusao)}</dd>
                  </div>
                )}
                {p.tecnologias.length > 0 && (
                  <div>
                    <dt>Tecnologias</dt>
                    <dd>
                      <ul className="etiquetas">
                        {p.tecnologias.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </Reveal>
          )}
        </section>
      )}

      {p.galeria.length > 0 && (
        <section className="secao" aria-labelledby="galeria-titulo">
          <h2 id="galeria-titulo" className="visualmente-oculto">
            Imagens do projeto
          </h2>
          <ul className="galeria">
            {p.galeria.map((g) => (
              <Reveal as="li" key={g.url}>
                <img
                  src={g.url}
                  alt={g.alt}
                  width={g.largura || 1200}
                  height={g.altura || 750}
                  loading="lazy"
                  decoding="async"
                />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <CtaFinal titulo="Quer algo assim para o seu negócio?" />
    </>
  );
}

function Pagina({ slug }) {
  const { projeto, estado, erro, recarregar } = useProjeto(slug);
  if (estado === "nao-encontrado") return <NaoEncontrado />;
  if (projeto) return <Conteudo p={projeto} />;
  if (estado === "erro") {
    return (
      <div className="pagina-topo">
        <div className="aviso" role="alert">
          <p>{erro}</p>
          <button
            type="button"
            className="botao botao--contorno botao--p"
            onClick={recarregar}
          >
            <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      className="pagina-topo"
      aria-busy="true"
      aria-label="Carregando projeto"
    />
  );
}

export default function Projeto() {
  const { slug } = useParams();
  return <Pagina key={slug} slug={slug} />;
}
