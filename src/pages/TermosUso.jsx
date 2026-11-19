import { Link } from 'react-router-dom';
import TextoLegal from '../components/TextoLegal.jsx';
import { CONTATO, EMPRESA, linkWhatsapp } from '../data/empresa.js';
import { CAMINHO_PRIVACIDADE, CAMINHO_TERMOS } from '../data/legal.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesTrilha } from '../seo/schema.js';

const ATUALIZADO = { iso: '2026-11-19', rotulo: '19 de novembro de 2026' };

const SECOES = [
  {
    id: 'aceitacao',
    titulo: 'Aceitação',
    conteudo: (
      <p>
        Estes termos valem para o site da {EMPRESA.nome} (site.alexsousatech.com.br) e para o Alex Sousa Tech Gestão (alexsousatech.com.br). Ao usar o site ou o sistema, você
        concorda com eles e com a <Link to={CAMINHO_PRIVACIDADE}>Política de Privacidade</Link>. Se não concordar, não use os serviços.
      </p>
    ),
  },
  {
    id: 'site',
    titulo: 'O site',
    conteudo: (
      <>
        <p>
          O site apresenta a Alex Sousa Tech, seus serviços e projetos, e permite pedir orçamentos. As informações são gerais e podem mudar sem aviso. Preços, prazos e escopo só
          valem quando estiverem em uma proposta ou contrato por escrito.
        </p>
        <p>Ao usar o site, você se compromete a não:</p>
        <ul>
          <li>enviar informações falsas ou de outra pessoa sem autorização;</li>
          <li>usar robôs, scripts ou envios em massa nos formulários;</li>
          <li>tentar acessar áreas restritas, contornar proteções ou prejudicar o funcionamento do site;</li>
          <li>usar o site para qualquer finalidade ilegal.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'orcamentos',
    titulo: 'Pedidos de orçamento',
    conteudo: (
      <p>
        Enviar um pedido pelo formulário não cria contrato nem obriga nenhuma das partes. A Alex Sousa Tech analisa o pedido e responde pelo canal que você escolher. A
        contratação só acontece com proposta e aceite formais, que definem escopo, valores, prazos e responsabilidades.
      </p>
    ),
  },
  {
    id: 'area-do-cliente',
    titulo: 'Área do cliente',
    conteudo: (
      <ul>
        <li>Para criar uma conta, informe dados verdadeiros e mantenha-os atualizados. É preciso aceitar estes termos e a Política de Privacidade.</li>
        <li>A senha é pessoal. Não a compartilhe. Se suspeitar de uso indevido, redefina a senha e fale com a Alex Sousa Tech.</li>
        <li>Cada conta dá acesso somente aos dados do próprio cliente.</li>
        <li>A Alex Sousa Tech pode bloquear uma conta em caso de uso indevido, fraude ou descumprimento destes termos. O bloqueio não apaga os dados.</li>
      </ul>
    ),
  },
  {
    id: 'gestao',
    titulo: 'O sistema Alex Sousa Tech Gestão',
    conteudo: (
      <>
        <p>O Gestão é um sistema interno de uso restrito. Não há cadastro aberto: o acesso é criado por convite da Alex Sousa Tech.</p>
        <ul>
          <li>Os dados de acesso são pessoais e intransferíveis. Não compartilhe sua senha nem os códigos de verificação recebidos por e-mail.</li>
          <li>
            O login usa verificação em duas etapas por e-mail. Mantenha o e-mail da sua conta seguro: quem controla esse e-mail consegue receber os códigos.
          </li>
          <li>Os acessos são registrados para segurança, como descrito na Política de Privacidade.</li>
          <li>
            A Alex Sousa Tech pode bloquear ou encerrar um acesso em caso de uso indevido, suspeita de acesso não autorizado ou fim da relação que justificava o convite.
          </li>
          <li>
            Use os dados de clientes e projetos disponíveis no sistema só para as atividades autorizadas, respeitando o sigilo e a LGPD.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'propriedade',
    titulo: 'Propriedade intelectual',
    conteudo: (
      <p>
        A marca, o logotipo, os textos, as imagens e o código do site e do sistema pertencem à Alex Sousa Tech, salvo indicação em contrário. Eles não podem ser copiados ou
        reutilizados sem autorização. Marcas e materiais de clientes exibidos nos projetos pertencem aos seus titulares. Os direitos sobre projetos desenvolvidos para clientes
        seguem o que estiver no contrato de cada projeto.
      </p>
    ),
  },
  {
    id: 'terceiros',
    titulo: 'Serviços e links de terceiros',
    conteudo: (
      <p>
        O site tem links para serviços de terceiros, como WhatsApp, Instagram e GitHub, e o sistema usa fornecedores, como o Google para o envio de e-mails. Esses serviços têm
        termos e políticas próprios, e a Alex Sousa Tech não controla o conteúdo nem a disponibilidade deles.
      </p>
    ),
  },
  {
    id: 'responsabilidade',
    titulo: 'Disponibilidade e responsabilidade',
    conteudo: (
      <p>
        A Alex Sousa Tech trabalha para manter o site e o sistema funcionando com segurança. Mesmo assim, pode haver interrupções por manutenção, falhas técnicas ou problemas
        em fornecedores. Nos limites da lei, a Alex Sousa Tech não responde por danos causados por uso indevido dos serviços, por informações falsas fornecidas pelo usuário ou
        por falhas de serviços de terceiros. Nada nestes termos afasta os direitos garantidos pelo Código de Defesa do Consumidor, quando aplicável.
      </p>
    ),
  },
  {
    id: 'alteracoes',
    titulo: 'Alterações',
    conteudo: <p>Estes termos podem ser atualizados. A versão em vigor é sempre a publicada nesta página, com a data da última atualização no início.</p>,
  },
  {
    id: 'lei',
    titulo: 'Lei aplicável',
    conteudo: <p>Estes termos seguem as leis da República Federativa do Brasil.</p>,
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

export default function TermosUso() {
  useSeo({
    titulo: 'Termos de Uso',
    descricao: 'Regras de uso do site da Alex Sousa Tech e do Gestão: pedidos de orçamento, acesso por convite, segurança e propriedade intelectual.',
    caminho: CAMINHO_TERMOS,
    entidades: entidadesTrilha('Termos de Uso', CAMINHO_TERMOS),
  });
  return (
    <TextoLegal
      titulo="Termos de Uso"
      resumo="Condições para usar o site da Alex Sousa Tech e o sistema Alex Sousa Tech Gestão."
      atualizadoEm={ATUALIZADO}
      secoes={SECOES}
    />
  );
}
