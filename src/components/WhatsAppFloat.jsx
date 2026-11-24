import { MessageCircle } from 'lucide-react';
import { linkWhatsapp } from '../data/empresa.js';

export default function WhatsAppFloat() {
  return (
    <a className="zap" href={linkWhatsapp()} target="_blank" rel="noopener noreferrer" aria-label="Conversar pelo WhatsApp" title="Conversar pelo WhatsApp">
      <span className="zap__pulso" aria-hidden="true" />
      <MessageCircle size={24} aria-hidden="true" />
    </a>
  );
}
