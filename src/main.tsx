
import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import './index.css';
import App from './App';
import PWARegister from './components/pwa/PWARegister';

// Loading inicial crítico
const InitialLoader = () => (
  <div className="loading-screen">
    <div className="loading-spinner"></div>
  </div>
);

const root = createRoot(document.getElementById("root")!);

root.render(
  <Suspense fallback={<InitialLoader />}>
    <App />
    <PWARegister />
  </Suspense>
);
