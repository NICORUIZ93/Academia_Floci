## Permisos en Linux

```bash
chmod 600 secreto.txt   # solo el dueño puede leer/escribir
chmod +x script.sh      # hace el archivo ejecutable
chown usuario:grupo archivo
```

## Scripts bash robustos

```bash
#!/usr/bin/env bash
set -euo pipefail
# -e: sale si cualquier comando falla
# -u: error si usas una variable no definida
# -o pipefail: un pipe falla si CUALQUIER comando del pipe falla, no solo el último
```

## Pipes y filtros

```bash
cat acceso.log | grep "ERROR" | awk '{print $4}' | sort | uniq -c | sort -rn
```

Cada comando recibe la salida del anterior — la composición de herramientas pequeñas es la filosofía Unix.

## Procesos en background

```bash
servidor.sh &      # corre en background
jobs                # lista jobs activos
kill %1              # termina el job 1
```

## Cron

```cron
*/5 * * * * /ruta/script.sh >> /var/log/script.log 2>&1
```

Ejecuta `script.sh` cada 5 minutos, redirigiendo tanto salida estándar como errores al log.
