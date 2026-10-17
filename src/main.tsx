import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { StatusBar, Style } from '@capacitor/status-bar';

// Initialize Android Native Capacitor settings
const initCapacitor = async () => {
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#020617' });
  } catch {
    // Graceful fallback when running in standard web browser
  }
};

initCapacitor();

createRoot(document.getElementById('root')!).render(<App />);
