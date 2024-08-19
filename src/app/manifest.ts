import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Doctor Dok',
    short_name: 'Doctor Dok',
    description: 'Secure Health folder with AI assistant',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/img/doctor-dok-logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}