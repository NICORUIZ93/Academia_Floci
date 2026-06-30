## Helm: charts parametrizables

```yaml
# values.yaml
replicaCount: 3
image: { repository: mi-api, tag: "1.0" }
```

```yaml
# templates/deployment.yaml
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
        - image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

```bash
helm install mi-api ./chart --set replicaCount=5
```

Un chart encapsula todos los manifiestos y permite reutilizarlos entre entornos cambiando solo `values.yaml`.

## Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
spec:
  rules:
    - host: api.miapp.com
      http:
        paths:
          - path: /
            backend: { service: { name: mi-api, port: { number: 80 } } }
```

## HorizontalPodAutoscaler

```bash
kubectl autoscale deployment mi-api --cpu-percent=70 --min=2 --max=10
```

## Probes

```yaml
livenessProbe: { httpGet: { path: /health, port: 3000 }, periodSeconds: 10 }
readinessProbe: { httpGet: { path: /ready, port: 3000 }, periodSeconds: 5 }
```

`readiness` decide si el pod recibe tráfico; `liveness` decide si Kubernetes debe reiniciarlo.
