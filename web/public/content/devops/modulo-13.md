## El pipeline completo

```
commit → CI (lint + test) → escaneo de seguridad (Trivy) → build de imagen
       → push a registry → deploy a Kubernetes (Helm) → verificación de métricas
       → (rollback automático si la tasa de error sube)
```

## Uniendo cada módulo del track

Este proyecto integra: CI con matriz de build (módulo 4), escaneo de vulnerabilidades como gate obligatorio (módulo 11), despliegue a Kubernetes empaquetado en un Helm chart con autoscaling (módulo 7), dashboards de Grafana con al menos una alerta activa (módulo 9), y una estrategia de rollback documentada o automatizada (módulo 5).

```yaml
# fragmento del job de deploy
- name: Deploy con Helm
  run: helm upgrade --install mi-api ./chart --set image.tag=${{ github.sha }}
- name: Verificar healthcheck post-deploy
  run: kubectl rollout status deployment/mi-api --timeout=60s
```

## Cierre del track

Un pipeline de punta a punta como este es lo que separa "funciona en mi máquina" de un sistema operado de forma profesional: cada cambio se valida, se escanea, se despliega de forma controlada y se observa en producción — sin intervención manual en el camino feliz, y con un plan claro para cuando algo sale mal.
