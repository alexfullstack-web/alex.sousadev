import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { useSeo } from '../hooks/useSeo.js';

export default function Privacidade() {
  const { dados } = useSite();
  const email = dados?.conteudo?.contato?.email;
  useSeo({ titulo: 'Privacidade', descricao: 'Como a Alex Sousa Tech usa os dados enviados pelo site.', caminho: '/privacidade' });
  return (
    <div className="pagina pagina--estreita texto-longo">
      <Link to="/" className="voltar">
        <ArrowLeft size={16} aria-hidden="true" /> Início
      </Link>
      <h1 className="pagina__titulo">Privacidade</h1>
      <p>Este site coleta apenas os dados necessários para responder a quem entra em contato, conforme a Lei Geral de Proteção de Dados (LGPD).</p>
      <h2 className="subtitulo">O que é coletado</h2>
      <ul>
        <li>No pedido de orçamento: nome, e-mail, WhatsApp, empresa (opcional) e a descrição do projeto.</li>
        <li>No chat (João Pedro IA ou equipe): as mensagens trocadas e, se você pedir atendimento humano, nome e um contato.</li>
      </ul>
      <h2 className="subtitulo">Para que é usado</h2>
      <p>Só para analisar e responder ao seu pedido. Os dados ficam no sistema de gestão da Alex Sousa Tech, acessíveis apenas à equipe autorizada, e não são vendidos nem compartilhados para publicidade.</p>
      <h2 className="subtitulo">Assistente com IA</h2>
      <p>Quando ativo, o João Pedro IA usa um provedor de inteligência artificial para responder. Ele conhece apenas as informações públicas do site. Não envie senhas, documentos ou dados de cartão pelo chat.</p>
      <h2 className="subtitulo">Neste navegador</h2>
      <p>O site guarda no seu navegador apenas o identificador da conversa e dos seus pedidos, para você acompanhar o andamento. Limpar os dados do navegador remove essa lista, mas não cancela pedidos.</p>
      <h2 className="subtitulo">Seus direitos</h2>
      <p>Você pode pedir acesso, correção ou exclusão dos seus dados{email ? (<> pelo e-mail <a href={`mailto:${email}`}>{email}</a></>) : ' pelos canais de contato do site'}.</p>
    </div>
  );
}
