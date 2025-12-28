---
title: Seguridad de Infraestructura
description: Controles de seguridad a nivel de red, servidores y base de datos.
sidebar:
  label: Infraestructura
  order: 3
---

La seguridad de infraestructura sigue el modelo de responsabilidad compartida, aprovechando las capacidades de nuestros proveedores Cloud (Cloudflare, Render, Neon).

## Capa 1: Edge (Cloudflare)

El tráfico entrante pasa primero por la red global de Cloudflare, que provee:

- **Protección DDoS:** Mitigación automática de ataques volumétricos L3/L4.
- **WAF (Web Application Firewall):** Reglas gestionadas para bloquear exploits comunes (OWASP Top 10).
- **SSL/TLS Offloading:** Terminación segura de conexiones HTTPS.
- **HSTS:** Forzamos `Strict-Transport-Security` para asegurar que los navegadores solo conecten vía HTTPS.

## Capa 2: API Gateway / Backend (Render)

El servicio `Orchestrator` corre en un entorno contenerizado aislado.

- **Rate Limiting:** Implementado para prevenir abuso de endpoints críticos (`/auth/login`).
### Configuración CORS Detallada

El Cross-Origin Resource Sharing (CORS) es una defensa del navegador, pero debe ser configurada correctamente en el servidor para permitir la interactividad segura.

#### Implementación en Express (Orchestrator)

Recuerda que en producción **NO** debes usar wildcards (`*`) si manejas credenciales o cookies.

```typescript
import cors from 'cors';

const whitelist = [
  'https://jean-d-arc.pages.dev', // Producción
  'http://localhost:4321'         // Desarrollo local
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin 'origin' (como curl o Postman)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS policy'));
    }
  },
  credentials: true, // Permitir envío de Cookies/Auth Headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept'
  ],
  maxAge: 86400 // Cachear resultado de preflight (OPTIONS) por 24 horas
};

app.use(cors(corsOptions));
```

#### Headers Clave Explicados

| Header | Valor Recomendado | Propósito |
| :--- | :--- | :--- |
| `Access-Control-Allow-Origin` | Dominio específico | Define quién puede leer la respuesta. |
| `Access-Control-Allow-Credentials` | `true` | Necesario para enviar cookies o headers `Authorization`. |
| `Access-Control-Allow-Methods` | `GET, POST...` | Lista blanca de verbos HTTP permitidos. |

:::tip[Troubleshooting CORS]
Si ves un error `CORS error` en la consola:
1. Revisa la pestaña **Network** del navegador.
2. Analiza la petición **OPTIONS** (Preflight).
3. Si el Preflight falla (403/404), el servidor rechazó el origen antes de procesar la lógica.
4. Si el Preflight pasa (200/204) pero el request falla, revisa que los headers (`Authorization`) estén explícitamente permitidos.
:::

## Capa 3: Base de Datos (Neon / PostgreSQL)

- **Conexiones Seguras:** Solo se permiten conexiones vía SSL/TLS.
- **Connection Pooling:** Uso de `pg-pool` para manejar eficientemente conexiones y prevenir ataques de agotamiento de recursos (DoS).
- **Aislamiento:** Cada Tenant opera lógica y/o físicamente separado para garantizar la integridad de los datos.

## Monitoreo y Alertas

Se recomienda configurar alertas para:
- Picos inusuales de tráfico (posible DDoS).
- Tasa elevada de errores 401/403 (posible ataque de fuerza bruta).
- Latencia anómala en base de datos.
