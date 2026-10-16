import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, ChevronDown, ClipboardCheck, FolderOpen, Headset, MessageCircle, RefreshCw, Send } from 'lucide-react';
import { mensagemDeErro, site } from '../api.js';
import { CONTEUDO_MINIMO, useSite } from '../context/SiteContext.jsx';
import { useSeo } from '../hooks/useSeo.js';
import Icone from '../components/Icone.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Reveal from '../components/Reveal.jsx';
import QuoteStatus from '../components/QuoteStatus.jsx';

function Hero({ conteudo, servicos }) {
  const { dados, abrirChat } = useSite();
  const zap = dados?.whatsapp;
  const h = conteudo?.hero || CONTEUDO_MINIMO.hero;
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-titulo">
      <div className="hero__texto">
        <p className="hero__marca">
          <img src="/img/site/logo-as.webp" alt="" width="240" height="141" />
          <span>
            <span className="hero__marca-nome">
              Alex <em>Sousa</em>
            </span>
            <span className="hero__marca-slogan">Desenvolvimento • Tecnologia • Inovação</span>
          </span>
        </p>
        <h1 id="hero-titulo" className="hero__titulo">
          {h.titulo}
        </h1>
        <p className="hero__sub">{h.subtitulo}</p>
        <div className="hero__acoes">
          <Link to="/#projetos" className="botao botao--primario">
            <FolderOpen size={18} aria-hidden="true" /> Ver projetos
          </Link>
          <Link to="/orcamento" className="botao botao--contorno">
            <Send size={18} aria-hidden="true" /> Solicitar orçamento
          </Link>
        </div>
        <div className="hero__acoes hero__acoes--secundarias">
          {zap?.ativo && (
            <a href={zap.link} target="_blank" rel="noopener noreferrer" className="botao botao--fantasma">
              <MessageCircle size={18} aria-hidden="true" /> Falar pelo WhatsApp
            </a>
          )}
          {dados && (
            <button type="button" className="botao botao--fantasma" onClick={() => abrirChat()}>
              <Bot size={18} aria-hidden="true" /> Conversar com João Pedro IA
            </button>
          )}
        </div>
      </div>
      <div className="hero__visual">
        <div className="hero__anel" aria-hidden="true" />
        <picture>
          <source media="(max-width: 699px)" srcSet="/img/site/alex-sm.webp" />
          <img className="hero__foto" src="/img/site/alex.webp" alt="Alex Sousa, desenvolvedor full stack da Alex Sousa Tech" width="760" height="1128" fetchPriority="high" />
        </picture>
        <p className="hero__cartao">
          <strong>Alex Sousa</strong>
          <span>Desenvolvedor Full Stack</span>
        </p>
      </div>
      {servicos?.length > 0 && (
        <ul className="hero__faixa" aria-label="Principais serviços">
          {servicos.slice(0, 4).map((s) => (
            <li key={s.titulo}>
              <Icone nome={s.icone} size={18} />
              <span>{s.titulo}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Secao({ id, titulo, descricao, children, acao, className = '' }) {
  return (
    <section id={id} className={`secao ${className}`} aria-labelledby={`${id}-titulo`}>
      <Reveal className="secao__topo">
        <div>
          <h2 id={`${id}-titulo`} className="secao__titulo">
            {titulo}
          </h2>
          {descricao && <p className="secao__desc">{descricao}</p>}
        </div>
        {acao}
      </Reveal>
      {children}
    </section>
  );
}

function Projetos() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const carregar = () => {
    setErro('');
    site
      .projetos({ limite: 7 })
      .then((r) => setLista(r.itens))
      .catch((e) => setErro(mensagemDeErro(e, 'Não foi possível carregar os projetos.')));
  };
  useEffect(carregar, []);
  return (
    <Secao
      id="projetos"
      titulo="Projetos que já desenvolvi"
      descricao="Projetos reais, publicados direto do meu sistema de gestão, o Business OS."
      acao={
        <Link to="/projetos" className="botao botao--contorno botao--p">
          Ver todos os projetos <ArrowRight size={15} aria-hidden="true" />
        </Link>
      }
    >
      {erro ? (
        <div className="aviso-erro" role="alert">
          <p>{erro}</p>
          <button type="button" className="botao botao--contorno botao--p" onClick={carregar}>
            <RefreshCw size={15} aria-hidden="true" /> Tentar de novo
          </button>
        </div>
      ) : !lista ? (
        <div className="projetos-grade" aria-busy="true" aria-label="Carregando projetos">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="projeto projeto--esqueleto" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <p className="vazio">Os projetos estão sendo preparados para publicação. Enquanto isso, conte o que você precisa em um pedido de orçamento.</p>
      ) : (
        <div className="projetos-grade">
          {lista.slice(0, 6).map((p, i) => (
            <Reveal key={p.slug} style={{ '--atraso': `${i * 60}ms` }}>
              <ProjectCard p={p} destaque={i === 0} />
            </Reveal>
          ))}
        </div>
      )}
    </Secao>
  );
}

function Faq({ itens }) {
  return (
    <div className="faq">
      {itens.map((f) => (
        <details key={f.pergunta} className="faq__item">
          <summary>
            <span>{f.pergunta}</span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <p>{f.resposta}</p>
        </details>
      ))}
    </div>
  );
}

export default function Home() {
  const { dados, erro, recarregar, abrirChat } = useSite();
  const c = dados?.conteudo;
  useSeo({ descricao: c?.hero?.subtitulo || CONTEUDO_MINIMO.hero.subtitulo, caminho: '/' });
  const zap = dados?.whatsapp;

  return (
    <>
      <Hero conteudo={c} servicos={c?.servicos} />
      {erro && !dados && (
        <div className="aviso-erro aviso-erro--geral" role="alert">
          <p>{erro}</p>
          <button type="button" className="botao botao--contorno botao--p" onClick={recarregar}>
            <RefreshCw size={15} aria-hidden="true" /> Tentar de novo
          </button>
        </div>
      )}

      {c && (
        <Secao id="sobre" titulo="Sobre mim" className="sobre">
          <Reveal className="sobre__grade">
            <div className="sobre__foto">
              <img src="/img/site/alex-sm.webp" alt={`${c.sobre.nome}`} width="440" height="653" loading="lazy" />
            </div>
            <div className="sobre__texto">
              <h3>{c.sobre.nome}</h3>
              {c.sobre.cargo && <p className="sobre__cargo">{c.sobre.cargo}</p>}
              <p>{c.sobre.texto}</p>
              {c.sobre.destaques?.length > 0 && (
                <ul className="sobre__destaques">
                  {c.sobre.destaques.map((d) => (
                    <li key={d.titulo}>
                      <Icone nome={d.icone} size={17} />
                      {d.titulo}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        </Secao>
      )}

      {c?.servicos?.length > 0 && (
        <Secao id="servicos" titulo="Soluções digitais para o seu negócio" descricao="Do site institucional ao sistema sob medida, com o mesmo cuidado em design, código e segurança.">
          <ul className="servicos">
            {c.servicos.map((s, i) => (
              <Reveal as="li" key={s.titulo} className="servico" style={{ '--atraso': `${i * 50}ms` }}>
                <span className="servico__icone">
                  <Icone nome={s.icone} size={22} />
                </span>
                <h3>{s.titulo}</h3>
                {s.descricao && <p>{s.descricao}</p>}
              </Reveal>
            ))}
          </ul>
        </Secao>
      )}

      {dados && <Projetos />}

      {c?.tecnologias?.length > 0 && (
        <Secao id="tecnologias" titulo="Ferramentas e tecnologias que utilizo">
          <Reveal as="ul" className="tecnologias">
            {c.tecnologias.map((t) => (
              <li key={t}>
                <span className="tecnologias__no" aria-hidden="true" />
                {t}
              </li>
            ))}
          </Reveal>
        </Secao>
      )}

      {c?.etapas?.length > 0 && (
        <Secao id="como-funciona" titulo="Do seu projeto à entrega" descricao="Um caminho claro, com você acompanhando cada etapa.">
          <Reveal as="ol" className="etapas">
            {c.etapas.map((e, i) => (
              <li key={e.titulo} className="etapa">
                <span className="etapa__numero" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{e.titulo}</h3>
                {e.descricao && <p>{e.descricao}</p>}
              </li>
            ))}
          </Reveal>
        </Secao>
      )}

      {dados && (
        <Secao id="orcamento" titulo="Vamos tirar sua ideia do papel?" descricao="Conte o que você precisa. Sem cadastro: você recebe um protocolo e escolhe como prefere continuar.">
          <Reveal className="cta-orcamento">
            <ul className="cta-orcamento__passos">
              <li>
                <ClipboardCheck size={20} aria-hidden="true" /> Preencha o pedido em poucos minutos
              </li>
              <li>
                <Headset size={20} aria-hidden="true" /> A equipe analisa e define valor e prazo
              </li>
              <li>
                <MessageCircle size={20} aria-hidden="true" /> Continue pelo sistema, WhatsApp ou contato da equipe
              </li>
            </ul>
            <div className="cta-orcamento__acoes">
              <Link to="/orcamento" className="botao botao--primario">
                <Send size={18} aria-hidden="true" /> Solicitar orçamento
              </Link>
            </div>
            <QuoteStatus />
          </Reveal>
        </Secao>
      )}

      {dados && (
        <Secao id="atendimento" titulo="Atendimento e suporte" descricao={zap?.horario ? `Atendimento humano: ${zap.horario}.` : 'Escolha o canal que for mais prático para você.'}>
          <ul className="canais">
            <Reveal as="li" className="canal">
              <Bot size={24} aria-hidden="true" />
              <h3>João Pedro IA</h3>
              <p>{dados.assistente.iaDisponivel ? 'Tira dúvidas sobre serviços e projetos e ajuda a montar o pedido.' : 'Assistente temporariamente indisponível; a equipe atende pelo chat.'}</p>
              <button type="button" className="botao botao--contorno botao--p" onClick={() => abrirChat()}>
                Abrir conversa
              </button>
            </Reveal>
            <Reveal as="li" className="canal">
              <Headset size={24} aria-hidden="true" />
              <h3>Falar com a equipe</h3>
              <p>Uma pessoa responde pelo chat do site, com protocolo para acompanhar.</p>
              <button type="button" className="botao botao--contorno botao--p" onClick={() => abrirChat('equipe')}>
                Chamar a equipe
              </button>
            </Reveal>
            {zap?.ativo && (
              <Reveal as="li" className="canal">
                <MessageCircle size={24} aria-hidden="true" />
                <h3>WhatsApp</h3>
                <p>{zap.orientacao || 'Converse direto com a equipe pelo WhatsApp.'}</p>
                <a href={zap.link} target="_blank" rel="noopener noreferrer" className="botao botao--contorno botao--p">
                  Abrir WhatsApp
                </a>
              </Reveal>
            )}
          </ul>
        </Secao>
      )}

      {c?.faq?.length > 0 && (
        <Secao id="perguntas" titulo="Perguntas frequentes">
          <Reveal>
            <Faq itens={c.faq} />
          </Reveal>
        </Secao>
      )}
    </>
  );
}
