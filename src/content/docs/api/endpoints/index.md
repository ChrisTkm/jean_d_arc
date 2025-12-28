---
title: API - Endpoints
head: []
sidebar:
  label: Endpoints
  order: 1
---
## API - Endpoints

---

## Autenticación

Todos los endpoints (excepto `/health` y `/auth/login`) requieren un token JWT válido.
Se debe enviar en el header: `Authorization: Bearer <TOKEN>`.

---

## Módulo: Remuneraciones

### Liquidaciones (Payroll)

`Base URL: /remuneraciones/payroll`

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/` | Lista liquidaciones con filtros para la vista general. |
| `GET` | `/resumen` | Obtiene un resumen agrupado por departamento. |
| `GET` | `/vista/:id` | Obtiene el encabezado y totales de una liquidación específica. |
| `GET` | `/:id/details` | Lista todos los conceptos (haberes/descuentos) de una liquidación. |
| `POST` | `/generar` | Ejecuta el motor de cálculo para generar liquidaciones. |
| `POST` | `/preview` | Simula una liquidación en memoria sin guardarla en BD. |
| `PATCH` | `/:id` | Actualiza metadatos (ej. URL del PDF firmado). |
| `DELETE` | `/:id` | Elimina una liquidación (si no está cerrada). |

### Honorarios

`Base URL: /remuneraciones/honorarios`

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/` | Lista boletas de honorarios por periodo. |
| `POST` | `/generar` | Importa y procesa boletas desde el SII para un periodo dado. |

---

## Módulo: Gestión de Personal

### Empleados

`Base URL: /remuneraciones/employees`

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/` | Lista empleados (soporta filtros `scope=activos`, `q=busqueda`). |
| `POST` | `/` | Crea un nuevo empleado. |
| `PUT` | `/` | Actualiza datos de un empleado (requiere `?id=UUID`). |
| `DELETE` | `/` | Elimina un empleado (requiere `?id=UUID`). |

### Contratos

`Base URL: /remuneraciones/contracts`

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/` | Lista contratos. Filtros por `empleado_id`, `id`. |
| `POST` | `/` | Crea un nuevo contrato (genera documento PDF automáticamente). |
| `PUT` | `/` | Actualiza metadatos del contrato (requiere `?id=UUID`). |
| `DELETE` | `/` | Elimina un contrato (requiere `?id=UUID`). |
| `GET` | `/:id/download` | Descarga el contrato generaod (`?fmt=pdf/docx`). |
