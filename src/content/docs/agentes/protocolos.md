---
title: Protocolos de Operación
description: Reglas de interacción y flujos de trabajo entre agentes.
sidebar:
  label: Protocolos
  order: 7
---

import { Steps, Aside } from '@astrojs/starlight/components';

Para que el enjambre funcione, los agentes deben seguir protocolos estrictos de comunicación y ejecución de tareas.

## 📅 El Protocolo Diario ("Qué hay para hoy")

Este es el loop de control principal que sincroniza a los agentes con la realidad del proyecto.

<Steps>

1.  **Invocación**: El usuario o un evento del sistema despierta al agente con el comando "Qué hay para hoy".
2.  **Consulta de Memoria (MCP)**:
    *   El agente utiliza la herramienta `mcp_mongodb-mcp-server_find`.
    *   Consulta la colección `tasks` filtrando por su `agent_id` (ej: `agent: 'sevastopol'`) y estado `pending`.
3.  **Environmental Scan**:
    *   El agente no confía ciegamente en la lista. Mira su entorno inmediato (git status, errores recientes, deuda técnica visible).
4.  **Planificación**:
    *   Cruza las tareas asignadas con los hallazgos del entorno.
    *   Propone un plan de ejecución priorizado en el chat.
5.  **Ejecución & Reporte**:
    *   A medida que completa tareas, actualiza su estado en la BD (`completed`).
    *   Genera artefactos de prueba (Walkthroughs).

</Steps>

## 📡 Delegación de Tareas

Cuando un agente encuentra un problema fuera de su dominio, **no debe intentar resolverlo mal**. Debe delegar.

### Flujo de Delegación

1.  **Identificación**: "Esto es lógica de negocio compleja, no debo hacerlo en el frontend" (dice Sevastopol).
2.  **Invocación**: "@Orchestrator, necesito un endpoint para calcular X".
3.  **Registro**: Si el otro agente no está activo en la sesión, se deja una tarea pendiente en la memoria compartida (MongoDB) para él.

## 🧠 Gestión de Memoria

El conocimiento no debe ser efímero.

*   **Documentación (Largo Plazo)**: Si s aprendió algo estructural, se actualiza en **Jean d'Arc**.
*   **Tareas (Corto/Medio Plazo)**: Si hay algo pendiente, va a **MongoDB**.
*   **Contexto (Inmediato)**: Se mantiene en el `context.md` o historial del chat actual.

<Aside type="caution">
Nunca hardcodear secretos o IPs en la memoria compartida. Usar referencias a Vaults o Variables de Entorno.
</Aside>
