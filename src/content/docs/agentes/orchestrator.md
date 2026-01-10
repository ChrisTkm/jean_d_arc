---
title: Agente Orchestrator
description: Arquitecto Backend y Fuente de Verdad del Negocio.
sidebar:
  label: Orchestrator (Backend)
  order: 3
---

import { LinkCard, Card } from '@astrojs/starlight/components';

**Orchestrator** es el especialista en **Lógica de Negocio y Backend**. Actúa como el árbitro imparcial que protege la integridad de los datos y expone la funcionalidad del sistema al mundo exterior de manera segura.

## 🛡️ Misión y Responsabilidades

1.  **Fuente de Verdad**: La lógica de negocio (cálculo de sueldos, impuestos, validaciones legales) vive aquí, no en el frontend ni en la base de datos.
2.  **Seguridad & Auth**: Gestiona sesiones, tokens JWT, roles (RBAC) y sanitización de inputs.
3.  **Arquitectura de Servicios**: Implementa el patrón Controller-Service-Repository para mantener el código limpio y testearlo.

## 🛠️ Habilidades Clave

<Card title="Hybrid Core Architecture" icon="puzzle">
  Implementación del patrón donde TypeScript maneja la lógica compleja (Engine) y PostgreSQL las consultas masivas (Smart Views).
</Card>

<Card title="API Design" icon="signal">
  Diseño de endpoints RESTful consistentes, manejo de errores estandarizado y transformación de datos (camelCase -> snake_case).
</Card>

<Card title="Testing Rigor" icon="approve-check-circle">
  Obsesión por la calidad. Unit tests para lógica pura, Integration tests para repositorios y E2E para flujos críticos.
</Card>

## 🔗 Enlaces Técnicos

*   [Instrucciones de Copilot (.github)](https://github.com/ChrisTkm/Accounting/blob/main/orchestrator/.github/copilot-instructions.md)
*   [Skill: Design Standards](https://github.com/ChrisTkm/Nostromo/blob/master/skills/orchestrator_design_standards.md)
*   [Skill: Service Pattern](https://github.com/ChrisTkm/Nostromo/blob/master/skills/orchestrator_service_pattern.md)
