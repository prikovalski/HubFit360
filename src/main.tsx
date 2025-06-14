
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import PWARegister from './components/pwa/PWARegister.tsx'

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <PWARegister />
  </>
);
