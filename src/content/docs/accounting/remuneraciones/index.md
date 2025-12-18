---
title: Schema de Remuneraciones
description: Documentación técnica del módulo de remuneraciones (PostgreSQL)
sidebar:
  label: Overview
  order: 1
updated: 2025-12-17
---

Este módulo gestiona el cálculo de remuneraciones, liquidaciones, leyes sociales e historial de pagos. Está diseñado bajo una arquitectura **Master-Detail** y fuertemente integrado con el plan contable.

## Arquitectura General

El schema `remuneraciones` centraliza toda la lógica de nómina. Su núcleo es la relación entre la cabecera de la liquidación y sus detalles desglosados concepto por concepto.

:::note[Integración Contable]
A diferencia de sistemas antiguos, aquí **cada concepto de remuneración** (haber o descuento) sabe exactamente a qué cuenta contable imputarse. Esto permite generar el asiento contable de remuneraciones de forma automática.
:::

## Componentes Principales

### 1. Maestro de Empleados
Tabla `empleados`. Contiene la información contractual, personal y previsional. Es la base para cualquier cálculo.

### 2. Definición de Conceptos
Tabla `conceptos_remuneracion`. Catálogo maestro que define:
- **Qué es**: Haber, Descuento, Aporte Patronal.
- **Cómo se calcula**: Fórmula, Monto Fijo, Porcentaje.
- **Dónde se contabiliza**: Cuentas de Gasto, Pasivo, etc.

### 3. Motor de Cálculo
Stored Procedure `sp_liquidacion_generar`. Orquesta el proceso:
1. Calcula haberes y descuentos usando funciones especializadas.
2. Genera una "pre-liquidación" en memoria.
3. Persiste el resultado en `liquidaciones` (totales) y `liquidaciones_detalle` (desglose).

## Flujo de Datos

```mermaid
graph TD
    EMP[Empleados] --> CALC(Motor de Cálculo)
    CON[Conceptos] --> CALC
    NOV[Novedades/Asistencia] --> CALC
    
    CALC -->|Genera| LIQ[Liquidaciones (Header)]
    CALC -->|Desglosa| DET[Liquidaciones Detalle]
    
    DET -.->|Imputación| CONT[Contabilidad]
```

## Ubicación del Código

Todos los objetos de base de datos se encuentran en:
`Nostromo/db/accounting_template/remuneraciones/`

- **Tablas**: `/tbl`
- **Funciones (Lógica)**: `/fx`
- **Procedimientos (Orquestación)**: `/sp`
