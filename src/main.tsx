import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { APP } from './config';
import { applyResolvedTheme, installTheme, loadThemeMode, resolveTheme } from './theme';
import { applyUrlFlags } from './store';

// Colours come from src/theme.ts. Apply them before the first render so there's no flash.
installTheme();
applyResolvedTheme(resolveTheme(loadThemeMode()));
document.title = APP.name;
// Read ?theme, ?scope, ?badges, ?screen and ?demo before the first render, so the map starts in the right theme.
applyUrlFlags();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
