---
title: Diagramas del Sistema
description: Visualización de la arquitectura y flujos de datos
---

import { Code } from '@astrojs/starlight/components';

## 📊 Diagrama de Usuario - Accounting System

Este diagrama muestra el flujo completo de datos desde servicios externos hasta la base de datos PostgreSQL.

´´´mermaid

´´´

### Componentes Principales

- 🌐 **Servicios Externos**: SII, Previred, Banco Central, OpenAI
- 📦 **Loaders Python**: Scripts de carga de datos
- 🗄️ **Base de Datos**: PostgreSQL con múltiples schemas
- ⚙️ **Stored Procedures**: Lógica de negocio
- 🔧 **Functions**: Cálculos y validaciones

### Código del Diagrama

```mermaid
---
title: Ecosistema Contable (Overview)
---
flowchart LR
    %% External Services
    subgraph External["🌐 Servicios Externos"]
        SII["SII"]
        PREVIRED["Previred"]
        BC["Banco Central"]
        OPENAI["OpenAI"]
    end

    %% Loaders Layer
    subgraph Loaders["⚙️ Python Loaders"]
        BCL["bc_loader.py"]
        I2C["impuesto_2cat_loader.py"]
        PRL["previred_loader.py"]
        SIIL["sii_loader.py"]
        RCS["run_cargas_sii.py"]
    end

    %% Database Layer
    subgraph DB["🗄️ Nostromo (PostgreSQL)"]
        direction TB
        
        subgraph Parametros["Schema: Parametros"]
            direction TB
            PAR_MON["Monedas"]
            PAR_IND["Indicadores"]
            PAR_TAX["Impuestos"]
            PAR_AFP["Tasas AFP/AFC"]
        end

        subgraph Operaciones["Schema: Operaciones"]
            OP_COM["Compras"]
            OP_VEN["Ventas"]
            OP_DET["Detalle C/V"]
        end

        subgraph Remuneraciones["Schema: Remuneraciones"]
            REM_EMP["Empleados"]
            REM_CON["Contratos"]
            REM_LIQ["Liquidaciones"]
            REM_HON["Honorarios"]
        end
        
        %% SPs
        SP_CALC(["⚡ sp_liquidacion_generar"])
        SP_DET(["⚡ sp_generar_detalle"])
    end

    %% Sevastopol Layer
    subgraph Frontend["🖥️ Sevastopol"]
        VIEWS["Islands UI (React)"]
        API["API Clients"]
    end

    %% Connections
    BC -->|API Reference| BCL
    BCL -->|Upsert| PAR_MON

    PREVIRED -->|Scraping| OPENAI
    OPENAI -->|JSON| PRL
    PRL -->|Upsert| PAR_IND & PAR_AFP

    SII -->|Playwright| SIIL & RCS
    SIIL -->|Auth Cookie| RCS
    RCS -->|Insert| OP_COM & OP_VEN
    
    OP_COM & OP_VEN -->|Trigger| SP_DET
    SP_DET -->|Gen| OP_DET

    VIEWS -->|HTTPS/JWT| API
    API -->|SQL/Pool| Remuneraciones
    API -->|Exec| SP_CALC
    SP_CALC -->|Read| REM_EMP & REM_CON & PAR_IND
    SP_CALC -->|Write| REM_LIQ

    %% Styles
    classDef ext fill:#2d2d2d,stroke:#d3095f,stroke-width:2px,color:#fff;
    classDef py fill:#0d1117,stroke:#e3b341,stroke-width:2px,color:#fff;
    classDef db fill:#0d1117,stroke:#2b95d6,stroke-width:2px,color:#fff;
    classDef sp fill:#1f1235,stroke:#8e44ad,stroke-width:2px,stroke-dasharray: 5 5,color:#fff;
    classDef front fill:#0d1117,stroke:#27ae60,stroke-width:2px,color:#fff;

    class SII,PREVIRED,BC,OPENAI ext;
    class BCL,I2C,PRL,SIIL,RCS py;
    class PAR_MON,PAR_IND,PAR_TAX,PAR_AFP,OP_COM,OP_VEN,OP_DET,REM_EMP,REM_CON,REM_LIQ,REM_HON db;
    class SP_CALC,SP_DET sp;
    class VIEWS,API front;
```

### Leyenda Estilizada

| Color (Borde) | Componente | Descripción |
| :--- | :--- | :--- |
| <span style="color:#d3095f">█</span> Magenta | **Externo** | Servicios fuera de nuestra red. |
| <span style="color:#e3b341">█</span> Amarillo| **Python** | Scripts de extracción y carga (ETLs). |
| <span style="color:#2b95d6">█</span> Cyan | **PostgreSQL** | Tablas y vistas materializadas (Azul claro). |
| <span style="color:#27ae60">█</span> Verde | **Frontend** | Interfaces de usuario en Sevastopol. |
| <span style="color:#8e44ad">█</span> Violeta | **Stored Proc** | Lógica compilada en base de datos. |

### Flujos Principales


#### 1. Carga de Parámetros

#### 1. Carga de Parámetros

```mermaid
flowchart LR
    BC["Banco Central"] -->|API| BCL["bc_loader.py"]
    BCL -->|Inserta| PM["parametros.monedas"]
    
    PR["Previred"] -->|Datos| OAI["OpenAI"]
    OAI -->|JSON| PRL["previred_loader.py"]
    PRL -->|Inserta| PP["parametros.*"]
    
    SII["SII"] -->|Web Scraping| SIIL["sii_loader.py"]
    SIIL -->|Inserta| PI["parametros.impuesto_2cat"]
    
    classDef ext fill:#2d2d2d,stroke:#d3095f,stroke-width:2px,color:#fff;
    classDef py fill:#0d1117,stroke:#e3b341,stroke-width:2px,color:#fff;
    classDef db fill:#0d1117,stroke:#2b95d6,stroke-width:2px,color:#fff;
    
    class BC,PR,SII,OAI ext
    class BCL,PRL,SIIL py
    class PM,PP,PI db
```

#### 2. Operaciones Comerciales

```mermaid
flowchart LR
    SII["SII"] -->|Extrae datos| RCS["run_cargas_sii.py"]
    RCS -->|Inserta| OPC["operaciones.compras"]
    RCS -->|Inserta| OPV["operaciones.ventas"]
    RCS -->|Inserta| OPB["operaciones.boletas"]
    
    OPC -->|Procesa| SP["sp_generar_compras_ventas_detalle()"]
    OPV -->|Procesa| SP
    
    SP -->|Inserta| CVD["operaciones.compras_ventas_detalle"]
    
    classDef ext fill:#2d2d2d,stroke:#d3095f,stroke-width:2px,color:#fff;
    classDef py fill:#0d1117,stroke:#e3b341,stroke-width:2px,color:#fff;
    classDef sp fill:#1f1235,stroke:#8e44ad,stroke-width:2px,stroke-dasharray: 5 5,color:#fff;
    classDef db fill:#0d1117,stroke:#2b95d6,stroke-width:2px,color:#fff;
    
    class SII ext
    class RCS py
    class SP sp
    class OPC,OPV,OPB,CVD db
```

#### 3. Remuneraciones

```mermaid
flowchart LR
    SEV["Sevastopol UI"] -->|Solicita liquidación| ORC["Orchestrator API"]
    
    EMP["remuneraciones.empleados"] -->|Lee datos| SP["sp_liquidacion_generar()"]
    CONT["remuneraciones.contratos"] -->|Lee datos| SP
    
    ORC -->|Ejecuta| SP
    SP -->|Inserta| LIQ["remuneraciones.liquidaciones"]
    
    classDef front fill:#0d1117,stroke:#27ae60,stroke-width:2px,color:#fff;
    classDef sp fill:#1f1235,stroke:#8e44ad,stroke-width:2px,stroke-dasharray: 5 5,color:#fff;
    classDef db fill:#0d1117,stroke:#2b95d6,stroke-width:2px,color:#fff;
    
    class SEV,ORC front
    class SP sp
    class EMP,CONT,LIQ db
```

## 🔄 Diagrama de Flujo de Liquidación

```mermaid
flowchart TD
    A[Inicio: Generar Liquidación] --> B[fx_sueldo_base_prorrateado]
    B --> C[fx_imposiciones]
    C --> D[fx_base_e_impuesto_unico]
    D --> E[sp_liquidacion_generar]
    E --> F[Inserta en liquidaciones]
    F --> G[Inserta en liquidaciones_detalle]
    G --> H[sp_generar_imposiciones]
    H --> I[Fin: Liquidación Completa]

    style E stroke:#8e44ad,stroke-width:4px
    style H stroke:#8e44ad,stroke-width:4px
```

## ☁️ Arquitectura de Despliegue

```mermaid
graph TD
    subgraph Client["Cliente"]
        Browser["Navegador Web"]
    end

    subgraph CDN["Cloudflare Pages"]
        Static["Jean d'Arc (Docs)"]
        App["Sevastopol (App)"]
    end

    subgraph Backend["Servidor Node.js"]
        Orchest["Orchestrator API"]
    end

    subgraph Data["Base de Datos Cloud"]
        Neon["Neon / PostgreSQL"]
    end

    Browser -->|HTTPS / 443| CDN
    Browser -->|HTTPS / API| Orchest
    Orchest -->|TCP / 5432| Neon
    
    classDef cdn fill:#f39c12,stroke:#d35400,color:#000;
    classDef node fill:#27ae60,stroke:#2ecc71,color:#fff;
    classDef db fill:#16a085,stroke:#1abc9c,color:#fff;
    
    class Static,App cdn;
    class Orchest node;
    class Neon db;
```

## 🏗️ Arquitectura de Capas

```mermaid
graph TB
    subgraph Presentación
        A[Sevastopol - Astro/Solid]
    end
    subgraph API
        B[Orchestrator - Express/TS]
    end
    subgraph Negocio
        C[Stored Procedures]
        D[Functions]
    end
    subgraph Datos
        E[PostgreSQL - mother]
    end
    
    A -->|HTTP/REST| B
    B -->|SQL| C
    C -->|Llama| D
    C -->|CRUD| E
    D -->|Lee| E
    
    linkStyle 0 stroke:#27ae60,stroke-width:2px;
    linkStyle 1 stroke:#8e44ad,stroke-width:2px;
```

## 🔐 Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Sevastopol
    participant A as Orchestrator (Auth)
    participant D as DB (Nostromo)
    
    U->>F: Ingresa credenciales
    F->>A: POST /auth/login
    A->>D: SELECT * FROM auth.users WHERE email=$1
    D-->>A: User Hash
    A->>A: bcrypt.compare(pass, hash)
    
    alt Credenciales válidas
        A->>A: Generar JWT (sign)
        A-->>F: { token, user_data }
        F->>U: Redirige al Dashboard
    else Inválidas
        A-->>F: 401 Unauthorized
        F->>U: Muestra error
    end
```

## 📱 Integración Multi-Tenant

```mermaid
graph LR
    A[Usuario] --> B{Autenticación}
    B -->|JWT| C[Middleware]
    C --> D{Tenant?}
    
    subgraph Pools
        D -->|Tenant A| E[Pool DB A]
        D -->|Tenant B| F[Pool DB B]
    end
    
    E --> G[Schema: accounting_template]
    F --> G
    
    linkStyle 0 stroke:#27ae60,stroke-width:2px;
    linkStyle 1 stroke:#f39c12,stroke-width:2px;
```

## 🔗 Enlaces Relacionados

- [Sistema Contable](/accounting/sistema-contable/) - Documentación completa
- [Endpoints API](/api/endpoints/) - Referencia de APIs
- [Demo en Vivo](/demo-api/) - Prueba la integración

---

> [!NOTE] [Nota Técnica]
Los diagramas se actualizan automáticamente cuando se modifica el archivo fuente en `Nostromo/docs/Accounting_system_docs/diagramas/diagrama_usuario.mmd`
