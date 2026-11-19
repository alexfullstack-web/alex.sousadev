import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from './api.js';

// Estado da sessão do cliente no site. Ao abrir, tenta recuperar a sessão pelo cookie.
const Ctx = createContext(null);
// Guardados fora do componente: o site remonta a página a cada troca de endereço.
let ultimoCliente = null;
let boasVindasPendente = false;

export function ContaProvider({ children }) {
  const [cliente, setClienteState] = useState(() => (api.temToken() ? ultimoCliente : null));
  const [estado, setEstado] = useState(() => (api.temToken() && ultimoCliente ? 'logado' : 'carregando')); // carregando | anonimo | logado
  const [novaConta] = useState(() => boasVindasPendente); // acabou de se cadastrar (mensagem de boas-vindas)
  const setCliente = useCallback((c) => {
    ultimoCliente = c;
    setClienteState(c);
  }, []);

  useEffect(() => {
    boasVindasPendente = false;
  }, []);

  useEffect(() => {
    if (api.temToken() && ultimoCliente) return undefined; // sessão já carregada nesta aba
    let vivo = true;
    api
      .renovar()
      .then(() => api.meusDados())
      .then((c) => vivo && (setCliente(c), setEstado('logado')))
      .catch(() => vivo && setEstado('anonimo'));
    return () => {
      vivo = false;
    };
  }, []);

  const entrar = useCallback(async (dados) => {
    const c = await api.entrar(dados);
    setCliente(c);
    setEstado('logado');
  }, [setCliente]);
  const cadastrar = useCallback(async (dados) => {
    const c = await api.cadastrar(dados);
    boasVindasPendente = true;
    setCliente(c);
    setEstado('logado');
  }, [setCliente]);
  const sair = useCallback(async () => {
    await api.sair().catch(() => {});
    setCliente(null);
    setEstado('anonimo');
  }, [setCliente]);
  // Sessão perdida (bloqueio, senha trocada em outro aparelho): volta para o login.
  const perdeuSessao = useCallback(() => {
    api.limparToken();
    setCliente(null);
    setEstado('anonimo');
  }, [setCliente]);

  const valor = useMemo(() => ({ cliente, setCliente, estado, novaConta, entrar, cadastrar, sair, perdeuSessao }), [cliente, setCliente, estado, novaConta, entrar, cadastrar, sair, perdeuSessao]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export const useConta = () => useContext(Ctx);
