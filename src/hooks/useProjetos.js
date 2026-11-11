import { useCallback, useEffect, useState } from 'react';
import { listarProjetos, obterProjeto } from '../lib/gestao.js';
import { dadoInicial, projetoInicial } from '../seo/dadosIniciais.js';

// Lista de projetos publicados no Gestão. Começa com o que veio no HTML (build) e atualiza
// no navegador: publicações novas aparecem sem precisar de um novo deploy do site.
export function useProjetos() {
  const [itens, setItens] = useState(() => dadoInicial('projetos'));
  const [erro, setErro] = useState('');
  const carregar = useCallback(() => {
    setErro('');
    listarProjetos()
      .then((r) => setItens(r.itens))
      .catch((e) => setErro(e.message));
  }, []);
  useEffect(carregar, [carregar]);
  return { itens, erro, carregando: !itens && !erro, recarregar: carregar };
}

export function useProjeto(slug) {
  const [projeto, setProjeto] = useState(() => projetoInicial(slug));
  const [estado, setEstado] = useState(() => (projetoInicial(slug) ? 'ok' : 'carregando'));
  const [erro, setErro] = useState('');
  const carregar = useCallback(() => {
    setErro('');
    obterProjeto(slug)
      .then((p) => {
        setProjeto(p);
        setEstado('ok');
      })
      .catch((e) => {
        if (e.status === 404) setEstado('nao-encontrado');
        else {
          setErro(e.message);
          setEstado((s) => (s === 'ok' ? 'ok' : 'erro'));
        }
      });
  }, [slug]);
  useEffect(carregar, [carregar]);
  return { projeto, estado, erro, recarregar: carregar };
}
