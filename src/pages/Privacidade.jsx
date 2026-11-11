import PaginaTopo from '../components/PaginaTopo.jsx';
import { CONTATO } from '../data/empresa.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesTrilha } from '../seo/schema.js';

export default function Privacidade() {
  useSeo({
    titulo: 'Política de privacidade',
    descricao: 'Como a Alex Sousa Tech usa os dados enviados pelo site, conforme a LGPD.',
    caminho: '/privacidade',
    entidades: entidadesTrilha('Política de privacidade', '/privacidade'),
  });
  return (
    <>
      <PaginaTopo titulo="Política de privacidade" texto="Este site coleta apenas os dados necessários para responder a quem entra em contato, conforme a Lei Geral de Proteção de Dados (LGPD)." />
      <section className="secao secao--colada texto-longo" aria-label="Política de privacidade">
        <h2>O que é coletado</h2>
        <p>
          No pedido de orçamento: nome, e-mail, WhatsApp, empresa (opcional), os dados do projeto que você descreve e a sua preferência de contato. Também registramos a página de
          onde o pedido foi enviado e, para evitar abuso, uma versão cifrada do endereço IP (o IP em si não é guardado).
        </p>
        <h2>Para que é usado</h2>
        <p>
          Só para analisar e responder ao seu pedido. Os dados ficam no sistema de gestão da Alex Sousa Tech, acessível apenas a pessoas autorizadas, e não são vendidos nem
          compartilhados para publicidade.
        </p>
        <h2>Proteção contra robôs</h2>
        <p>O formulário usa verificações automáticas contra envios de robôs. Quando ativada, a verificação do Cloudflare Turnstile pode processar dados técnicos do navegador.</p>
        <h2>Links externos</h2>
        <p>Os botões de WhatsApp, Instagram e GitHub abrem serviços de terceiros, com políticas de privacidade próprias.</p>
        <h2>Seus direitos</h2>
        <p>
          Você pode pedir acesso, correção ou exclusão dos seus dados pelo e-mail <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>.
        </p>
      </section>
    </>
  );
}
