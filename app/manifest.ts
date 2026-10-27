import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SchedMaster · Gimnasio UTEQ',
    short_name: 'SchedMaster',
    description: 'Convocatorias, rutinas y asistencias del gimnasio universitario.',
    start_url: '/anuncios',
    scope: '/',
    display: 'standalone',
    background_color: '#f6f9fd',
    theme_color: '#124a9c',
    lang: 'es-MX',
    icons: [
      { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  };
}
