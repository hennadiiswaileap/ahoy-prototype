import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { APP, PALETTE } from './config';

// Palette and app name come from src/config.ts
const root = document.documentElement.style;
root.setProperty('--color-navy', PALETTE.navy);
root.setProperty('--color-sea', PALETTE.sea);
root.setProperty('--color-sea-light', PALETTE.seaLight);
root.setProperty('--color-mist', PALETTE.mist);
root.setProperty('--color-signal', PALETTE.signal);
root.setProperty('--color-success', PALETTE.success);
root.setProperty('--color-muted', PALETTE.muted);
document.title = APP.name;

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
