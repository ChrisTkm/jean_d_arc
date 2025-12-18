import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://docs.jean-d-arc.local', // TODO: reemplazar por dominio definitivo
  integrations: [
    tailwind({ applyBaseStyles: false }), // No sobrescribir estilos de Starlight
    starlight({
      title: "Documentación Jean d'Arc",
      favicon: '/favicon.svg',
      head: [],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/ChrisTkm/Nostromo'
        }
      ],
      sidebar: [
        {
          label: 'Introducción',
          items: [
            { label: 'Bienvenida', link: '/introduccion/' }
          ]
        },
        {
          label: 'Sistema Contable',
          items: [
            { label: 'Visión General', link: '/accounting/sistema-contable/' },
            {
              label: 'Remuneraciones',
              items: [
                { label: 'Overview', link: '/accounting/remuneraciones/' },
                { label: 'Tablas', link: '/accounting/remuneraciones/tablas/' },
                { label: 'Cálculos', link: '/accounting/remuneraciones/calculos/' },
                { label: 'Diagramas', link: '/accounting/remuneraciones/diagramas/' }
              ]
            }
          ]
        },
        {
          label: 'Arquitectura',
          items: [
            { label: 'Vista General', link: '/arquitectura/overview/' },
            { label: 'Diagramas', link: '/arquitectura/diagramas/' }
          ]
        },
        {
          label: 'API',
          items: [
            { label: 'Endpoints', link: '/api/endpoints/' },
            { label: '🔗 Demo en vivo', link: '/demo-api/' }
          ]
        },
        {
          label: 'Seguridad',
          items: [
            { label: 'Buenas Prácticas', link: '/seguridad/practicas/' },
            { label: 'Limpieza', link: '/seguridad/limpieza/' }
          ]
        },
        {
          label: 'Subidas',
          items: [
            { label: 'Scripts', link: '/subidas/' }
          ]
        },
      ],
  // i18n: {
  //   defaultLocale: 'es',
  //   locales: {
  //     es: { label: 'Español' }
  //   }
  // }
    })
  ]
});
