import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import mermaid from 'astro-mermaid';
import starlightThemeNova from 'starlight-theme-nova';


export default defineConfig({
  site: 'https://docs.jean-d-arc.local', // TODO: reemplazar por dominio definitivo
  integrations: [
    mermaid(),
    tailwind({ applyBaseStyles: false }), // No sobrescribir estilos de Starlight
    starlight({
      plugins: [starlightThemeNova()],
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
                { label: 'Motor de Cálculo', link: '/accounting/remuneraciones/motor-calculo/' },
                { label: 'Gen. Imposiciones', link: '/accounting/remuneraciones/generacion-imposiciones/' },
                { label: 'Generación Honorarios', link: '/accounting/remuneraciones/generacion-honorarios/' },
                { label: 'Testing', link: '/accounting/remuneraciones/test-payroll/' },
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
