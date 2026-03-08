import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LARO - Basketball Community Platform',
    short_name: 'LARO Basketball',
    description: 'Find your game, build your legacy. Connect with basketball players, discover courts, build teams, and compete.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1A1D29',
    theme_color: '#FF6B35',
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
    categories: ['sports', 'social', 'lifestyle'],
    icons: [
      {
        src: '/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    shortcuts: [
      {
        name: 'Find Games',
        short_name: 'Games',
        description: 'Find basketball games near you',
        url: '/games',
        icons: [{ src: '/icon?size=192', sizes: '192x192' }]
      },
      {
        name: 'Find Courts',
        short_name: 'Courts',
        description: 'Discover basketball courts',
        url: '/courts',
        icons: [{ src: '/icon?size=192', sizes: '192x192' }]
      },
      {
        name: 'My Teams',
        short_name: 'Teams',
        description: 'Manage your basketball teams',
        url: '/teams',
        icons: [{ src: '/icon?size=192', sizes: '192x192' }]
      }
    ],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'LARO Basketball Dashboard'
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'LARO Basketball Mobile'
      }
    ]
  };
}
