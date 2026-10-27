import type { MetadataRoute } from 'next';
import { BRAND_ICON_URL } from './lib/brand';

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
      { src: BRAND_ICON_URL, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/brand/schedmaster-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/schedmaster-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
    ]
  };
}
