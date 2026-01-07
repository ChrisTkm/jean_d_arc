import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import mermaid from 'astro-mermaid';
import starlightThemeNova from 'starlight-theme-nova';


export default defineConfig({
  site: 'https://jean-d-arc.pages.dev',
  integrations: [
    mermaid(),
    tailwind({ applyBaseStyles: false }), // No sobrescribir estilos de Starlight
    starlight({
      plugins: [starlightThemeNova()],
      title: "Documentación Jean d'Arc",
      logo: {
        src: './public/icon_jean_d_arc.svg',
      },
      customCss: ['./src/styles/custom.css'],
      favicon: '/icon_jean_d_arc.svg',
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
          autogenerate: { directory: 'accounting' }
        },
        {
          label: 'Arquitectura',
          autogenerate: { directory: 'arquitectura' }
        },
        {
          label: 'API',
          autogenerate: { directory: 'api' }
        },
        {
          label: 'Sevastopol (Frontend)',
          autogenerate: { directory: 'sevastopol' }
        },
        {
          label: 'Orchestrator (Backend)',
          items: [
            { label: 'Overview', link: '/orchestrator/' },
            { 
              label: 'Services', 
              autogenerate: { directory: 'orchestrator/services' } 
            },
            {
              label: 'Monitoring',
              autogenerate: { directory: 'orchestrator/monitoring' }
            }
          ]
        },
        {
          label: 'Mother (Database)',
          autogenerate: { directory: 'mother' }
        },
        {
          label: 'Seguridad',
          autogenerate: { directory: 'seguridad' }
        },
        {
          label: 'Subidas',
          autogenerate: { directory: 'subidas' }
        },
      ],
      expressiveCode: {
        themes: ['github-dark', 'github-light'],
      },
  // i18n: {
  //   defaultLocale: 'es',
  //   locales: {
  //     es: { label: 'Español' }
  //   }
  // }
    })
  ]
});
