# Módulo 9 · Bases de datos relacionales: RDS y ElastiCache

## Floci usa bases de datos reales

A diferencia de otros emuladores, **Floci usa PostgreSQL y MySQL reales** para RDS, y **Redis real** para ElastiCache. No son mocks — son instancias completas que corren localmente.

```bash
eval $(floci env)
```

---

## Amazon RDS con Floci (PostgreSQL real)

```bash
# Crea una instancia RDS PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier mi-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password "MiPassSegura123!" \
  --allocated-storage 20 \
  --no-publicly-accessible

# Espera a que esté disponible
aws rds wait db-instance-available \
  --db-instance-identifier mi-postgres

# Obtén el endpoint
ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier mi-postgres \
  --query "DBInstances[0].Endpoint.Address" \
  --output text)

PORT=$(aws rds describe-db-instances \
  --db-instance-identifier mi-postgres \
  --query "DBInstances[0].Endpoint.Port" \
  --output text)

echo "Conexión: $ENDPOINT:$PORT"
```

### Conéctate con psql

```bash
psql -h $ENDPOINT -p $PORT -U admin -d postgres

# Una vez conectado en psql:
CREATE DATABASE mi_app;
\c mi_app

CREATE TABLE tareas (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL,
  titulo TEXT NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  creada_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO tareas (usuario, titulo) VALUES
  ('alice', 'Aprender RDS'),
  ('alice', 'Practicar SQL'),
  ('bob', 'Configurar VPC');

SELECT * FROM tareas WHERE usuario = 'alice' ORDER BY creada_en;
```

### Desde Python con psycopg2

```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="mi_app",
    user="admin",
    password="MiPassSegura123!"
)

cursor = conn.cursor()

# Inserta con placeholders (previene SQL injection)
cursor.execute(
    "INSERT INTO tareas (usuario, titulo, estado) VALUES (%s, %s, %s)",
    ("alice", "Nueva tarea desde Python", "pendiente")
)
conn.commit()

# Consulta
cursor.execute("SELECT * FROM tareas WHERE usuario = %s", ("alice",))
for row in cursor.fetchall():
    print(row)

cursor.close()
conn.close()
```

### Desde Python con SQLAlchemy (ORM)

```python
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

engine = create_engine("postgresql://admin:MiPassSegura123!@localhost:5432/mi_app")
Base = declarative_base()

class Tarea(Base):
    __tablename__ = "tareas"
    id = Column(Integer, primary_key=True)
    usuario = Column(String(100))
    titulo = Column(String)
    estado = Column(String(50), default="pendiente")
    creada_en = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

# Crea
with Session() as s:
    tarea = Tarea(usuario="alice", titulo="Con SQLAlchemy")
    s.add(tarea)
    s.commit()

# Lee
with Session() as s:
    tareas = s.query(Tarea).filter_by(usuario="alice").all()
    for t in tareas:
        print(t.titulo, t.estado)
```

### RDS MySQL

```bash
aws rds create-db-instance \
  --db-instance-identifier mi-mysql \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0 \
  --master-username root \
  --master-user-password "MiPassMysql123!" \
  --allocated-storage 20

# Conéctate cuando esté listo
mysql -h localhost -u root -p'MiPassMysql123!'
```

---

## Amazon ElastiCache — Redis real con Floci

Floci usa **Redis real** para ElastiCache. Redis es ideal para:
- Caché (acelerar consultas lentas a DB)
- Sesiones de usuario
- Rate limiting
- Pub/Sub en tiempo real
- Colas de prioridad

```bash
# Crea un cluster Redis
aws elasticache create-cache-cluster \
  --cache-cluster-id mi-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1

# Obtén el endpoint
REDIS_HOST=$(aws elasticache describe-cache-clusters \
  --cache-cluster-id mi-redis \
  --show-cache-node-info \
  --query "CacheClusters[0].CacheNodes[0].Endpoint.Address" \
  --output text)

echo "Redis: $REDIS_HOST:6379"

# Conéctate directamente
redis-cli -h $REDIS_HOST
```

### Comandos Redis esenciales

```bash
# En redis-cli:
SET nombre "Alice"
GET nombre                  # "Alice"

# Con expiración (TTL en segundos)
SET sesion:abc123 "datos-de-sesion" EX 3600

# Contadores (rate limiting)
INCR contador:alice
INCR contador:alice
GET contador:alice          # "2"

# Hashes (objetos)
HSET usuario:alice nombre "Alice" email "alice@ejemplo.com" plan "premium"
HGET usuario:alice nombre
HGETALL usuario:alice

# Listas (cola o stack)
LPUSH tareas_pendientes "tarea-1" "tarea-2"
RPOP tareas_pendientes      # Consume por la derecha (FIFO con LPUSH+RPOP)

# Sets (sin duplicados)
SADD usuarios:online alice bob charlie
SMEMBERS usuarios:online
SISMEMBER usuarios:online alice   # 1 (sí está)

# Sorted Sets (con puntuación — tabla de liderazgo, prioridades)
ZADD ranking 100 alice 75 bob 150 charlie
ZRANGE ranking 0 -1 WITHSCORES     # Orden ascendente
ZREVRANGE ranking 0 2 WITHSCORES   # Top 3
```

### Redis como caché con Python

```python
import redis
import psycopg2
import json

redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)

def obtener_tareas_usuario(usuario):
    cache_key = f"tareas:{usuario}"

    # 1. Busca en caché
    cached = redis_client.get(cache_key)
    if cached:
        print("Cache HIT")
        return json.loads(cached)

    # 2. Si no está, consulta la DB
    print("Cache MISS - consultando DB")
    conn = psycopg2.connect(host="localhost", user="admin", password="MiPassSegura123!", database="mi_app")
    cursor = conn.cursor()
    cursor.execute("SELECT id, titulo, estado FROM tareas WHERE usuario = %s", (usuario,))
    tareas = [{"id": r[0], "titulo": r[1], "estado": r[2]} for r in cursor.fetchall()]
    conn.close()

    # 3. Guarda en caché por 5 minutos
    redis_client.setex(cache_key, 300, json.dumps(tareas))

    return tareas

# Primera llamada: MISS (consulta DB y llena caché)
tareas = obtener_tareas_usuario("alice")

# Segunda llamada: HIT (lee de caché)
tareas = obtener_tareas_usuario("alice")
```

### Rate limiting con Redis

```python
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

def verificar_rate_limit(usuario, limite=10, ventana_segundos=60):
    """
    Permite máximo `limite` llamadas por `ventana_segundos` por usuario.
    Retorna (permitido: bool, restantes: int)
    """
    key = f"ratelimit:{usuario}"
    actual = r.incr(key)
    if actual == 1:
        r.expire(key, ventana_segundos)

    restantes = max(0, limite - actual)
    return actual <= limite, restantes

# Uso en API
def llamar_api(usuario):
    permitido, restantes = verificar_rate_limit(usuario, limite=5, ventana_segundos=60)
    if not permitido:
        return {"error": "Límite de llamadas excedido"}, 429
    return {"datos": "..."}, 200
```

---

## Cuándo usar RDS vs DynamoDB

| Escenario | Usa |
|-----------|-----|
| Datos con relaciones complejas | RDS (SQL) |
| Informes con joins y agregaciones | RDS (SQL) |
| Millones de ops/s, escala automática | DynamoDB |
| Patrón de acceso simple (key-value) | DynamoDB |
| Transacciones ACID entre tablas | RDS |

---

## Reto del módulo

1. Crea una instancia RDS PostgreSQL y una tabla `usuarios` con id, nombre, email, creado_en
2. Inserta 10 usuarios con Python + psycopg2 (usa placeholders, nunca concatenes strings)
3. Crea un cluster ElastiCache Redis
4. Implementa la función `obtener_tareas_usuario` con caché Redis
5. Usa `redis-cli` para verificar que la clave se crea y expira correctamente
6. Implementa el rate limiter y prueba que rechaza la llamada 6 de 5 permitidas

## Preguntas de salida

1. ¿Por qué nunca debes concatenar strings en SQL? ¿Qué ataque previene usar placeholders?
2. ¿Qué diferencia hay entre una clave Redis sin TTL y con TTL?
3. ¿Cuándo es mejor usar ElastiCache en lugar de DynamoDB para leer datos?
4. ¿Qué hace `INCR` en Redis y por qué es atómico?
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

