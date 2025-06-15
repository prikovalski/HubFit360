
import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import './index.css';

// Lazy load dos componentes principais
const App = lazy(() => import('./App.tsx'));
const PWARegister = lazy(() => import('./components/pwa/PWARegister.tsx'));

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
