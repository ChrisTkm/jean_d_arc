---
title: Protección de Datos
description: Protocolos para el manejo seguro de información sensible y PII.
sidebar:
  label: Protección de Datos
  order: 2
---

La protección de datos es crítica, especialmente al manejar información financiera y personal (PII) en los módulos de Remuneraciones y Contabilidad.

## Clasificación de Datos

| Nivel | Descripción | Ejemplos | Controles |
| :--- | :--- | :--- | :--- |
| **Público** | Información no sensible. | Docs técnicos, Landing page. | Ninguno específico. |
| **Interno** | Uso exclusivo de la organización. | IDs de usuario, configuración de UI. | Autenticación requerida. |
| **Confidencial** | Información sensible del negocio. | Detalles de contratos, montos de facturas. | RBAC, Auditoría de acceso. |
| **Crítico** | PII y secretos. | RUT, Sueldos, Claves, Tokens API. | Cifrado, Acceso restringido, Logs enmascarados. |

## Manejo de Secretos

- **Nunca** commitear credenciales en Git (`.env` está en `.gitignore`).
- En desarrollo local, usar `.env.local` no compartido.
- En producción (Render/Cloudflare), inyectar secretos como Variables de Entorno en el panel de control.

### Rotación de Credenciales

Se recomienda rotar las llaves críticas (DB Password, JWT Secret) cada **90 días** o inmediatamente ante sospecha de compromiso.

## Enmascaramiento en Logs

Para prevenir fugas de datos en sistemas de monitoreo (Datadog, Sentry, Logs de consola), se deben sanitizar los objetos antes de loguear.

```typescript
// Ejemplo de utilidad de sanitización
function sanitizeLog(data: any) {
  const sensitiveKeys = ['password', 'token', 'secret', 'rut', 'sueldo'];
  // ... lógica recursiva para ocultar valores ...
  return sanitizedData;
}
```

## Estrategias de Cifrado

Implementamos cifrado en múltiples capas para mitigar riesgos en caso de compromiso de infraestructura.

### 1. Cifrado en Tránsito (Network)

Todo tráfico HTTP debe ser **exclusivamente HTTPS (TLS 1.2+)**.
- **HSTS (HTTP Strict Transport Security):** Configurado con `max-age=31536000` para forzar HTTPS por un año.
- **Certificados:** Gestionados automáticamente por Cloudflare en el Edge y Render en el origen.

### 2. Cifrado en Reposo (Storage)

La base de datos PostgreSQL (Neon) utiliza cifrado de disco transparente. Sin embargo, para datos altamente sensibles, aplicamos cifrado adicional:

#### Application-Level Encryption (AES-256-GCM)

Para columnas críticas (ej. montos de sueldos, RUTs personales), ciframos los datos **antes** de enviarlos a la base de datos usando Node.js `crypto`.

```typescript
import { webcrypto } from 'node:crypto';

const ALGORITHM = 'AES-GCM';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

async function encrypt(text: string): Promise<string> {
  const iv = webcrypto.getRandomValues(new Uint8Array(12)); // IV único por registro
  const encoded = new TextEncoder().encode(text);
  
  const key = await webcrypto.subtle.importKey(
    'raw', KEY, ALGORITHM, false, ['encrypt']
  );
  
  const encrypted = await webcrypto.subtle.encrypt(
    { name: ALGORITHM, iv }, key, encoded
  );
  
  // Format: IV:EncryptedData
  return `${Buffer.from(iv).toString('hex')}:${Buffer.from(encrypted).toString('hex')}`;
}
```

:::warning[Gestión de Llaves]
El `ENCRYPTION_KEY` es el secreto más crítico del sistema. Si se pierde, los datos son irrecuperables. Debe rotarse con extrema precaución usando scripts de re-cifrado.
:::

### 3. Hashing de Identidad

Las contraseñas **nunca** se almacenan cifradas (reversible), sino hasheadas (irreversible).

- **Algoritmo:** bcrypt
- **Cost Factor:** 10 (mínimo)
- **Salt:** Generado automáticamente por bcrypt por usuario.

```typescript
import bcrypt from 'bcrypt';

const hashPassword = async (plain: string) => {
  return await bcrypt.hash(plain, 10);
};

const verifyPassword = async (plain: string, hash: string) => {
  return await bcrypt.compare(plain, hash);
};
```
