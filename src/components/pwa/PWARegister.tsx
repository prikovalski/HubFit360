
import { useEffect } from 'react';

const PWARegister = () => {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('PWA: Service Worker registered successfully:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('PWA: New content available, refresh to update');
                    // You could show a toast here to inform the user about the update
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.log('PWA: Service Worker registration failed:', error);
          });
      });
    } else {
      console.log('PWA: Service Worker not supported');
    }
  }, []);

  return null;
};

export default PWARegister;
