---
title: Seguridad del Sistema
description: Visión general de la estrategia de seguridad en el ecosistema contable.
sidebar:
  label: Introducción
  order: 1
---

La seguridad en el ecosistema Nostromo/Jean d'Arc se basa en el principio de **Defensa en Profundidad**, implementando controles en cada capa de la arquitectura, desde la infraestructura hasta la interfaz de usuario.

## Pilares de Seguridad

### 1. Autenticación Robusta

El acceso al sistema está protegido por un esquema de autenticación basado en **JWT (JSON Web Tokens)**. Ninguna ruta de API crítica es accesible sin credenciales válidas.

- [Ver Detalles de Autenticación](/seguridad/autenticacion/)

### 2. Aislamiento de Datos (Multi-Tenancy)

Cada cliente (Tenant) opera en un **esquema de base de datos aislado**. Esto previene la filtración de datos entre organizaciones a nivel estructural, no solo lógico.

- El `TenantResolver` asegura que un usuario solo pueda conectar con su esquema asignado.

### 3. Protección de Secretos

Todas las credenciales, llaves de API y secretos de criptografía se manejan exclusivamente a través de **Variables de Entorno Server-Side**.

- El repositorio de código no contiene credenciales hardcodeadas (verificado por auditorías automatizadas).
- En producción (Cloudflare/Render), los secretos se inyectan en tiempo de ejecución.

## Mapa de Riesgos

| Amenaza | Mitigación Implementada |
| --- | --- |
| **SQL Injection** | Uso estricto de `pg-pool` con consultas parametrizadas (`$1, $2`). |
| **XSS (Cross-Site Scripting)** | React/Astro escapan el output por defecto. Headers de seguridad configurados. |
| **Brute Force** | Rate Limiting en endpoints de login (pendiente de configuración en Nginx/Gateway). |
| **Data Leakage** | Logs sanitizados y esquemas de base de datos segregados. |

## Auditoría Continua

El código es auditado regularmente para detectar patrones inseguros:

- Revisión de dependencias (`npm audit`).
- Análisis estático de código.
- Revisión manual de commits sensibles.
