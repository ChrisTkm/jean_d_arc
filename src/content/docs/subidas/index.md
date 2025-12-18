---
title: Subidas - Scripts Principales
sidebar:
  label: Scripts
  order: 1
  hidden: false
updated: 2025-09-09
---

## Subidas: Scripts Principales

Esta sección documenta los scripts operativos relacionados con cargas externas (Banco Central, Previred, Pipelines SII) del sistema contable.

## Tabla Resumen

| Script | Ejecutar | Objetivo | Interacción |
|--------|----------|----------|-------------|
| `bc_loader.py` | `python -m accounting_system.bc_loader` | Carga series monetarias (UF, USD, EUR) del Banco Central a `parametros.monedas` | Interactiva (confirma carga real) |
| `cargar_previred_parametros.py` | `python -m accounting_system.cargar_previred_parametros -y 2025 -m 8` | Inserta parámetros Previred (indicadores, topes, renta mínima, AFC, AFP, asignación familiar) | Flags CLI (`--dry-run`) |
| `run_cargas_sii.py` | `python accounting_system/run_cargas_sii.py cargas_sii.yml` | Orquesta pipelines definidos en YAML contra archivos RCV/otros | No interactiva |

---

## `bc_loader.py`

```python
# Nostromo/accounting_system/bc_loader.py
"""
ejecutar: python -m accounting_system.bc_loader
Script ejecutable para cargar datos del Banco Central con conexiones reales PostgreSQL
"""
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Agregar ruta del proyecto
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from auth.conexion import PostgresConexion
from accounting_system.utils.banco_central_loader import BancoCentralLoader

def test_real_connections():
  """Prueba la conexión a PostgreSQL accounting.parametros"""
  print("🔌 Probando conexión PostgreSQL")
  print("=" * 40)
  try:
    engine_accounting = PostgresConexion.get_engine(schema="parametros")
    with engine_accounting.connect() as conn:
      from sqlalchemy import text
      result = conn.execute(text("SELECT COUNT(*) as count FROM parametros.monedas"))
      row = result.fetchone()
      count = row[0] if row is not None else 0
      print(f"✅ accounting.parametros.monedas: {count} registros")
    return engine_accounting
  except Exception as e:
    print(f"❌ Error en conexión: {e}")
    return None

def load_banco_central_real():
  """Carga real de datos del Banco Central"""
  print("🏦 Carga Real de Datos Banco Central")
  print("=" * 50)
  bc_user = os.getenv('BC_USER')
  bc_password = os.getenv('BC_PASSWORD')
  if not bc_user or not bc_password:
    print("❌ Credenciales del Banco Central no encontradas")
    return
  print(f"👤 Usuario BC: {bc_user}")
  print(f"🔒 Password BC: {bc_password[:3]}...{bc_password[-3:]}")
  engine_accounting = test_real_connections()
  if not engine_accounting:
    print("❌ No se pudo establecer la conexión PostgreSQL")
    return
  try:
    loader = BancoCentralLoader(engine_accounting)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5)
    start_str = start_date.strftime('%Y-%m-%d')
    end_str = end_date.strftime('%Y-%m-%d')
    print(f"\n📅 Período: {start_str} - {end_str}")
    print(f"💰 Monedas: UF, USD, EUR")
    print(f"\n1️⃣ MODO TEST - Verificando API")
    test_result = loader.load_currency_data(start_date=start_str, end_date=end_str, currencies=['UF'], test_mode=True)
    if not test_result['success']:
      print(f"❌ Test falló: {test_result.get('error')}")
      return
    print(f"✅ Test exitoso: {test_result['total_records']} registros obtenidos")
    confirm = input("¿Continuar con la carga real? (s/N): ").strip().lower()
    if confirm != 's':
      print("❌ Carga cancelada por usuario")
      return
    real_result = loader.load_currency_data(start_date=start_str, end_date=end_str, currencies=['UF','USD','EUR'], test_mode=False)
    if real_result['success']:
      print(f"\n🎉 CARGA COMPLETADA EXITOSAMENTE")
    else:
      print(f"\n❌ CARGA FALLÓ: {real_result.get('error')}")
  except Exception as e:
    print(f"\n❌ Error durante la carga: {e}")

def main():
  print("🚀 Cargador REAL Banco Central de Chile")
  env_path = project_root / ".env"
  if not env_path.exists():
    print(f"❌ Archivo .env no encontrado en: {env_path}")
    return
  try:
    print("Opciones disponibles:")
    print("1. Carga de prueba (últimos 5 días)")
    print("2. Carga por período (seleccionar mes)")
    print("3. Solo probar conexiones")
    choice = input("\nElige opción (1, 2 o 3): ").strip()
    if choice == "1":
      load_banco_central_real()
    elif choice == "2":
      pass  # ver script completo
    elif choice == "3":
      test_real_connections()
  except KeyboardInterrupt:
    print("\n🛑 Interrumpido")

if __name__ == "__main__":
  main()
```

### Flujo

1. Verifica credenciales `BC_USER` / `BC_PASSWORD`.
2. Prueba conexión PostgreSQL (`parametros.monedas`).
3. Ejecuta modo test (solo UF) últimos 5 días.
4. Pregunta confirmación y realiza carga real (UF, USD, EUR).
5. Muestra resumen y verificación en base.

### Parámetros y Entidades

- Tabla destino: `parametros.monedas`
- Monedas soportadas: `UF`, `USD`, `EUR`
- Argumentos interactivos: confirmación carga real

### Buenas Prácticas

- Siempre ejecutar primero modo test.
- Verificar que variables de entorno existen antes de producción.
- Limitar ventana temporal si se recupera histórico masivo.

---

## `cargar_previred_parametros.py`

```python
# cargar_previred_parametros.py
"""
ejecutar: python -m accounting_system.cargar_previred_parametros -y 2024 -m 9
"""
import argparse, datetime as dt
from dataclasses import dataclass
from typing import Dict, Optional, Tuple, Any
import pandas as pd
from sqlalchemy import text
from sqlalchemy.engine import Engine
from auth.conexion import engine_parametros
from utils.extractors import parse_pdf

def periodo_mes_date(year:int, month:int): return dt.date(year, month, 1)
def month_bounds(year:int, month:int):
  start = dt.date(year, month, 1); end = dt.date(year + (1 if month==12 else 0), (1 if month==12 else month+1), 1); return start, end
def is_ge_aug_2025(year:int, month:int): return (year, month) >= (2025,8)
def ensure_fraction(x): return None if x is None else round(float(x)/100.0,4)

@dataclass
class AFPRow:
  codigo: str; tasa_comision: float; recargo_empleador: float

# (Funciones transform: to_indicadores, to_topes, to_renta_min, to_afc, to_asignacion_familiar, parse_afp_to_rows)
# Se omiten aquí por brevedad; ver script completo en repositorio.

def load_previred_month(engine:Engine, year:int, month:int, dry_run:bool=False, url:Optional[str]=None):
  # parse_pdf -> tupla variable (6 a 8 elementos)
  parsed = parse_pdf(year, month, url=url)
  # ... lógica completa en el script original ...
  print(f"✔️ Carga Previred {year}-{month:02d} completa (ver detalles en logs)")

if __name__ == '__main__':
  today = dt.date.today()
  ap = argparse.ArgumentParser(description='Carga parámetros Previred')
  ap.add_argument('-y','--year', type=int, default=today.year)
  ap.add_argument('-m','--month', type=int, choices=range(1,13), default=today.month)
  ap.add_argument('--dry-run', action='store_true')
  ap.add_argument('--url')
  args = ap.parse_args()
  eng = engine_parametros
  if eng is None: raise RuntimeError('engine_parametros no configurado')
  load_previred_month(eng, args.year, args.month, dry_run=args.dry_run, url=args.url)
```

### Componentes que Carga

- `parametros.indicadores`
- `parametros.topes`
- `parametros.renta_min`
- `parametros.afc`
- `parametros.afp_tasas` (rangos con `daterange`)
- `parametros.asignacion_familiar_tramos`

### Modo Dry-Run

Usar `--dry-run` para ver conteos antes de insertar.

### Reglas Destacadas

- Convierte porcentajes a fracciones con 4 decimales.
- Maneja recargo empleador si viene en extras o columna.
- Inserta AFP como rangos `[mes, mes+1)` cerrando rangos abiertos.

---

## `run_cargas_sii.py`

```python
# run_cargas_sii.py
import sys, os, fnmatch
from pathlib import Path
from accounting_system.log import StructuredLogger
from accounting_system.components.pipeline import PipelineFactory
from accounting_system.components.yaml_loader import load_yaml_config
from accounting_system.utils.filename_tools import get_database_from_rut
from accounting_system.utils.empresa_config_manager import EmpresaConfigManager

if __name__ == '__main__':
  yaml_path = sys.argv[1] if len(sys.argv) > 1 else 'cargas_sii.yml'
  config = load_yaml_config(yaml_path)
  global_conf = config.get('global', {})
  source_dir = global_conf.get('source_dir', '.')
  log_dir = global_conf.get('log_dir', 'logs')
  logger = StructuredLogger(__name__, process='cargas_sii', log_dir=log_dir)
  empresa_manager = EmpresaConfigManager()
  logger.info('Iniciando cargas SII - Mostrando empresas activas')
  pipelines = PipelineFactory.from_yaml(yaml_path, logger)
  for proc_name, pipeline in pipelines:
    proc_conf = next(p for p in config['processes'] if p['name']==proc_name)
    pattern = proc_conf['pattern']
    files = [f for f in os.listdir(source_dir) if fnmatch.fnmatch(f, f"*{pattern}*.") or pattern in f]
    if not files: continue
    if hasattr(pipeline,'file_filter') and pipeline.file_filter:
      files = [f for f in files if pipeline.file_filter(f)]
    for file in files:
      file_path = str(Path(source_dir)/file)
      db_name = get_database_from_rut(file)
      context = {
        'file': file,
        'file_path': file_path,
        'db_name': db_name,
        'schema': 'operaciones_sii',
        'table': proc_conf.get('name','').lower(),
        'read_kwargs': proc_conf.get('read_kwargs', {}),
      }
      if 'fecha_param_fn' in proc_conf:
        import importlib
        mod_path, fn_name = proc_conf['fecha_param_fn'].rsplit('.',1)
        mod = importlib.import_module(mod_path)
        context['fecha_param_fn'] = getattr(mod, fn_name)
      pipeline.run(context)
      print(f"Archivo procesado: {file}\n")
```

### YAML de Orquestación

Cada `process` define:

- `name`: nombre lógico
- `pattern`: substring o patrón de archivo
- `read_kwargs`: parámetros específicos de lectura
- `fecha_param_fn` (opcional): función dinámica de fecha

### Contexto Inyectado al Pipeline

```python
{
  'file': <nombre archivo>,
  'file_path': <ruta absoluta>,
  'db_name': <base derivada del RUT>,
  'schema': 'operaciones_sii',
  'table': <nombre proceso>,
  'read_kwargs': {...},
  'fecha_param_fn': callable opcional
}
```

### Buenas Prácticas para mejorar

- Mantener funciones `fecha_param_fn` puras y testeables.
- Validar patrones para no procesar archivos parciales.
- Implementar `file_filter` en pipelines cuando corresponda.

---

## Código Completo Embebido

A continuación se incrustan los códigos fuente para referencia rápida.

### Código completo

Para el código íntegro y actualizado ver los archivos en el repositorio bajo `accounting_system/`.

---

## Próximos Pasos

- Añadir métricas de duración por script.
- Agregar ejemplos de YAML para `run_cargas_sii.py`.
- Documentar política de reintentos y logs estructurados.
