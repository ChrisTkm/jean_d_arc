---
title: Tablas y Entidades
description: Definición de tablas del schema remuneraciones
sidebar:
  label: Tablas
  order: 2
updated: 2025-12-17
---

Descripción detallada de las tablas principales del schema `remuneraciones`.

## 1. Liquidaciones (Header)

Tabla: `remuneraciones.liquidaciones`  
Archivo: `tbl/012_tbl_liquidaciones.sql`

Representa la **cabecera** de una liquidación de sueldo. Almacena los totales consolidados y el estado del proceso.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único. |
| `empleado_id` | UUID | Referencia al empleado. |
| `contrato_id` | UUID | Referencia al contrato vigente. |
| `año`, `mes` | Smallint | Período de remuneración. |
| `total_haberes` | Numeric | Suma total de haberes. |
| `total_descuentos` | Numeric | Suma total de descuentos. |
| `total_liquido` | Numeric | Monto final a pagar (`haberes - descuentos`). |
| `estado` | Text | `BORRADOR`, `CALCULADA`, `APROBADA`, `PAGADA`. |

:::caution[Legacy Columns]
Esta tabla contiene columnas individuales como `sueldo_base`, `gratificacion`, etc. Se mantienen por compatibilidad, pero **el valor real se debe reconstruir desde `liquidaciones_detalle`**.
:::

## 2. Detalle de Liquidación

Tabla: `remuneraciones.liquidaciones_detalle`  
Archivo: `tbl/013_tbl_liquidaciones_detalle.sql`

Almacena el desglose ítem por ítem. Es la **fuente de verdad** para la contabilidad y la impresión de la liquidación.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `liquidacion_id` | UUID | FK a la cabecera. |
| `concepto_id` | Integer | FK al catálogo de conceptos. |
| `monto` | Numeric | Valor calculado del ítem. |
| `origen` | Text | `AUTOMATICO` (motor) o `MANUAL` (modificación user). |

### Trigger de Recálculo
Existe un trigger `trg_recalcular_totales_detalle` que, al modificar esta tabla, actualiza automáticamente los totales (`total_haberes`, `total_liquido`, etc.) en la tabla padre `liquidaciones`.

## 3. Conceptos de Remuneración

Tabla: `remuneraciones.conceptos_remuneracion`  
Archivo: `tbl/001_conceptos_remuneracion_refactored.sql`

Catálogo maestro que define las reglas de negocio y contables para cada ítem.

### Tipos de Concepto (`tipo_concepto`)
- **HABER**: Aumenta el líquido (Sueldo, Bonos).
- **DESCUENTO**: Disminuye el líquido (AFP, Salud).
- **APORTE_PATRONAL**: Costo empresa, no afecta líquido trabajador (SIS, Mutual).
- **PROVISION**: Reservas de dinero (Vacaciones, Gratificación).

### Integración Contable
Cada concepto tiene asignado:
- `cuenta_debe_codigo`: Dónde cargar (Gasto).
- `cuenta_haber_codigo`: Dónde abonar (Pasivo).

Ejemplo:
- **Sueldo Base**: Debe `3201001` (Gasto Sueldos) / Haber `2104001` (Sueldos por Pagar).

## 4. Empleados

Tabla: `remuneraciones.empleados`  
Archivo: `tbl/002_tbl_empleados.sql`

Maestro de trabajadores. Centraliza datos personales, previsionales y de pago.

| Columna | Uso Principal |
| :--- | :--- |
| `rut` | Identificador fiscal único. |
| `afp_id`, `isapre_id` | Determinantes para cálculo de leyes sociales. |
| `banco`, `numero_cuenta` | Datos para archivo de transferencias. |
| `sueldo_base` | (En tabla contratos, pero referenciado aquí para lógica). |

:::tip[Indices]
La tabla está altamente indexada por `rut`, `email` y `estado_empleado` para optimizar búsquedas en el sistema administrativo.
:::
