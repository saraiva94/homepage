import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './lib/serviceWorker';

// Registrar Service Worker para cache de frames
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
