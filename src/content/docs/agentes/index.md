---
title: Ecosistema de Agentes
description: Visión general del enjambre de inteligencias artificiales que operan Nostromo.
sidebar:
  label: Overview
  order: 1
---

import { CardGrid, LinkCard } from '@astrojs/starlight/components';

El **Ecosistema Nostromo** no es solo un conjunto de repositorios de código; es una operación coordinada por múltiples agentes especializados. Cada agente tiene un **rol**, un **dominio de expertise** y un **protocolo de comunicación**.

## 🧬 La Filosofía del Enjambre

> *"División de preocupaciones, unidad de propósito."*

En lugar de una única "Super IA" que intenta hacerlo todo, dividimos la cognición en roles especialistas. Esto reduce la tasa de alucinaciones, mejora la mantenibilidad y permite una evolución modular.

### Roles Fundamentales

<CardGrid>
  <LinkCard
    title="Nostromo (Comandante)"
    href="/agentes/nostromo/"
    description="El núcleo central. Supervisa la operación global, gestiona la base de datos y ejecuta pipelines ETL."
  />
  <LinkCard
    title="Orchestrator (Backend)"
    href="/agentes/orchestrator/"
    description="El arquitecto de la verdad. Protege la lógica de negocio, la seguridad y la integridad de los datos."
  />
  <LinkCard
    title="Sevastopol (Frontend)"
    href="/agentes/sevastopol/"
    description="El diseñador de experiencias. Se enfoca en la interfaz de usuario, usabilidad y rendimiento visual."
  />
  <LinkCard
    title="Jean d'Arc (Docs)"
    href="/agentes/jean_d_arc/"
    description="El bibliotecario. Mantiene esta documentación y asegura que el conocimiento sea accesible y veraz."
  />
    <LinkCard
    title="Guardes (Seguridad)"
    href="/agentes/guardes/"
    description="El centinela. Auditoría defensiva, escaneo de vulnerabilidades y protección de secretos."
  />
</CardGrid>

---

## 🧠 Matriz de Habilidades (Skill Matrix)

La **Skill Matrix** es el ADN compartido del sistema. Define qué sabe hacer cada agente y dónde reside esa autoridad.

:::note[Fuente de Verdad]
El archivo maestro de habilidades reside técnicamente en `Nostromo/skill_matrix.md`. Esta sección de la documentación es su representación humana y navegable.
:::

Cada agente consume archivos de habilidad (.md) específicos para ejecutar tareas complejas sin necesidad de reentrenamiento, usando RAG (Retrieval-Augmented Generation) o contexto directo.

## 🤝 Protocolos de Interacción

Los agentes no trabajan aislados. Se comunican a través de:

1.  **Instrucciones Directas**: Archivos `.github/copilot-instructions.md` en cada repo.
2.  **Memoria Compartida**: Tareas persistidas en MongoDB.
3.  **Delegación**: Un agente puede solicitar la intervención de otro si la tarea escapa su dominio.

Ver [Protocolos de Operación](/agentes/protocolos/) para más detalles.
