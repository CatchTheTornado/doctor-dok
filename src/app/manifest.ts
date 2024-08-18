import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Patient Pad',
    short_name: 'Patient Pad',
    description: 'Secure Health folder with AI assistant',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/img/patient-pad-logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}