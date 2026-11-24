// Cartão premium reutilizável: vidro escuro, borda luminosa e luz que acompanha o ponteiro.
// Com "para" (rota interna) ou "href" (externo), o cartão inteiro vira um link acessível.
import { Link } from 'react-router-dom';

function moverLuz(e) {
  if (e.pointerType === 'touch') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
}

export default function Cartao({ as: Tag = 'article', className = '', interativo = false, destaque = false, para, href, rotuloLink, externo = false, children, ...props }) {
  const temLink = Boolean(para || href);
  const classes = ['cartao', interativo || temLink ? 'cartao--interativo' : '', destaque ? 'cartao--destaque' : '', className].filter(Boolean).join(' ');
  return (
    <Tag className={classes} onPointerMove={interativo || temLink ? moverLuz : undefined} {...props}>
      {children}
      {para && <Link to={para} className="cartao__link" aria-label={rotuloLink} />}
      {href && <a href={href} className="cartao__link" aria-label={rotuloLink} {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})} />}
    </Tag>
  );
}
