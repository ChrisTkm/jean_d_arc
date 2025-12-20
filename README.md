# 📚 Project Jean d'Arc

> **"La Sabiduría" del Ecosistema Contable.**

Este repositorio contiene la **documentación centralizada, guías de arquitectura y manuales de usuario** para el Sistema Contable compuesto por **Sevastopol** (Frontend) y **Nostromo** (Core Backend).

Construido sobre **Astro Starlight**, Jean d'Arc sirve como la fuente de verdad única para desarrolladores y usuarios finales.

## 🎯 Objetivo

En un sistema complejo con múltiples módulos (Contabilidad, Remuneraciones, Inventario) y una arquitectura distribuida (Islands + API REST), la información dispersa es un riesgo. **Jean d'Arc** resuelve esto centralizando:

*   **Documentación Técnica**: Diagramas ER, flujos de datos (ETLs), y contratos de API.
*   **Guías de Estilo**: Sistema de Diseño Atómico, uso de componentes UI.
*   **Manuales de Usuario**: Guías paso a paso para operar el sistema contable.
*   **Onboarding**: Cómo levantar el entorno de desarrollo (Sevastopol + Nostromo).

## 🛠️ Stack Tecnológico

*   **Framework**: [Astro](https://astro.build/)
*   **Theme**: [Starlight](https://starlight.astro.build/) (Optimizado para documentación)
*   **Despliegue**: Estático / Vercel (o similar)
*   **Contenido**: Markdown / MDX

## 📂 Estructura del Conocimiento

```text
src/content/docs/
├── intro/              # Visión general del proyecto
├── arquitectura/       # Decisiones técnicas (Islands, FastAPI, DB Schema)
├── modulos/            # Documentación específica por dominio
│   ├── contabilidad/   # Plan de cuentas, Asientos
│   ├── rrhh/           # Fórmulas de sueldos, Asistencia
│   └── inventario/     # Kardex, Bodegas
└── guias/              # Manuales de usuario final
```

## 🚀 Inicio Rápido

Para correr la documentación localmente:

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Visita `http://localhost:4321` para ver la documentación.

---

<div align="center">
  <sub>Parte del ecosistema <b>Albornoz Accounting System</b>.</sub>
</div>
