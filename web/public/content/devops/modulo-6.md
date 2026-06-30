## Pod, ReplicaSet, Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: mi-api }
spec:
  replicas: 3
  selector: { matchLabels: { app: mi-api } }
  template:
    metadata: { labels: { app: mi-api } }
    spec:
      containers:
        - name: mi-api
          image: mi-api:1.0
          ports: [{ containerPort: 3000 }]
```

Un **Pod** es la unidad mínima desplegable (uno o más contenedores). Un **ReplicaSet** garantiza que siempre haya N pods corriendo. Un **Deployment** gestiona ReplicaSets, permitiendo actualizaciones controladas (rolling updates) y rollback.

## Service

```yaml
apiVersion: v1
kind: Service
metadata: { name: mi-api }
spec:
  selector: { app: mi-api }
  ports: [{ port: 80, targetPort: 3000 }]
  type: ClusterIP   # NodePort o LoadBalancer para exponer externamente
```

## ConfigMaps y Secrets

```bash
kubectl create configmap config-app --from-literal=LOG_LEVEL=info
kubectl create secret generic db-creds --from-literal=password=secreto
```

## kubectl esencial

```bash
kubectl get pods
kubectl describe pod mi-api-xyz
kubectl logs mi-api-xyz
kubectl exec -it mi-api-xyz -- sh
```
