// Verificação Cloudflare Turnstile — só aparece se VITE_TURNSTILE_SITE_KEY estiver definida
// (e o backend tiver TURNSTILE_SECRET_KEY). Sem chave, não renderiza nada.
import { useEffect, useRef } from 'react';
import { TURNSTILE_SITE_KEY } from '../config.js';

let carregando = null;
function carregarScript() {
  if (window.turnstile) return Promise.resolve();
  if (!carregando) {
    carregando = new Promise((ok, falha) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = ok;
      s.onerror = falha;
      document.head.appendChild(s);
    });
  }
  return carregando;
}

export default function Turnstile({ onToken, chave }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return undefined;
    let id;
    let ativo = true;
    carregarScript()
      .then(() => {
        if (!ativo || !ref.current) return;
        id = window.turnstile.render(ref.current, { sitekey: TURNSTILE_SITE_KEY, theme: 'dark', language: 'pt-br', callback: onToken, 'expired-callback': () => onToken(''), 'error-callback': () => onToken('') });
      })
      .catch(() => onToken(''));
    return () => {
      ativo = false;
      if (id !== undefined && window.turnstile) window.turnstile.remove(id);
    };
  }, [onToken, chave]);
  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={ref} className="turnstile" />;
}
export const precisaTurnstile = Boolean(TURNSTILE_SITE_KEY);
