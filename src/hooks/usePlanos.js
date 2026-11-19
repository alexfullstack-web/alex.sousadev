import { useCallback, useEffect, useState } from 'react';
import { listarPlanos } from '../lib/gestao.js';

// Planos e plataformas reais, cadastrados no painel do Gestão. Carregados só no navegador
// (nada no HTML gerado no build), para refletir na hora qualquer mudança de preço ou plano.
export function usePlanos() {
  const [planos, setPlanos] = useState(null);
  const [erro, setErro] = useState('');
  const carregar = useCallback(() => {
    setErro('');
    listarPlanos()
      .then((r) => setPlanos(r.data))
      .catch((e) => setErro(e.message));
  }, []);
  useEffect(carregar, [carregar]);
  return { planos, erro, recarregar: carregar };
}

const CICLO = { MONTHLY: 'por mês', QUARTERLY: 'por trimestre', SEMIANNUAL: 'por semestre', YEARLY: 'por ano' };
export const precoPlano = (p) => `${Number(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ${CICLO[p.billingCycle]}`;
export const plataformasDoPlano = (p) => {
  const n = p.platforms.map((x) => x.name);
  return n.length > 1 ? `${n.slice(0, -1).join(', ')} e ${n[n.length - 1]}` : n[0];
};

// Plataformas sem repetição, na ordem em que aparecem nos planos.
export function plataformasDosPlanos(planos) {
  const vistas = new Map();
  for (const p of planos || []) for (const x of p.platforms) if (!vistas.has(x.slug)) vistas.set(x.slug, x);
  return [...vistas.values()];
}
