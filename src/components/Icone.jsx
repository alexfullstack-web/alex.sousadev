// Ícones do conteúdo editável (as mesmas chaves que o Business OS aceita).
import { AudioLines, BrainCircuit, Cloud, Code2, Cpu, Database, Globe, Headset, Layers, MonitorCog, Palette, Rocket, ShieldCheck, ShoppingCart, Smartphone, Star, TabletSmartphone, Workflow } from 'lucide-react';

const MAPA = { site: Globe, loja: ShoppingCart, sistema: MonitorCog, app: Smartphone, nuvem: Cloud, ia: BrainCircuit, codigo: Code2, suporte: Headset, automacao: Workflow, dados: Database, seguranca: ShieldCheck, design: Palette, som: AudioLines, eletronica: Cpu, celular: TabletSmartphone, fullstack: Layers, foguete: Rocket, estrela: Star };

export default function Icone({ nome, ...props }) {
  const C = MAPA[nome] || Code2;
  return <C aria-hidden="true" {...props} />;
}
