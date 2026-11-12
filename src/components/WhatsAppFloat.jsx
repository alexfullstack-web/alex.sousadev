import { MessageCircle } from 'lucide-react';
import { linkWhatsapp } from '../data/empresa.js';

export default function WhatsAppFloat() {
  return (
    <a className="zap-flutuante" href={linkWhatsapp()} target="_blank" rel="noopener noreferrer" aria-label="Conversar pelo WhatsApp" title="Conversar pelo WhatsApp">
      <MessageCircle size={24} aria-hidden="true" />
    </a>
  );
}
