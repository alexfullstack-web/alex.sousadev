import { createRoot } from 'react-dom/client';
import HeroSpace from './hero/HeroSpace.jsx';
import './hero/hero.css';

const mount = document.getElementById('hero-root');
if (mount) {
  createRoot(mount).render(<HeroSpace />);
}
