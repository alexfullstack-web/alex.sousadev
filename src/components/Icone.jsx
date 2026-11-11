import {
  AppWindow,
  AudioLines,
  Code2,
  Cpu,
  Database,
  Globe,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Monitor,
  MousePointerClick,
  PenTool,
  Puzzle,
  Rocket,
  Server,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  UtensilsCrossed,
  Workflow,
  Wrench,
} from 'lucide-react';

const ICONES = {
  'app-window': AppWindow,
  audio: AudioLines,
  code: Code2,
  cpu: Cpu,
  database: Database,
  globe: Globe,
  layers: Layers,
  'layout-dashboard': LayoutDashboard,
  'life-buoy': LifeBuoy,
  monitor: Monitor,
  'mouse-pointer': MousePointerClick,
  'pen-tool': PenTool,
  puzzle: Puzzle,
  rocket: Rocket,
  server: Server,
  'shopping-bag': ShoppingBag,
  smartphone: Smartphone,
  sparkles: Sparkles,
  target: Target,
  utensils: UtensilsCrossed,
  workflow: Workflow,
  wrench: Wrench,
};

export default function Icone({ nome, size = 22, ...props }) {
  const I = ICONES[nome] ?? Sparkles;
  return <I size={size} strokeWidth={1.75} aria-hidden="true" {...props} />;
}
