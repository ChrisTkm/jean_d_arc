---
title: Cálculos y Lógica de Negocio
description: Especificación detallada de la lógica de negocio implementada en las calculadoras de TypeScript.
sidebar:
  label: Cálculos
  order: 3
updated: 2025-12-21
---

La lógica de negocio de remuneraciones ha sido migrada desde SQL a **TypeScript**, encapsulada en "Calculadoras" puras de dominio. Cada calculadora es una clase estática sin efectos secundarios que resuelve un aspecto específico de la liquidación.

Ubicación del código fuente: `src/domain/payroll/calculators/`

> Para el proceso de consolidación y pago de estas leyes, ver [Generación de Imposiciones](./generacion-imposiciones).

## 1. Sueldo Base (BaseSalaryCalculator)

Determina el sueldo base efectivo a pagar, respetando la proporcionalidad por días trabajados y asegurando el sueldo mínimo.

**Ubicación**: `BaseSalaryCalculator.ts`


### Reglas de Negocio

1. **Prorrateo**: Se calcula el monto proporcional del sueldo base contrato según los días trabajados.
   - Fórmula: `(SueldoBase / 30) * DíasTrabajados`
2. **Sueldo Mínimo**: Se calcula igualmente el proporcional de la Renta Mínima Mensual (IMM).
3. **Garantía**: El sistema paga el **MAYOR** valor entre:
   - El proporcional del sueldo pactado.
   - El proporcional del sueldo mínimo legal.

Esto asegura que si el sueldo base pactado es inferior al mínimo (por error o desactualización), el sistema "floors" el pago al mínimo legal proporcional.

---

## 2. Gratificación Legal (GratificationCalculator)

Calcula el monto de gratificación legal según el artículo 47 o 50 del Código del Trabajo, aplicando los topes legales.

**Ubicación**: `GratificationCalculator.ts`

### Modalidades Soportadas
- **`25pct` (Artículo 47)**: Paga el 25% de la remuneración imponible devengada.
- **`abono_anual` (Artículo 50)**: Paga un monto fijo garantizado (Tope Mensual).

### Algoritmo General

1. **Calcular Topes**:
   - Tope Anual: `4.75 * IMM (Ingreso Mínimo Mensual)`
   - Tope Mensual: `Tope Anual / 12`
   
2. **Determinar Monto**:
   - Si es **`abono_anual`**: El monto es igual al Tope Mensual directamente.
   - Si es **`25pct`**: 
     - Se calcula el 25% de los haberes imponibles (Sueldo Base + Horas Extra + Bonos Imponibles).
     - Se aplica el `MIN(25% Calculado, Tope Mensual)`.

3. **Prorrateo (Opcional)**: Si el trabajador laboró menos de 30 días, el monto resultante se prorratea.

---

## 3. Leyes Sociales (SocialLawsCalculator)

Calcula todas las cotizaciones previsionales obligatorias para el trabajador y el aportes del empleador.

**Ubicación**: `SocialLawsCalculator.ts`

### Aportes del Trabajador (Descuentos)

1. **AFP**: `Base Imponible * (10% + Comisión AFP)`. 
   - La base imponible tiene un tope (Tope Imponible para Pensiones, ej: 84.3 UF).
2. **Salud**: Ver `HealthPlanCalculator`. Normalmente 7% o Plan Pactado.
   - Usa el mismo tope imponible que la AFP.
3. **Seguro de Cesantía (AFC)**: `Base Imponible * Tasa Trabajador (0.6%)`.
   - Tiene su propio tope imponible (Tope AFC, ej: 126.6 UF), distinto al de pensiones.

### Aportes del Empleador (Costo Empresa)

1. **SIS** (Seguro Invalidez y Sobrevivencia): `Base Imponible * Tasa SIS`.
2. **Mutual** (Accidentes del Trabajo): `Base Imponible * (Tasa Base + Adicional)`.
3. **AFC Empleador**: `Base Imponible AFC * Tasa Empleador (2.4%)`.
4. **Ley Sanna / Seguro Social**: Pequeño porcentaje adicional.
5. **Indemnización** (Casa Particular): Aporte especial si aplica.

---

## 4. Plan de Salud (HealthPlanCalculator)

Resuelve la complejidad de Isapres vs Fonasa y la aplicación del 7% legal.

**Ubicación**: `HealthPlanCalculator.ts`

### Reglas

1. **Base Imponible**: `MIN(Sueldo Imponible, Tope Legal UF)`.
2. **FONASA**: 
   - El descuento es siempre el **7%** de la base imponible.
   - Ignora cualquier plan pactado.
3. **ISAPRE**:
   - Calcula el **7% Legal Obligatorio**.
   - Calcula el valor del **Plan Pactado** (UF * ValorUF + CLP).
   - El descuento es: `MAX(7% Legal, Plan Pactado)`.
   
   > **Nota**: Si el plan es mayor al 7%, el trabajador paga la diferencia. Si es menor, el empleador descuenta el 7% legal y la diferencia genera excedentes en la Isapre (fuera del alcance del motor de nómina, pero el descuento contable es el 7%).

---

## 5. Impuesto Único (TaxCalculator)

Calcula el Impuesto Único de Segunda Categoría (IUSC) aplicado a las rentas del trabajo.

**Ubicación**: `TaxCalculator.ts`

### Algoritmo de Cálculo

1. **Base Tributaria**:
   - `Total Imponible - Descuentos Legales (AFP + Salud + AFC) - APV - Otros Descuentos Legales`.
   
2. **Determinar Tramo**:
   - Busca en la tabla de impuesto mensual (Service Internal Revenue - SII) el tramo donde cae la base tributaria.
   
3. **Cálculo**:
   - `Impuesto = (Base Tributaria * Factor) - Rebaja`.
   - Si existen **Créditos** (ej: Donaciones), se restan al impuesto determinado.
   - El impuesto no puede ser negativo (piso cero).

---

## 6. Prorrateo (ProrrataCalculator)

Utilidad transversal para proporciones lineales.

**Ubicación**: `ProrrataCalculator.ts`

- **Regla**: `(Monto / 30) * DíasTrabajados`.
- **Clamp**: Los días trabajados se limitan entre 0 y 30.
- **Redondeo**: Al entero más cercano.
