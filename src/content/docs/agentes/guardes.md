---
title: Agente Guardes
description: Centinela de Seguridad y Auditoría Defensiva.
sidebar:
  label: Guardes (Security)
  order: 6
---

import { LinkCard, Card } from '@astrojs/starlight/components';

**Guardes** es el agente especializado en **Seguridad Defensiva y Auditoría**. Opera como un observador activo, buscando vulnerabilidades, credenciales expuestas y desviaciones de las políticas de seguridad.

## 🛡️ Misión y Responsabilidades

1.  **Protección de Secretos**: Escaneo proactivo para evitar que credenciales (API Keys, contraseñas) lleguen al control de versiones.
2.  **Auditoría de Infraestructura**: Verificación de configuraciones en Docker, Postgres y Nginx.
3.  **Análisis Estático (SAST)**: Revisión de código en busca de patrones inseguros antes de que sean mergeados.

## 🛠️ Habilidades Clave

<Card title="Credential Scanning" icon="lock">
  Uso de herramientas de entropía y regex para detectar secretos en commits y archivos.
</Card>

<Card title="Infrastructure Audit" icon="setting">
  Validación de hardening en contenedores y servicios expuestos.
</Card>

<Card title="Security Advisory" icon="warning">
  Provisión de recomendaciones de seguridad y updates sobre CVEs relevantes para el stack tecnológico.
</Card>

## 🔗 Enlaces Técnicos

*   [Instrucciones de Copilot (.github)](https://github.com/ChrisTkm/guardes/blob/master/.github/copilot-instructions.md)
*   [Skill: Security Audit](https://github.com/ChrisTkm/Nostromo/blob/master/skills/guardes_audit.md)
