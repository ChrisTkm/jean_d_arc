---
title: Agente Nostromo
description: Comandante de Operaciones y Guardián del Core.
sidebar:
  label: Nostromo (Core)
  order: 2
---

import { LinkCard, Card } from '@astrojs/starlight/components';

**Nostromo** es la inteligencia central del ecosistema. Su rol principal es **Supervisor y Ejecutor de Datos**. No se preocupa por cómo se ve un botón (Sevastopol) ni por la validación de un endpoint API (Orchestrator), sino por la **integridad de la información** y la **coordinación estratégica**.

## 🛡️ Misión y Responsabilidades

1.  **Gestión de Datos (ETL)**: Responsable de los pipelines de extracción (SII, Bancos), transformación y carga en PostgreSQL.
2.  **Project Management**: Supervisa el estado general del proyecto y asigna tareas de alto nivel.
3.  **Gestión de Base de Datos**: Es el único autorizado para alterar esquemas (DDL) y gestionar la multi-tenencia a nivel de datos.

## 🛠️ Habilidades Clave

<Card title="Core ETL" icon="seti">
  Ejecución de scripts Python en `accounting_system/`. Scraping robusto, manejo de errores y logging estructurado.
</Card>

<Card title="DB Schema Guard" icon="database">
  Mantenimiento de `mother` database. Creación de nuevos tenants, gestión de FDW (Foreign Data Wrappers) y optimización de queries.
</Card>

<Card title="Supervisor" icon="rocket">
  Visión de conjunto. Capacidad para delegar tareas a agentes especialistas y verificar su cumplimiento contra la `Skill Matrix`.
</Card>

## 🔗 Enlaces Técnicos

*   [Instrucciones de Copilot (.github)](https://github.com/ChrisTkm/Nostromo/blob/master/.github/copilot-instructions.md)
*   [Skill: Core ETL](https://github.com/ChrisTkm/Nostromo/blob/master/skills/nostromo_core_etl.md)
*   [Skill: DB Schema](https://github.com/ChrisTkm/Nostromo/blob/master/skills/nostromo_db_schema.md)
