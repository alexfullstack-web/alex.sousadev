import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/site.css';
import './hero/hero.css';
import './mission/mission.css';
import './journey/journey.css';

createRoot(document.getElementById('root')).render(<App />);
