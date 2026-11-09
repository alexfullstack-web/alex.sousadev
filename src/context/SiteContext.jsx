// Dados públicos do site vindos do Business OS (textos, serviços, WhatsApp, assistente...).
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { mensagemDeErro, site } from '../api.js';
import { dadoInicial } from '../seo/dadosIniciais.js';

// Usado só enquanto a API não responde (ou se estiver fora do ar): a marca e o título do
// hero. Nenhum projeto, serviço ou contato é inventado aqui.
export const CONTEUDO_MINIMO = {
  hero: {
    titulo: 'Transformo ideias em soluções digitais.',
    subtitulo: 'Desenvolvo sites, sistemas web e aplicações modernas para empresas que desejam crescer com tecnologia.',
  },
};

const Ctx = createContext(null);

export function SiteProvider({ children }) {
  const [dados, setDados] = useState(() => dadoInicial('site'));
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(() => !dadoInicial('site'));
  const carregar = useCallback(() => {
    setCarregando(true);
    setErro('');
    site
      .inicio()
      .then(setDados)
      .catch((e) => {
        // Site desligado no Business OS: vale mais que o conteúdo gravado no build.
        if (e?.response?.status === 404) setDados(null);
        setErro(e?.response?.status === 404 ? 'O site está em manutenção no momento.' : mensagemDeErro(e, 'Não foi possível carregar o conteúdo.'));
      })
      .finally(() => setCarregando(false));
  }, []);
  useEffect(carregar, [carregar]);
  const [chatAberto, setChatAberto] = useState(null); // null | 'conversa' | 'equipe'
  return <Ctx.Provider value={{ dados, erro, carregando, recarregar: carregar, chatAberto, abrirChat: (modo = 'conversa') => setChatAberto(modo), fecharChat: () => setChatAberto(null) }}>{children}</Ctx.Provider>;
}

export const useSite = () => useContext(Ctx);

// Link do WhatsApp com uma mensagem própria (ex.: resumo do orçamento).
export function linkWhatsapp(numero, mensagem) {
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem || '')}`;
}
