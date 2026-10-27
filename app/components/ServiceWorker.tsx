'use client';

import { useEffect } from 'react';

export default function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(error => console.error('No se pudo registrar la PWA:', error));
    }
  }, []);
  return null;
}
