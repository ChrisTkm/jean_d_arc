---
title: Diagramas
description: Modelos visuales del sistema de remuneraciones
sidebar:
  label: Diagramas
  order: 4
updated: 2025-12-17
---

## Modelo Entidad-Relación (ERD)

Estructura de datos central del módulo de remuneraciones.

```mermaid
erDiagram
    EMPLEADOS ||--o{ CONTRATOS : tiene
    CONTRATOS ||--o{ LIQUIDACIONES : genera
    
    LIQUIDACIONES ||--o{ LIQUIDACIONES_DETALLE : contiene
    
    CONCEPTOS_REMUNERACION ||--o{ LIQUIDACIONES_DETALLE : define
    
    PLAN_CONTABLE ||--o{ CONCEPTOS_REMUNERACION : imputa_debe
    PLAN_CONTABLE ||--o{ CONCEPTOS_REMUNERACION : imputa_haber

    %% -- Modulo Asistencia --
    EMPLEADOS ||--o{ ASISTENCIA : registra
    EMPLEADOS ||--o{ VACACIONES : solicita
    
    CONTRATOS }o--|| JORNADAS : asigna
    ASISTENCIA }o--|| JORNADAS : cumple

    LIQUIDACIONES {
        uuid id PK
        uuid empleado_id
        smallint ano
        smallint mes
        numeric total_liquido
        text estado
    }

    LIQUIDACIONES_DETALLE {
        uuid liquidacion_id PK
        int concepto_id PK
        numeric monto
    }

    CONCEPTOS_REMUNERACION {
        int id PK
        string codigo
        string cuenta_debe_codigo
        string cuenta_haber_codigo
    }
    
    ASISTENCIA {
        uuid empleado_id PK
        date fecha PK
        uuid jornada_id FK
        text estado_asistencia
        time hora_entrada
        time hora_salida
    }
```

## Flujo de Cálculo (Sequence Diagram)

Cómo interactúan los procedimientos almacenados durante la generación de una liquidación.

```mermaid
sequenceDiagram
    participant FE as Frontend/API
    participant SP as sp_liquidacion_generar
    participant FX as fx_liquidacion_previa
    participant DB as Tablas (Liquidaciones)

    FE->>SP: Generar Liquidación (Mes X)
    
    rect rgba(0, 0, 0, 0.1)
    note right of SP: Fase 1: Cálculo en Memoria
    SP->>FX: Calcular montos (sin guardar)
    FX->>FX: Cargar Contrato + Asistencia
    FX->>FX: Calcular Haberes
    FX->>FX: Calcular Descuentos Legales
    FX->>FX: Calcular Impuesto Único
    FX-->>SP: Retorna Estructura {Header, Detalles[]}
    end

    rect rgba(0, 0, 0, 0.1)
    note right of SP: Fase 2: Persistencia
    SP->>DB: INSERT/UPDATE liquidaciones (Header)
    SP->>DB: DELETE liquidaciones_detalle (Limpieza)
    loop Para cada Concepto > 0
        SP->>DB: INSERT liquidaciones_detalle (con Concepto ID)
    end
    end

    SP-->>FE: Retorna ID Liquidación + Resumen
```

## Generación de Imposiciones

Flujo de consolidación de aportes previsionales (Post-Liquidación).

```mermaid
graph TD
    LIQ[Liquidaciones Detalle] -->|Agregación por Concepto| SVC(Previsions Service)
    HON[Honorarios] -->|Agregación Retención| SVC
    
    SVC -->|Mapeo| ENT[Entidades Previsionales]
    
    ENT -->|AFP| AFP[Tabla Imposiciones: AFP]
    ENT -->|Salud| SAL[Tabla Imposiciones: ISAPRE/FONASA]
    ENT -->|Mutual| MUT[Tabla Imposiciones: MUTUAL]
    ENT -->|Impuesto| SII[Tabla Imposiciones: SII]
    
    subgraph Orchestrator Domain
    SVC
    end
    
    subgraph PostgreSQL Tables
    LIQ
    HON
    AFP
    SAL
    MUT
    SII
    end
```
