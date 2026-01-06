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
      head: [
        {
          tag: 'script',
          content: `
            // Mermaid Zoom & Pan functionality
            document.addEventListener('DOMContentLoaded', function() {
              setTimeout(initMermaidZoom, 500);
              // Re-init on navigation (for SPA)
              document.addEventListener('astro:page-load', () => setTimeout(initMermaidZoom, 300));
            });

            function initMermaidZoom() {
              const mermaidElements = document.querySelectorAll('.mermaid, pre.mermaid, .astro-mermaid, [data-mermaid]');
              
              mermaidElements.forEach((el, index) => {
                if (el.dataset.zoomInit) return;
                el.dataset.zoomInit = 'true';
                
                const svg = el.querySelector('svg');
                if (!svg) return;
                
                // State
                let scale = 1;
                let translateX = 0;
                let translateY = 0;
                let isDragging = false;
                let startX, startY;
                
                // Wrap in container
                const container = document.createElement('div');
                container.className = 'mermaid-container';
                container.style.cssText = 'position:relative;overflow:hidden;border:1px solid #e5e7eb;border-radius:8px;margin:1rem 0;min-height:100px;';
                el.parentNode.insertBefore(container, el);
                container.appendChild(el);
                
                // Add controls
                const controls = document.createElement('div');
                controls.className = 'mermaid-zoom-controls';
                controls.innerHTML = \`
                  <button class="mermaid-zoom-btn" data-action="zoomin" title="Zoom In">+</button>
                  <button class="mermaid-zoom-btn" data-action="zoomout" title="Zoom Out">−</button>
                  <button class="mermaid-zoom-btn" data-action="reset" title="Reset">⟲</button>
                  <button class="mermaid-zoom-btn" data-action="fullscreen" title="Fullscreen">⛶</button>
                \`;
                container.appendChild(controls);
                
                // Add hint
                const hint = document.createElement('div');
                hint.className = 'mermaid-hint';
                hint.textContent = '🖱️ Scroll para zoom • Arrastra para mover';
                container.appendChild(hint);
                
                function updateTransform() {
                  svg.style.transform = \`translate(\${translateX}px, \${translateY}px) scale(\${scale})\`;
                  svg.style.transformOrigin = 'center center';
                }
                
                // Wheel zoom
                container.addEventListener('wheel', (e) => {
                  e.preventDefault();
                  const delta = e.deltaY > 0 ? 0.9 : 1.1;
                  scale = Math.min(Math.max(0.5, scale * delta), 5);
                  updateTransform();
                }, { passive: false });
                
                // Drag
                svg.addEventListener('mousedown', (e) => {
                  isDragging = true;
                  startX = e.clientX - translateX;
                  startY = e.clientY - translateY;
                  svg.style.cursor = 'grabbing';
                });
                
                document.addEventListener('mousemove', (e) => {
                  if (!isDragging) return;
                  translateX = e.clientX - startX;
                  translateY = e.clientY - startY;
                  updateTransform();
                });
                
                document.addEventListener('mouseup', () => {
                  isDragging = false;
                  svg.style.cursor = 'grab';
                });
                
                // Button controls
                controls.addEventListener('click', (e) => {
                  const action = e.target.dataset.action;
                  if (action === 'zoomin') { scale = Math.min(scale * 1.2, 5); updateTransform(); }
                  if (action === 'zoomout') { scale = Math.max(scale * 0.8, 0.5); updateTransform(); }
                  if (action === 'reset') { scale = 1; translateX = 0; translateY = 0; updateTransform(); }
                  if (action === 'fullscreen') {
                    if (container.classList.contains('mermaid-fullscreen')) {
                      container.classList.remove('mermaid-fullscreen');
                      document.body.style.overflow = '';
                    } else {
                      container.classList.add('mermaid-fullscreen');
                      document.body.style.overflow = 'hidden';
                    }
                  }
                });
                
                // ESC to exit fullscreen
                document.addEventListener('keydown', (e) => {
                  if (e.key === 'Escape' && container.classList.contains('mermaid-fullscreen')) {
                    container.classList.remove('mermaid-fullscreen');
                    document.body.style.overflow = '';
                  }
                });
              });
            }
          `,
        },
      ],
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
