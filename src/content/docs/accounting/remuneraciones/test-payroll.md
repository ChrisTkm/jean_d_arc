---
title: Estrategia de Testing (Payroll)
description: Documentación de la infraestructura de pruebas para el motor de remuneraciones.
sidebar:
  label: Testing Payroll
  order: 6
updated: 2025-12-21
---

La fiabilidad del motor de remuneraciones se garantiza mediante una estrategia de testing en capas, separando la lógica pura de la orquestación con base de datos.

## 1. Unit Testing (Dominio Puro)

Las pruebas unitarias validan la lógica matemática sin dependencias externas (sin base de datos).

**Ubicación**: `src/domain/payroll/**/*.test.ts`

### PayrollEngine.test.ts

Prueba el núcleo del motor (`PayrollEngine.calculate`).

- **Mocking**: Se inyectan datos de entrada simulados (`PayrollInput`) y tablas de parámetros (impuestos, leyes sociales).
- **Cobertura**:
  - Cálculo de sueldo líquido standard.
  - Casos de borde: Prorrateo, horas extras.
  - Verificación de topes legales (Gratificación, Imponibles).

### Calculadoras Individuales

Cada calculadora tiene su propio suite de pruebas aislado:

- `BaseSalaryCalculator.test.ts`
- `GratificationCalculator.test.ts`
- `SocialLawsCalculator.test.ts`
- ...

## 2. Integration Testing (Real DB)

Las pruebas de integración validan el flujo completo desde el servicio hasta la base de datos real.

**Ubicación**: `src/domain/payroll/PayrollService.test.ts`

Estas pruebas son críticas porque validan:

1. Las consultas SQL del repositorio.
2. La consistencia de los tipos de datos PostgreSQL vs TypeScript.
3. La correcta persistencia (INSERT) de la liquidación final.

### Infraestructura de Testing

Para evitar ensuciar la base de datos de desarrollo, se utiliza una infraestructura de bases de datos efímeras.

#### TestDbManager

**Ubicación**: `src/test/db-manager.ts`

- Crea una base de datos única por ejecución (ej: `test_acc_a1b2c3d4`) basada en un template (`accounting_template`).
- Asegura un entorno limpio y aislado.
- Al finalizar las pruebas, elimina la base de datos temporal.

#### PayrollSeeder

**Ubicación**: `src/test/payroll-seeder.ts`

- Rellena la base de datos efímera con datos mínimos necesarios.
- Crea: Monedas (UF, UTM), Indicadores, Topes, Contratos, Empleados y Conceptos.

## 3. Logging & Debugging

Debido a la complejidad de los cálculos, se implementó un sistema de logs detallado para los tests.

**Ubicación**: `src/test/file-logger.ts`

- **Output**: `tests/logs/payroll.test.log`
- **Función**: `logToFile(msg)`
- **Uso**: Permite volcar estructuras JSON completas (inputs, resultados intermedios, outputs) durante la ejecución de los tests, lo cual sería muy ruidoso para la consola standard.

## Ejecución de Pruebas

Comandos disponibles en `package.json`:

```bash
# Ejecutar solo unit tests del dominio payroll
npm run test:payroll

# Ejecutar integración y unitarios (Combo)
npm run test:payroll-combo
```
