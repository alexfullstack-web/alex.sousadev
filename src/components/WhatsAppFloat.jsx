import { MessageCircle } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';

// Botão flutuante do WhatsApp: só existe se a administração configurou o número.
export default function WhatsAppFloat() {
  const { dados } = useSite();
  const z = dados?.whatsapp;
  if (!z?.ativo) return null;
  return (
    <a className="zap-flutuante" href={z.link} target="_blank" rel="noopener noreferrer" aria-label="Conversar pelo WhatsApp" title={z.horario ? `WhatsApp · ${z.horario}` : 'WhatsApp'}>
      <MessageCircle size={24} aria-hidden="true" />
    </a>
  );
}
