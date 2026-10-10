import { useRef } from 'react';
import { m, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { CLIENT_PROJECTS, CONTACT, PIPELINE, PROJECTS, STACK_GROUPS, TIMELINE, TRAITS } from '../data/site.js';

const ease = [0.22, 1, 0.36, 1];

export function Reveal({ children, delay = 0, y = 26, className, as = 'div', ...rest }) {
  const Comp = m[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, ease, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function SectionHead({ kicker, title, lede, center }) {
  return (
    <Reveal className={`section-head ${center ? 'section-head--center' : ''}`}>
      <p className="section-head__kicker">{kicker}</p>
      <h2 className="section-head__title">{title}</h2>
      {lede && <p className="section-head__lede">{lede}</p>}
    </Reveal>
  );
}

/* ------------------------------ SOBRE ------------------------------ */
export function About() {
  return (
    <section className="section about" id="sobre">
      <SectionHead kicker="// 01 — Sobre mim" title="Quem pilota esta missão" />
      <div className="about__body">
        <Reveal className="about__visual">
          <div className="holo-frame">
            <img src="img/site/alex-moon.webp" alt="Alex Sousa com o traje da Alex Sousa Tech na Lua" width="900" height="1080" loading="lazy" decoding="async" />
            <span className="holo-frame__corner holo-frame__corner--tl" />
            <span className="holo-frame__corner holo-frame__corner--tr" />
            <span className="holo-frame__corner holo-frame__corner--bl" />
            <span className="holo-frame__corner holo-frame__corner--br" />
            <div className="holo-frame__tag">
              <span className="dot" /> ALEX SOUSA · FULL STACK
            </div>
          </div>
        </Reveal>
        <div className="about__content">
          <Reveal as="p" className="about__text" delay={0.05}>
            Sou Alex Sousa, desenvolvedor Full Stack. Trabalho com o ciclo completo de um sistema web: interface, API,
            autenticação e banco de dados, sempre buscando código legível e decisões de arquitetura que se sustentam
            quando o projeto cresce.
          </Reveal>
          <Reveal as="p" className="about__text" delay={0.12}>
            No dia a dia, isso significa desenhar rotas REST claras, proteger dados com JWT e bcrypt, e modelar dados com
            Prisma e MongoDB de um jeito que facilita manutenção — não só que funciona na primeira tentativa.
          </Reveal>
          <Reveal as="ul" className="chips about__traits" delay={0.18}>
            {TRAITS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </Reveal>
          <Reveal className="about__facts" delay={0.24}>
            <div>
              <span>Foco</span>
              <strong>Sistemas web completos</strong>
            </div>
            <div>
              <span>Front-end</span>
              <strong>React · JavaScript</strong>
            </div>
            <div>
              <span>Back-end</span>
              <strong>Node.js · Express</strong>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- TECNOLOGIAS --------------------------- */
export function Stack() {
  return (
    <section className="section stack" id="tecnologias">
      <SectionHead
        kicker="// 02 — Stack"
        title="Meu sistema solar de tecnologias"
        lede="Cada órbita é uma camada do sistema — da interface ao banco de dados."
        center
      />
      <div className="stack__body">
        <Reveal className="orbits" y={0}>
          <div className="orbits__core">
            <img src="img/site/logo-128.webp" alt="" width="128" height="128" />
          </div>
          {STACK_GROUPS.map((g) => (
            <div key={g.title} className={`orbit orbit--${g.orbit}`}>
              <div className="orbit__spin">
                {g.items.map((item, i) => (
                  <div key={item} className="orbit__slot" style={{ '--a': `${(360 / g.items.length) * i}deg` }}>
                    <span className="orbit__planet">
                      <span className="orbit__label">{item}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Reveal>

        <div className="stack__groups">
          {STACK_GROUPS.map((g, i) => (
            <Reveal key={g.title} className="stack-card" delay={i * 0.08}>
              <p className="stack-card__orbit">ÓRBITA {i + 1}</p>
              <h3 className="stack-card__title">{g.title}</h3>
              <ul className="chips">
                {g.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="pipeline" aria-label="Fluxo de uma requisição, do frontend ao banco de dados">
        {PIPELINE.map((step, i) => (
          <div className="pipeline__step" key={step}>
            <span className="pipeline__node">{step}</span>
            {i < PIPELINE.length - 1 && <span className="pipeline__line" style={{ '--d': `${i * 0.35}s` }} />}
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* ----------------------------- PROJETOS ----------------------------- */
function TiltCard({ children, className }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 160, damping: 18 });
  const onMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
    ref.current.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };
  return (
    <m.div
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
    >
      {children}
    </m.div>
  );
}

export function Projects() {
  return (
    <section className="section projects" id="projetos">
      <SectionHead
        kicker="// 04 — Projetos"
        title="Missões concluídas"
        lede="Projetos com foco em arquitetura Full Stack, autenticação e integração com banco de dados."
      />
      <div className="projects__list">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.id} as="article" className={`project ${i % 2 ? 'project--reverse' : ''}`} id={p.id}>
            <TiltCard className="project__visual">
              {p.image ? (
                <img src={p.image.src} alt={p.image.alt} width={p.image.w} height={p.image.h} loading="lazy" decoding="async" />
              ) : (
                <div className="project__modules" aria-hidden="true">
                  <div className="project__modules-orb" />
                  {p.modules.map((mod, j) => (
                    <span key={mod} style={{ '--i': j }}>
                      {mod}
                    </span>
                  ))}
                </div>
              )}
              <span className="project__glare" aria-hidden="true" />
            </TiltCard>
            <div className="project__content">
              <p className="project__mission">
                {p.mission} <span>· {p.tag}</span>
              </p>
              <h3 className="project__title">{p.title}</h3>
              <p className="project__desc">{p.desc}</p>
              <ul className="chips">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <a
                className={`ast-btn ${p.link.ghost ? 'ast-btn--ghost' : 'ast-btn--primary'}`}
                href={p.link.href}
                {...(p.link.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}
              >
                {p.link.label}
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------- SITES PARA CLIENTES ------------------------- */
const domainOf = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

export function ClientProjects() {
  return (
    <section className="section clients" id="clientes">
      <SectionHead
        kicker="// 05 — Sites para clientes"
        title="Projetos no ar"
        lede="Sites que desenvolvi para negócios reais. Clique para abrir e navegar."
      />
      <div className="clients__grid">
        {CLIENT_PROJECTS.map((p, i) => (
          <Reveal key={p.id} as="article" className="client-card" delay={(i % 3) * 0.08}>
            <a className="client-card__window" href={p.url} target="_blank" rel="noopener" aria-label={`Abrir o site ${p.title}`}>
              <span className="client-card__bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span className="client-card__url">{domainOf(p.url)}</span>
              </span>
              <span className="client-card__shot">
                <img src={p.image} alt={`Página inicial do site ${p.title}`} width="1200" height="750" loading="lazy" decoding="async" />
              </span>
            </a>
            <div className="client-card__body">
              <p className="client-card__category">{p.category}</p>
              <h3 className="client-card__title">{p.title}</h3>
              <p className="client-card__desc">{p.desc}</p>
              <a className="client-card__link" href={p.url} target="_blank" rel="noopener">
                Ver site
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M7 13l6-6M8 7h5v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------- EXPERIÊNCIA ---------------------------- */
export function Experience() {
  return (
    <section className="section experience" id="experiencia">
      <SectionHead kicker="// 06 — Trajetória" title="Experiência" />
      <div className="trajectory">
        <div className="trajectory__line" aria-hidden="true">
          <span className="trajectory__satellite" />
        </div>
        {TIMELINE.map((t) => (
          <Reveal key={t.role} className="trajectory__item">
            <span className="trajectory__marker" aria-hidden="true" />
            <div className="trajectory__card">
              <p className="trajectory__date">{t.date}</p>
              <h3 className="trajectory__role">{t.role}</h3>
              <p className="trajectory__desc">{t.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ CONTATO ------------------------------ */
const ICONS = {
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 6h18v12H3z" />
      <path d="M3 6l9 7 9-7" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.7-1.28-1.7-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.6.23 2.77.11 3.06.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.08.78 2.18 0 1.57-.02 2.84-.02 3.23 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.06-1.33A10 10 0 1 0 12 2Zm5.63 14.13c-.24.68-1.4 1.32-1.94 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.16-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.26-.28.57-.35.76-.35h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.14-.28.28-.12.56.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.2.68-.79.87-1.06.18-.28.37-.23.62-.14.26.1 1.63.77 1.9.91.28.14.46.21.53.33.07.12.07.68-.17 1.36Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" />
    </svg>
  ),
};

export function Contact() {
  const cards = [
    { key: 'email', label: 'E-mail', value: CONTACT.email, href: `mailto:${CONTACT.email}`, aria: 'Enviar e-mail para Alex Sousa' },
    { key: 'github', label: 'GitHub', value: CONTACT.githubUser, href: CONTACT.github, aria: 'Abrir perfil do GitHub de Alex Sousa', ext: true },
    { key: 'whatsapp', label: 'WhatsApp', value: CONTACT.whatsappLabel, href: CONTACT.whatsapp, aria: 'Iniciar conversa no WhatsApp com Alex Sousa', ext: true },
    { key: 'instagram', label: 'Instagram', value: CONTACT.instagramUser, href: CONTACT.instagram, aria: 'Abrir perfil do Instagram de Alex Sousa', ext: true },
  ];
  return (
    <section className="section contact" id="contato">
      <SectionHead
        kicker="// 07 — Contato"
        title="Vamos lançar seu próximo projeto?"
        lede="Estou aberto a oportunidades, projetos e conexões profissionais."
        center
      />
      <div className="contact__grid">
        {cards.map((c, i) => (
          <Reveal key={c.key} delay={i * 0.06}>
            <a className="contact-card" href={c.href} aria-label={c.aria} {...(c.ext ? { target: '_blank', rel: 'noopener' } : {})}>
              <span className="contact-card__icon" aria-hidden="true">
                {ICONS[c.key]}
              </span>
              <span className="contact-card__label">{c.label}</span>
              <span className="contact-card__value">{c.value}</span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <img src="img/site/logo-128.webp" alt="" width="26" height="26" />
          <p>Alex Sousa Tech — Desenvolvimento • Tecnologia • Inovação</p>
        </div>
        <nav className="footer__links" aria-label="Links de contato">
          <a href={`mailto:${CONTACT.email}`}>E-mail</a>
          <a href={CONTACT.github} target="_blank" rel="noopener">GitHub</a>
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener">WhatsApp</a>
          <a href={CONTACT.instagram} target="_blank" rel="noopener">Instagram</a>
        </nav>
        <p className="footer__meta">Portfolio v3.0 · © 2026 Alex Sousa</p>
      </div>
    </footer>
  );
}
