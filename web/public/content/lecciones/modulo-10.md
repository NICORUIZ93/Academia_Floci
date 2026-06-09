# Módulo 10 · Contenedores: ECS, ECR y Kubernetes (EKS)

## Contenedores vs Serverless vs Máquinas virtuales

| | Serverless (Lambda) | Contenedores (ECS/EKS) | Máquinas virtuales (EC2) |
|-|---------------------|------------------------|--------------------------|
| Control | Mínimo | Medio-alto | Máximo |
| Timeout | 15 min máx | Sin límite | Sin límite |
| Estado | Sin estado | Con o sin estado | Con o sin estado |
| Escalado | Automático | Configurable | Manual / Auto Scaling |
| Inicio en frío | Sí | Sí (pero controlable) | Minutos |

**Floci usa Docker real** para ECS y EKS — los contenedores realmente corren.

---

## ECR — Elastic Container Registry

ECR es el registro privado de imágenes Docker de AWS.

```bash
eval $(floci env)

# Crea un repositorio ECR
aws ecr create-repository --repository-name mi-app

# Obtén la URL del repositorio
REPO_URI=$(aws ecr describe-repositories \
  --repository-names mi-app \
  --query "repositories[0].repositoryUri" \
  --output text)

echo "Repositorio: $REPO_URI"

# En Floci, la URI tiene este formato:
# 000000000000.dkr.ecr.us-east-1.localhost.localstack.cloud:4566/mi-app
```

### Construye y sube una imagen

```bash
# Crea un Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir

COPY . .
EXPOSE 8080
CMD ["python", "app.py"]
EOF

cat > requirements.txt << 'EOF'
flask==3.0.0
boto3==1.34.0
EOF

cat > app.py << 'EOF'
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route("/health")
def health():
    return jsonify({"status": "ok", "entorno": os.environ.get("ENTORNO", "local")})

@app.route("/tareas")
def tareas():
    return jsonify([{"id": "1", "titulo": "Aprender ECS"}, {"id": "2", "titulo": "Desplegar en EKS"}])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
EOF

# Construye la imagen
docker build -t mi-app:1.0 .

# Autentícate en ECR (en Floci usa credenciales falsas)
aws ecr get-login-password | docker login --username AWS --password-stdin $REPO_URI

# Etiqueta y sube
docker tag mi-app:1.0 $REPO_URI:1.0
docker push $REPO_URI:1.0

# Lista imágenes en el repositorio
aws ecr list-images --repository-name mi-app
```

---

## ECS — Elastic Container Service

ECS es la forma más simple de correr contenedores en AWS. Puedes usar **Fargate** (sin servidores) o **EC2** (tus instancias).

### Task Definition — describe el contenedor

```bash
# Define la Task Definition
cat > task-def.json << 'EOF'
{
  "family": "mi-app-task",
  "networkMode": "bridge",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "mi-app",
      "image": "mi-app:1.0",
      "portMappings": [
        {"containerPort": 8080, "hostPort": 8080, "protocol": "tcp"}
      ],
      "environment": [
        {"name": "ENTORNO", "value": "produccion"},
        {"name": "AWS_DEFAULT_REGION", "value": "us-east-1"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mi-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

aws ecs register-task-definition --cli-input-json file://task-def.json

# Crea un cluster ECS
aws ecs create-cluster --cluster-name mi-cluster

# Crea el servicio (mantiene N instancias corriendo)
aws ecs create-service \
  --cluster mi-cluster \
  --service-name mi-app-service \
  --task-definition mi-app-task \
  --desired-count 2 \
  --launch-type FARGATE

# Lista servicios
aws ecs list-services --cluster mi-cluster

# Lista tasks corriendo
aws ecs list-tasks --cluster mi-cluster

# Escala el servicio
aws ecs update-service \
  --cluster mi-cluster \
  --service mi-app-service \
  --desired-count 3
```

---

## EKS — Kubernetes en AWS

EKS es Kubernetes gestionado. Más complejo que ECS pero más potente y portable (el mismo YAML funciona en AKS o GKE).

```bash
# Crea un cluster EKS
aws eks create-cluster \
  --name mi-cluster-k8s \
  --role-arn arn:aws:iam::000000000000:role/eks-rol \
  --resources-vpc-config subnetIds=subnet-12345,securityGroupIds=sg-12345

# Configura kubectl para el cluster
aws eks update-kubeconfig --name mi-cluster-k8s
```

### Manifiestos Kubernetes (YAML)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mi-app
  labels:
    app: mi-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mi-app
  template:
    metadata:
      labels:
        app: mi-app
    spec:
      containers:
      - name: mi-app
        image: mi-app:1.0
        ports:
        - containerPort: 8080
        env:
        - name: ENTORNO
          value: "produccion"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: mi-app-service
spec:
  selector:
    app: mi-app
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
```

```bash
# Despliega en Kubernetes
kubectl apply -f deployment.yaml

# Verifica
kubectl get pods
kubectl get services

# Escala
kubectl scale deployment mi-app --replicas=4

# Logs de un pod
kubectl logs -f deployment/mi-app

# Describe un pod (útil para debug)
kubectl describe pod <nombre-pod>

# Elimina todo
kubectl delete -f deployment.yaml
```

---

## AKS — Azure Kubernetes Service (Floci-az)

```bash
eval $(floci az env)

# Crea cluster AKS
az aks create \
  --resource-group mi-grupo \
  --name mi-aks-cluster \
  --node-count 2

# Los manifiestos Kubernetes son idénticos (portable!)
kubectl apply -f deployment.yaml
```

---

## Comparación

| | ECS Fargate | EKS | AKS (Azure) | GKE (GCP) |
|-|-------------|-----|-------------|-----------|
| Portabilidad | Solo AWS | Alta (K8s estándar) | Alta (K8s estándar) | Alta (K8s estándar) |
| Complejidad | Baja | Alta | Alta | Media |
| Gestión de nodos | Ninguna | Parcial | Parcial | Parcial |
| Mejor para | Apps simples en AWS | Multi-nube, microservicios | Apps en Azure | Apps en GCP |

---

## Reto del módulo

1. Crea un repositorio ECR y sube la imagen de la app Flask
2. Registra una Task Definition con 256 CPU / 512 MB
3. Crea un cluster ECS y despliega el servicio con 2 replicas
4. Escala a 3 replicas con `update-service`
5. (Bonus) Escribe el `deployment.yaml` de Kubernetes para la misma app

## Preguntas de salida

1. ¿Qué diferencia hay entre ECS y EKS?
2. ¿Por qué preferirías EKS si planeas usar múltiples nubes?
3. ¿Qué es una Task Definition en ECS y qué define?
4. ¿Qué hace `readinessProbe` en Kubernetes?
## Verificación del aprendizaje

Antes de marcar este módulo como completado, confirma esto con evidencia propia:

1. **Lo puedo explicar en una frase.** Escribe qué problema resuelve este módulo y para qué lo usarías en una aplicación real.
2. **Lo ejecuté, no solo lo leí.** Guarda el comando principal que corriste y una salida real de tu terminal.
3. **Lo puedo verificar.** Consulta el recurso con AWS CLI, Azure CLI, GCP CLI o StackPort cuando aplique. La evidencia debe mostrar nombre, estado o contenido del recurso.
4. **Entiendo un fallo común.** Provoca o identifica un error sencillo, copia el mensaje completo y explica cómo lo diagnosticaste.
5. **Sé cuándo avanzar.** Avanza solo si puedes repetir el laboratorio desde una carpeta limpia sin depender de copiar a ciegas.

Evidencia mínima sugerida:

```text
Comando ejecutado:
Salida obtenida:
Qué significa la salida:
Error o duda encontrada:
Cómo la resolví:
```

