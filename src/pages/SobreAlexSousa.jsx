import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Github, Instagram, Linkedin, Send, Youtube } from 'lucide-react';
import { site } from '../api.js';
import { useSite } from '../context/SiteContext.jsx';
import { useSeo } from '../hooks/useSeo.js';
import { dadoInicial } from '../seo/dadosIniciais.js';
import { CAMINHO_SOBRE, FOTO_FUNDADOR } from '../seo/marca.js';
import { entidadesSobre } from '../seo/schema.js';
import Icone from '../components/Icone.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Reveal from '../components/Reveal.jsx';

const ESPECIALIDADES = [
  { titulo: 'Front-end', texto: 'Telas em React com componentes reutilizáveis, pensadas para desktop, tablet e celular.' },
  { titulo: 'Back-end', texto: 'APIs com Node.js e Express, autenticação com JWT e senhas protegidas com bcrypt.' },
  { titulo: 'APIs e integrações', texto: 'Rotas REST claras e integrações com serviços externos, previsíveis para quem consome.' },
  { titulo: 'Banco de dados', texto: 'Modelagem com Prisma pensada para manutenção e crescimento do sistema.' },
  { titulo: 'Inteligência artificial aplicada', texto: 'Assistentes integrados ao sistema para atender usuários e organizar solicitações.' },
];

// Usados só se a API do Business OS não responder; o normal é vir de lá.
const TECNOLOGIAS_BASE = ['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js', 'Express', 'JWT', 'bcrypt', 'REST APIs', 'Prisma', 'MongoDB'];
const SERVICOS_BASE = ['Sites', 'Sistemas web', 'SaaS', 'Aplicativos', 'Automação com IA'];

const PALETA = [
  { nome: 'Abismo', cor: '#020611' },
  { nome: 'Marinho', cor: '#071630' },
  { nome: 'Elétrico', cor: '#1e6bff' },
  { nome: 'Neon', cor: '#4fd1ff' },
  { nome: 'Cromo', cor: '#c9d3e3' },
];

const REDES = [
  ['github', 'GitHub', Github],
  ['linkedin', 'LinkedIn', Linkedin],
  ['instagram', 'Instagram', Instagram],
  ['youtube', 'YouTube', Youtube],
];

export default function SobreAlexSousa() {
  const { dados } = useSite();
  const c = dados?.conteudo;
  const [projetos, setProjetos] = useState(() => dadoInicial('projetosInicio'));
  useEffect(() => {
    site
      .projetos({ limite: 7 })
      .then((r) => setProjetos(r.itens))
      .catch(() => {}); // sem API: a seção aponta para a página de projetos
  }, []);
  useSeo({
    tituloCompleto: 'Sobre Alex Sousa, Desenvolvedor Full Stack | Alex Sousa Tech',
    descricao: 'Conheça Alex Sousa, desenvolvedor Full Stack e fundador da Alex Sousa Tech: biografia profissional, especialidades, tecnologias, serviços e projetos.',
    caminho: CAMINHO_SOBRE,
    imagem: FOTO_FUNDADOR,
    imagemAlt: 'Alex Sousa, desenvolvedor Full Stack e fundador da Alex Sousa Tech',
    entidades: entidadesSobre(),
  });

  const tecnologias = c?.tecnologias?.length ? c.tecnologias : TECNOLOGIAS_BASE;
  const servicos = c?.servicos?.length ? c.servicos : SERVICOS_BASE.map((titulo) => ({ titulo }));
  const contato = c?.contato || {};
  const redes = REDES.filter(([chave]) => /^https:\/\//i.test(contato[chave] || ''));

  return (
    <div className="pagina sobre-alex">
      <Link to="/" className="voltar">
        <ArrowLeft size={16} aria-hidden="true" /> Início
      </Link>

      <header className="sobre-alex__topo">
        <div className="sobre-alex__intro">
          <p className="sobre-alex__marca">Alex Sousa Tech</p>
          <h1 className="pagina__titulo">Alex Sousa</h1>
          <p className="sobre-alex__cargo">Desenvolvedor Full Stack e fundador da Alex Sousa Tech</p>
          <p className="sobre-alex__lema">Desenvolvimento • Tecnologia • Inovação</p>
          <div className="hero__acoes">
            <Link to="/projetos" className="botao botao--primario">
              Ver projetos <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link to="/orcamento" className="botao botao--contorno">
              <Send size={17} aria-hidden="true" /> Solicitar orçamento
            </Link>
          </div>
          {redes.length > 0 && (
            <ul className="sobre-alex__redes" aria-label="Redes sociais de Alex Sousa">
              {redes.map(([chave, rotulo, IconeRede]) => (
                <li key={chave}>
                  <a href={contato[chave]} target="_blank" rel="noopener noreferrer me">
                    <IconeRede size={16} aria-hidden="true" /> {rotulo}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="sobre__foto sobre-alex__foto">
          <img src="/img/site/alex-sm.webp" alt="Alex Sousa, desenvolvedor Full Stack e fundador da Alex Sousa Tech" width="440" height="653" fetchPriority="high" />
        </div>
      </header>

      <section className="sobre-alex__bloco" aria-labelledby="bio">
        <h2 id="bio" className="secao__titulo">Biografia profissional</h2>
        <div className="sobre-alex__texto">
          <p>Sou Alex Sousa, desenvolvedor Full Stack e fundador da Alex Sousa Tech. Trabalho com o ciclo completo de um sistema web: interface, API, autenticação e banco de dados, sempre buscando código legível e decisões de arquitetura que se sustentam quando o projeto cresce.</p>
          {c?.sobre?.texto && <p>{c.sobre.texto}</p>}
          <p>No dia a dia, isso significa desenhar rotas REST claras, proteger os dados com autenticação e senhas criptografadas e modelar as informações de um jeito que facilita a manutenção, e não só que funciona na primeira tentativa.</p>
        </div>
      </section>

      <section className="sobre-alex__bloco" aria-labelledby="historia">
        <h2 id="historia" className="secao__titulo">A história da Alex Sousa Tech</h2>
        <div className="sobre-alex__texto">
          <p>A Alex Sousa Tech é a marca sob a qual Alex Sousa reúne seu trabalho em desenvolvimento de software, voltado a empresas e profissionais do Brasil que querem crescer com tecnologia. A proposta está no próprio lema: desenvolvimento, tecnologia e inovação aplicados a sites, sistemas e aplicações sob medida.</p>
          <p>A marca também usa o que constrói. Os projetos, os pedidos de orçamento e o atendimento deste site são gerenciados pelo Business OS, o sistema de gestão desenvolvido por Alex Sousa.</p>
        </div>
      </section>

      <section className="sobre-alex__bloco" aria-labelledby="especialidades">
        <h2 id="especialidades" className="secao__titulo">Especialidades</h2>
        <ul className="servicos">
          {ESPECIALIDADES.map((e) => (
            <Reveal as="li" key={e.titulo} className="servico">
              <h3>{e.titulo}</h3>
              <p>{e.texto}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="sobre-alex__bloco" aria-labelledby="tecs">
        <h2 id="tecs" className="secao__titulo">Tecnologias</h2>
        <ul className="tecnologias">
          {tecnologias.map((t) => (
            <li key={t}>
              <span className="tecnologias__no" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="sobre-alex__bloco" aria-labelledby="servs">
        <h2 id="servs" className="secao__titulo">Serviços</h2>
        <ul className="servicos">
          {servicos.map((s) => (
            <Reveal as="li" key={s.titulo} className="servico">
              {s.icone && (
                <span className="servico__icone">
                  <Icone nome={s.icone} size={22} />
                </span>
              )}
              <h3>{s.titulo}</h3>
              {s.descricao && <p>{s.descricao}</p>}
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="sobre-alex__bloco" aria-labelledby="reais">
        <div className="secao__topo">
          <h2 id="reais" className="secao__titulo">Projetos reais</h2>
          <Link to="/projetos" className="botao botao--contorno botao--p">
            Ver todos os projetos <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        {projetos?.length > 0 && (
          <div className="projetos-grade projetos-grade--pagina">
            {projetos.slice(0, 3).map((p) => (
              <ProjectCard key={p.slug} p={p} />
            ))}
          </div>
        )}
      </section>

      <section className="sobre-alex__bloco" aria-labelledby="identidade">
        <h2 id="identidade" className="secao__titulo">Identidade visual da marca</h2>
        <div className="sobre-alex__identidade">
          <img src="/img/site/logo-full.webp" alt="Logotipo oficial da Alex Sousa Tech com o slogan Desenvolvimento, Tecnologia e Inovação" width="778" height="646" loading="lazy" decoding="async" />
          <div>
            <h3>Cores</h3>
            <ul className="sobre-alex__paleta">
              {PALETA.map((p) => (
                <li key={p.nome}>
                  <span style={{ background: p.cor }} aria-hidden="true" />
                  {p.nome} <code>{p.cor}</code>
                </li>
              ))}
            </ul>
            <h3>Tipografia</h3>
            <p>Chakra Petch nos títulos e Manrope nos textos. Os cantos chanfrados dos botões e cartões vêm do corte da letra A do logotipo.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
