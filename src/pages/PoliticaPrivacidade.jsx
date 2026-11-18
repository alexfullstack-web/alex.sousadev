import { Link } from 'react-router-dom';
import TextoLegal from '../components/TextoLegal.jsx';
import { CONTATO, EMPRESA, linkWhatsapp } from '../data/empresa.js';
import { CAMINHO_PRIVACIDADE, CAMINHO_TERMOS } from '../data/legal.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesTrilha } from '../seo/schema.js';

const ATUALIZADO = { iso: '2026-11-18', rotulo: '18 de novembro de 2026' };

// Regra deste texto: descrever só o que está implementado no site e no Alex Sousa Tech Gestão.
// Ao mudar o tratamento de dados (novo campo, novo fornecedor, nova finalidade), atualize aqui e a data.
const SECOES = [
  {
    id: 'quem-somos',
    titulo: 'Quem é responsável pelos dados',
    conteudo: (
      <>
        <p>
          A {EMPRESA.nome} é a controladora dos dados pessoais tratados neste site (site.alexsousatech.com.br) e no Alex Sousa Tech Gestão (alexsousatech.com.br), o sistema
          interno usado pela equipe para atender clientes e gerenciar projetos.
        </p>
        <p>
          Esta política segue a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018, LGPD). Dúvidas e pedidos sobre seus dados: <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>.
        </p>
      </>
    ),
  },
  {
    id: 'dados',
    titulo: 'Quais dados tratamos',
    conteudo: (
      <>
        <h3>No site</h3>
        <ul>
          <li>
            <strong>Pedido de orçamento:</strong> nome, e-mail, WhatsApp, empresa (opcional), as informações do projeto que você descreve, a sua preferência de contato e o
            registro de que você autorizou o uso dos dados (data e hora).
          </li>
          <li>
            <strong>Dados técnicos do pedido:</strong> a página de onde ele foi enviado, a identificação do navegador e uma versão cifrada (hash) do endereço IP, usada para
            evitar abuso. O IP em si não é guardado com o pedido.
          </li>
          <li>
            <strong>Navegação:</strong> o site não usa cookies de publicidade nem ferramentas de análise de audiência. Ele guarda no seu navegador apenas uma marcação temporária
            (que some ao fechar a aba) para não repetir a animação de abertura.
          </li>
        </ul>
        <h3>No Alex Sousa Tech Gestão (acesso restrito)</h3>
        <p>O Gestão não tem cadastro aberto: só entra quem foi convidado pela Alex Sousa Tech.</p>
        <ul>
          <li>
            <strong>Conta de acesso:</strong> nome, e-mail, senha (guardada apenas como hash, nunca em texto), CPF (opcional, para entrar com ele), telefone de contato (opcional)
            e foto de perfil (opcional).
          </li>
          <li>
            <strong>Convites:</strong> nome, e-mail e, se informado, telefone da pessoa convidada.
          </li>
          <li>
            <strong>Códigos de verificação:</strong> códigos de 6 dígitos enviados por e-mail, válidos por 5 minutos. O sistema guarda somente um hash de cada código, nunca o
            código.
          </li>
          <li>
            <strong>Histórico de acessos e segurança:</strong> data e hora, endereço IP, navegador e sistema operacional, tipo de verificação usado, tentativas com senha ou
            código errados, sessões abertas e dispositivos marcados como confiáveis. A localização aproximada pelo IP fica desativada por padrão.
          </li>
          <li>
            <strong>Dados de clientes e projetos:</strong> informações de clientes, orçamentos, contratos, projetos e financeiro cadastradas pela equipe para prestar os serviços
            contratados.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'gmail',
    titulo: 'Uso da API do Gmail (Google)',
    conteudo: (
      <>
        <p>
          O Alex Sousa Tech Gestão envia e-mails por meio da API do Gmail, do Google, usando uma conta Gmail da própria Alex Sousa Tech. Essa conta foi autorizada pela Alex
          Sousa Tech com uma única permissão: <strong>enviar e-mails</strong> (escopo <code>gmail.send</code>).
        </p>
        <p>Esses envios servem exclusivamente para:</p>
        <ul>
          <li>códigos de verificação no login em duas etapas, na troca de e-mail e na aceitação de convites;</li>
          <li>convites de acesso ao Gestão;</li>
          <li>avisos de segurança da conta, como bloqueio por tentativas erradas, conta bloqueada, e-mail alterado e convite aceito.</li>
        </ul>
        <p>O que isso significa na prática:</p>
        <ul>
          <li>
            O sistema <strong>não lê, não lista, não apaga e não guarda</strong> mensagens, contatos ou qualquer outro conteúdo da caixa do Gmail. Essas permissões não são
            solicitadas.
          </li>
          <li>
            Você não precisa conectar a sua conta Google: ninguém que usa o site ou o Gestão autoriza acesso ao próprio Gmail. A API usa apenas a conta da Alex Sousa Tech.
          </li>
          <li>Para cada envio, o Google recebe o endereço do destinatário, o assunto e o texto da mensagem, necessários para entregá-la.</li>
          <li>
            As credenciais de acesso à API ficam somente nas configurações protegidas do servidor. Elas não ficam no navegador, no banco de dados nem no código-fonte.
          </li>
          <li>
            Os dados envolvidos nesses envios não são vendidos, não são usados para publicidade e não são usados para treinar modelos de inteligência artificial. Também não
            são repassados a terceiros, a não ser quando a lei exigir.
          </li>
        </ul>
        <p>
          O uso e a transferência de informações recebidas das APIs do Google seguem a{' '}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Política de Dados do Usuário dos Serviços de API do Google
          </a>
          , incluindo os requisitos de Uso Limitado.
        </p>
        <p>Conforme a configuração do servidor, o mesmo envio pode ser feito pelo servidor SMTP do Gmail, com as mesmas finalidades e limites.</p>
      </>
    ),
  },
  {
    id: 'finalidades',
    titulo: 'Para que usamos os dados',
    conteudo: (
      <ul>
        <li>
          <strong>Responder pedidos de orçamento</strong> e conversar sobre o projeto. Base legal: procedimentos preliminares a um contrato, a seu pedido, e a sua autorização
          registrada no formulário.
        </li>
        <li>
          <strong>Prestar os serviços contratados</strong> e administrar clientes, projetos e pagamentos. Base legal: execução de contrato e cumprimento de obrigações legais.
        </li>
        <li>
          <strong>Proteger o acesso ao Gestão:</strong> confirmar a identidade de quem entra, evitar acessos indevidos e tentativas automáticas, e investigar incidentes. Base
          legal: legítimo interesse na segurança do sistema e prevenção a fraudes.
        </li>
        <li>
          <strong>Enviar convites, códigos e avisos de segurança</strong> por e-mail, como descrito na seção sobre a API do Gmail.
        </li>
      </ul>
    ),
  },
  {
    id: 'armazenamento',
    titulo: 'Onde e por quanto tempo os dados ficam guardados',
    conteudo: (
      <>
        <p>Os dados ficam em serviços de infraestrutura contratados pela Alex Sousa Tech:</p>
        <ul>
          <li>banco de dados PostgreSQL na Supabase;</li>
          <li>servidor da API do Gestão no Render;</li>
          <li>site hospedado na Vercel.</li>
        </ul>
        <p>
          Esses serviços podem manter servidores fora do Brasil, inclusive nos Estados Unidos. Nesse caso há transferência internacional de dados, feita apenas para operar o site
          e o sistema.
        </p>
        <p>
          Pedidos de orçamento, cadastros e o histórico de acessos são mantidos enquanto forem necessários para a finalidade ou para a relação com o cliente. O sistema não os
          apaga automaticamente. Eles podem ser excluídos a seu pedido, salvo quando a lei exigir a guarda. Os códigos de verificação deixam de valer em 5 minutos e nunca ficam
          guardados em texto.
        </p>
      </>
    ),
  },
  {
    id: 'seguranca',
    titulo: 'Como protegemos os dados',
    conteudo: (
      <>
        <ul>
          <li>conexões com HTTPS;</li>
          <li>senhas guardadas com hash criptográfico (Argon2) e códigos de verificação guardados como hash (HMAC-SHA256);</li>
          <li>login no Gestão em duas etapas, com código enviado por e-mail;</li>
          <li>limite de tentativas e bloqueio temporário após erros repetidos de senha ou de código;</li>
          <li>sessão em cookie protegido (HttpOnly), que pode ser encerrada a qualquer momento;</li>
          <li>acesso ao Gestão só por convite, com permissões por perfil, e área de monitoramento de acessos restrita ao proprietário;</li>
          <li>registros do servidor sem senhas, códigos ou tokens.</li>
        </ul>
        <p>
          Nenhum sistema é totalmente imune a falhas. Se ocorrer um incidente de segurança que possa trazer risco aos titulares, a Alex Sousa Tech vai comunicar os afetados e a
          Autoridade Nacional de Proteção de Dados (ANPD), como determina a LGPD.
        </p>
      </>
    ),
  },
  {
    id: 'compartilhamento',
    titulo: 'Com quem os dados são compartilhados',
    conteudo: (
      <>
        <p>
          A Alex Sousa Tech <strong>não vende</strong> dados pessoais e não os compartilha para publicidade. Os dados passam apenas pelos fornecedores necessários para o
          funcionamento:
        </p>
        <ul>
          <li>Google, para o envio dos e-mails (API do Gmail);</li>
          <li>Supabase, Render e Vercel, para hospedagem e banco de dados;</li>
          <li>Cloudflare, quando a verificação anti-robô Turnstile estiver ativada no formulário (ela pode processar dados técnicos do navegador);</li>
          <li>ipinfo.io, apenas se a localização aproximada dos acessos ao Gestão for ativada (desativada por padrão). Nesse caso, o IP de cada acesso é consultado nesse serviço.</li>
        </ul>
        <p>Os dados também podem ser fornecidos a autoridades quando houver obrigação legal ou ordem judicial.</p>
        <p>Os botões de WhatsApp, Instagram e GitHub abrem serviços de terceiros, que têm políticas de privacidade próprias.</p>
      </>
    ),
  },
  {
    id: 'direitos',
    titulo: 'Seus direitos',
    conteudo: (
      <>
        <p>Pela LGPD (art. 18), você pode pedir, a qualquer momento:</p>
        <ul>
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desacordo com a lei;</li>
          <li>portabilidade dos dados;</li>
          <li>eliminação dos dados tratados com o seu consentimento, e informação sobre a possibilidade de não consentir e suas consequências;</li>
          <li>informação sobre com quem os dados foram compartilhados;</li>
          <li>revogação do consentimento.</li>
        </ul>
        <p>
          Para exercer esses direitos, escreva para <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>. Para confirmar que o pedido é seu, podemos pedir uma confirmação
          pelo mesmo e-mail cadastrado. A resposta será dada em até 15 dias. Você também pode apresentar reclamação à ANPD.
        </p>
      </>
    ),
  },
  {
    id: 'alteracoes',
    titulo: 'Alterações nesta política',
    conteudo: (
      <p>
        Esta política pode ser atualizada quando o site ou o sistema mudarem. A data da última atualização fica no início da página. Veja também os <Link to={CAMINHO_TERMOS}>Termos de uso</Link>.
      </p>
    ),
  },
  {
    id: 'contato',
    titulo: 'Contato',
    conteudo: (
      <ul>
        <li>
          E-mail: <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>
        </li>
        <li>
          WhatsApp:{' '}
          <a href={linkWhatsapp()} target="_blank" rel="noopener noreferrer">
            {CONTATO.whatsappRotulo}
          </a>
        </li>
        <li>
          Site: <Link to="/contato">página de contato</Link>
        </li>
      </ul>
    ),
  },
];

export default function PoliticaPrivacidade() {
  useSeo({
    titulo: 'Política de Privacidade',
    descricao: 'Como a Alex Sousa Tech trata dados pessoais no site e no Gestão, incluindo o uso da API do Gmail para códigos de verificação e convites (LGPD).',
    caminho: CAMINHO_PRIVACIDADE,
    entidades: entidadesTrilha('Política de Privacidade', CAMINHO_PRIVACIDADE),
  });
  return (
    <TextoLegal
      titulo="Política de Privacidade"
      resumo="Quais dados a Alex Sousa Tech trata no site e no sistema Gestão, para quê, onde ficam guardados, com quem são compartilhados e como você exerce seus direitos."
      atualizadoEm={ATUALIZADO}
      secoes={SECOES}
    />
  );
}
