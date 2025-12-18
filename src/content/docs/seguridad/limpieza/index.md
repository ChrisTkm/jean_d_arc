---
title: Healthcheck Windows (Cleaner) – Básico y Avanzado
description: Pasos guiados para revisar eventos críticos, disco, Defender, servicios, procesos, temperatura hardware, SMART, latencia red y parches.
sidebar:
  label: Windows
  order: 4
updated: 2025-09-09
---

## Nostromo - Cleaner (Healthcheck Windows)

Notebook de PowerShell para healthchecks básicos en Windows. Cada sección explica el objetivo, comando y cómo interpretar resultados. Ejecuta los bloques independientemente según necesidad.

---

## 1 Errores en Sistema últimos 7 días

**¿Para qué sirve?**
Detectar fallos recientes (hardware, drivers, servicios críticos) en el registro de eventos `System`.

### Script - Errores en Sistema

```powershell
$Days = 7  # Cambia a 3, 14, etc. según periodo deseado
Get-WinEvent -FilterHashtable @{
    LogName   = 'System'
    Level     = 2      # 2 = Error (crítico)
    StartTime = (Get-Date).AddDays(-$Days)
} -MaxEvents 50 |
  Format-Table TimeCreated, Id, ProviderName, Message -AutoSize
```

### Qué observar en errores de sistema

- Errores repetidos (mismo Id + ProviderName) → patrón a investigar.
- Controladores / disk / ntfs / storport → posible riesgo hardware.
- Servicios que no inician (Service Control Manager).

> Si necesitas más contexto de un Id: `wevtutil gp System /ge:true | Select-String <Id>`

---

## 2. Espacio libre en discos

**¿Para qué sirve?**
Evitar degradación de rendimiento o fallos por falta de espacio.

### Script - Espacio libre en discos

```powershell
Get-CimInstance -Class Win32_LogicalDisk -Filter 'DriveType = 3' |
  Select-Object DeviceID,
    @{N='SizeGB';E={[math]::Round($_.Size/1GB,1)}},
    @{N='FreeGB';E={[math]::Round($_.FreeSpace/1GB,1)}},
    @{N='PctFree';E={[math]::Round(($_.FreeSpace*100)/$_.Size,1)}} |
  Format-Table -AutoSize
```

### Qué observar en Espacio libre en discos

- Volúmenes < 20% libre → planificar limpieza.
- Disco del sistema (C:) con < 10 GB libre → prioridad alta.

---

## 3. Escaneo rápido con Microsoft Defender

**¿Para qué sirve?**
Verificar amenazas comunes. QuickScan revisa áreas críticas; FullScan todo el sistema (más lento).

### Script - Escaneo con Defender (QuickScan)

```powershell
Start-MpScan -ScanType QuickScan
```

### Notas

- Si usas PowerShell 7 y da error, ejecuta en una consola de PowerShell 5.1.
- Para escaneo completo: `Start-MpScan -ScanType FullScan` (puede tardar horas).

### Qué observar

- Detecciones → revisar con: `Get-MpThreat`.
- Resultado limpio → continuar con siguientes pasos.

---

## 4. Servicios automáticos detenidos

**¿Para qué sirve?**
Detectar servicios esenciales que no están corriendo (DB, spooler, agentes de backup, etc.).

### Script - Servicios automáticos detenidos

```powershell
Get-Service -ErrorAction SilentlyContinue |
  Where-Object { $_.Status -ne 'Running' -and $_.StartType -eq 'Automatic' } |
  Sort-Object DisplayName |
  Format-Table Status, Name, DisplayName -AutoSize
```

### Qué observar en Servicios automáticos detenidos

- Servicios EXPECTADOS en Stopped (ej. SQLSERVER, W3SVC, MSSQL$INSTANCIA) → investigar.
- Si es intencional (deshabilitado temporalmente) documentar.

> Reiniciar un servicio: `Start-Service -Name <Nombre>`

---

## 5. Top 10 procesos por memoria

**¿Para qué sirve?**
Identificar consumo anómalo de RAM y posibles fugas.

### Script - Procesos por memoria

```powershell
Get-Process |
  Sort-Object WorkingSet64 -Descending |
  Select-Object -First 10 Name, Id, @{N='MemMB';E={[math]::Round($_.WorkingSet64/1MB,2)}} |
  Format-Table -AutoSize
```

### Qué observar en procesos

- Procesos desconocidos con alto uso.
- Crecimiento continuo entre ejecuciones sucesivas.
- Apps que no deberían estar en servidor (Spotify, Discord, etc.).

---

## 6. Temperatura y sensores (Hardware)

**¿Para qué sirve?**
Detectar sobrecalentamiento que pueda causar throttling o apagados inesperados.

### Script - Temperatura con WMI térmico genérico

```powershell
Get-CimInstance -Namespace root/wmi -ClassName MSAcpi_ThermalZoneTemperature 2>$null |
  Select-Object InstanceName, @{N='TempC';E={[math]::Round(($_.CurrentTemperature/10)-273.15,1)}}
```

### Script alternativo - Sensores disco / NVMe

```powershell
Get-PhysicalDisk | Select FriendlyName, MediaType, HealthStatus, OperationalStatus, Usage, @{N='TempC';E={$_.Temperature}} | Format-Table -AutoSize
```

### Qué observar en temperatura

- Temp CPU sostenida > 85°C en cargas ligeras → investigar pasta térmica / ventilación.
- Discos NVMe > 70°C sostenidos → riesgo disminución vida útil.

> Nota: Muchos equipos no exponen temperatura vía WMI. Para mayor detalle usar herramientas como `OpenHardwareMonitor` + export a JSON y parsear.

---

## 7. SMART / Salud de Discos

**¿Para qué sirve?**
Anticipar fallos de disco revisando indicadores de salud.

### Script - Storage Spaces / Win10+

```powershell
Get-PhysicalDisk | Select FriendlyName, MediaType, HealthStatus, OperationalStatus, Size | Format-Table -AutoSize
```

### Script - Estado WMIC clásico

```powershell
wmic diskdrive get model,status
```

### Script - SMART Atributos con Get-StorageReliabilityCounter

```powershell
Get-PhysicalDisk | ForEach-Object {
  $r = Get-StorageReliabilityCounter -PhysicalDisk $_ -ErrorAction SilentlyContinue
  [PSCustomObject]@{
    Disk        = $_.FriendlyName
    Wear        = $r.Wear | ForEach-Object {"$($_)"}
    ReadErrors  = $r.ReadErrorsTotal
    WriteErrors = $r.WriteErrorsTotal
    Temperature = $r.Temperature
  }
} | Format-Table -AutoSize
```

### Qué observar en SMART

- HealthStatus distinto de `Healthy`.
- Incremento de Read/WriteErrors entre chequeos.
- Wear nivel alto en SSD empresariales (consultar especificación del fabricante).

---

## 8. Latencia y Conectividad de Red

**¿Para qué sirve?**
Detectar degradación de red que afecte servicios (DB remota, APIs externas).

### Script - Ping a gateway, DNS y destinos críticos

```powershell
$targets = @((Get-NetRoute -DestinationPrefix '0.0.0.0/0' | Sort-Object RouteMetric | Select-Object -First 1).NextHop,'8.8.8.8','1.1.1.1','github.com')
$targets | ForEach-Object {
  $r = Test-Connection -ComputerName $_ -Count 4 -ErrorAction SilentlyContinue
  if ($r) {
    [PSCustomObject]@{Host=$_; AvgMs=[math]::Round(($r | Measure-Object -Property ResponseTime -Average).Average,2); Loss=0}
  } else {
    [PSCustomObject]@{Host=$_; AvgMs=$null; Loss=100}
  }
} | Format-Table -AutoSize
```

### Script - Trazas de red si hay pérdida

```powershell
tracert github.com
```

### Qué observar en red

- Latencia interna (gateway) > 5–10 ms → posible congestión local.
- Latencia externa súbita > 120 ms cuando antes era < 40 ms.
- Pérdida de paquetes > 1–2% sostenida.

---

## 9. Verificación de Parches / Actualizaciones

**¿Para qué sirve?**
Confirmar que el sistema está al día con parches críticos de seguridad.

### Listar últimos hotfix instalados

```powershell
Get-HotFix | Sort-Object InstalledOn -Descending | Select -First 10 Source, Description, HotFixID, InstalledOn | Format-Table -AutoSize
```

### Días desde último parche

```powershell
$last = (Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 1).InstalledOn
([pscustomobject]@{UltimoParche=$last; Dias=(New-TimeSpan -Start $last -End (Get-Date)).Days}) | Format-List
```

### Qué observar en parches

- Más de 30 días sin parches en entornos productivos → revisar ciclo.
- Falta de KB listadas en directrices internas.

> Para auditoría estricta: comparar KB instaladas vs. baseline (fichero JSON interno) y generar diff.

---

## 📋 Recomendaciones de uso

1. Ejecuta secciones en orden si investigas incidente.
2. Guarda salidas críticas (`Out-File` o `Tee-Object`) para histórico.
3. Automatiza (Task Scheduler) pasos 1 y 2 semanalmente y alerta si:
   - Errores > umbral.
   - %Libre < 15%.
4. Integra scripts en un wrapper que genere reporte Markdown único.

### Ejemplo wrapper rápido

```powershell
$report = "# Healthcheck $(Get-Date -Format 'yyyy-MM-dd HH:mm')`n"
$report += "## Errores System (7d)`n" + (
  Get-WinEvent -FilterHashtable @{LogName='System';Level=2;StartTime=(Get-Date).AddDays(-7)} -MaxEvents 10 |
    Select-Object TimeCreated,Id,ProviderName,Message | Out-String)
$report += "`n## Disco`n" + (
  Get-CimInstance Win32_LogicalDisk -Filter 'DriveType = 3' |
    Select DeviceID,@{N='Free%';E={[math]::Round(($_.FreeSpace*100)/$_.Size,1)}} | Out-String)
$report | Set-Content .\healthcheck_report.md
```

---

## 📚 Recursos útiles

- Documentación eventos Windows: <https://learn.microsoft.com/windows/win32/eventlog/>
- Defender cmdlets: <https://learn.microsoft.com/powershell/module/defender/>
- PowerShell programar tareas: <https://learn.microsoft.com/powershell/module/scheduledtasks/>

---

## ⚠️ Nota

Las secciones 6–9 amplían el alcance a salud física y postura de seguridad. Para mayor madurez:

1. Integrar export automático (JSON) y subir a almacenamiento central.
2. Comparar métricas (temperatura, errores SMART, latencia) contra umbrales históricos.
3. Baseline de parches en archivo controlado por Git; generar reporte diff.
4. Añadir chequeo de integridad (hash) a binarios críticos y scripts internos.

---
© 2025 Christian Albornoz – Albornoz.Studio - Nostromo - Licencia MIT.
