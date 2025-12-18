---
title: Cálculos y Funciones
description: Lógica de negocio y funciones SQL de remuneraciones
sidebar:
  label: Cálculos
  order: 3
updated: 2025-12-17
---

El motor de remuneraciones reside completamente en PostgreSQL. La lógica se divide en **funciones de cálculo** (fx) y **procedimientos de orquestación** (sp).

## Orquestador Principal

### `sp_liquidacion_generar`
**Ubicación**: `sp/018_sp_liquidacion_generar.sql`

Es el punto de entrada para generar una liquidación. Su responsabilidad es:
1. **Invocar el cálculo**: Llama a `fx_liquidacion_previa`.
2. **Gestionar concurrencia**: Bloquea o valida si ya existe una liquidación aprobada.
3. **Persistir datos**: 
   - Inserta/Actualiza `liquidaciones`.
   - Limpia y reinserta `liquidaciones_detalle` usando `fx_insert_detalle_concepto`.

```sql
-- Ejemplo de uso
SELECT * FROM remuneraciones.sp_liquidacion_generar(
  'uuid-contrato',
  'uuid-empleado', 
  '2025-11-01',    -- Fecha del periodo
  'uuid-usuario',  -- Usuario que ejecuta
  '{}',            -- Overrides (JSON)
  FALSE            -- Dry Run (FALSE = Guardar cambios)
);
```

## Motor de Lógica

### `fx_liquidacion_previa`
**Ubicación**: `fx/011_fx_liquidacion_previa.sql`

Realiza todos los cálculos matemáticos en memoria sin guardar nada. Retorna un registro tipo `liquidaciones`.

**Pasos del algoritmo:**
1. **Carga de Datos**: Obtiene contrato, sueldo base, parámetros mensuales (UF, UTM).
2. **Cálculo de Asistencia**: Días trabajados, licencias, ausencias.
3. **Cálculo de Haberes**: 
   - Sueldo Base proporcional.
   - Gratificación (Topes legales).
   - Horas Extras.
4. **Cálculo de Imponible**: Suma de haberes imponibles.
5. **Cálculo de Descuentos Legales**: 
   - AFP (Topes de imponible).
   - Salud (7% o pactado en UF).
   - Seguro de Cesantía.
6. **Cálculo de Impuestos**: Impuesto Único de Segunda Categoría (Tabla SII).
7. **Totales Finales**: Líquido a pagar.

## Funciones Específicas

### Impuesto Único
`fx_impuesto_unico(monto_tributable, fecha)`
Calcula el impuesto basándose en la tabla de tramos del SII cargada en el sistema.

### Horas Extras
`fx_horas_extra_50` / `fx_horas_extra_100`
Calcula el valor de la hora extra basándose en el sueldo base y el factor correspondiente (0.0077777... multiplicado por 1.5 o 2.0).

### Gratificación Legal
`fx_gratificacion_legal`
Aplica el menor valor entre:
- 25% del sueldo base proporcional.
- Tope legal (4.75 IMM / 12).

## Persistencia de Detalle

### `fx_insert_detalle_concepto`
Helper crítico que inserta cada ítem calculado en la tabla `liquidaciones_detalle`. Solo inserta si el monto es mayor a 0.

Realiza el link con la tabla `conceptos_remuneracion` usando el código del concepto (ej: `HAB-001`), lo que automáticamente asigna la cuenta contable correcta.
