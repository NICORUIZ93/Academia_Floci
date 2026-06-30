## Blue-green

Dos entornos idénticos ("blue" en producción, "green" con la nueva versión). Cuando "green" pasa sus checks, el balanceador cambia el tráfico de golpe. El rollback es instantáneo: vuelve a apuntar a "blue".

## Canary

Despliega la nueva versión a un porcentaje pequeño del tráfico (ej. 5%), monitorea métricas de error/latencia, y si todo está bien, incrementa el porcentaje gradualmente hasta el 100%.

## Rolling update

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate: { maxUnavailable: 1, maxSurge: 1 }
```

Reemplaza las instancias antiguas por nuevas de a poco, manteniendo siempre algunas disponibles — es la estrategia por defecto en Kubernetes.

## Feature flags vs branches por entorno

```js
if (featureFlags.isEnabled('nuevoCheckout')) {
  renderizarNuevoCheckout();
}
```

Un feature flag permite desplegar código "apagado" y activarlo después sin un nuevo deploy — separa el momento de "deploy" del momento de "release" al usuario.

## Rollback automático por métricas

Un pipeline de CD sofisticado monitorea la tasa de error tras el despliegue; si supera un umbral durante X minutos, revierte automáticamente al despliegue anterior sin intervención humana.
