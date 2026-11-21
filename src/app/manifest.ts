import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WoHoTech - Learn, Create, Grow',
    short_name: 'WoHoTech',
    description:
      'Free CS courses, 125+ tools, coding problems, and AI assistant for engineering students.',
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0b1220',
    theme_color: '#2563eb',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Subjects',
        short_name: 'Subjects',
        description: 'Browse all CS and engineering courses',
        url: '/subjects',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Problems',
        short_name: 'Problems',
        description: 'Practice coding problems with online judge',
        url: '/problems',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Tools',
        short_name: 'Tools',
        description: 'Free online tools and calculators',
        url: '/tools',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'WoHo AI',
        short_name: 'AI',
        description: 'AI assistant for study and coding help',
        url: '/assistant',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
