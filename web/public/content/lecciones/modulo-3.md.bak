# Módulo 3 · Bases de datos NoSQL: DynamoDB, Cosmos DB y Firestore

## SQL vs NoSQL — cuándo elegir cada uno

Usa **SQL (RDS)** cuando: los datos tienen relaciones complejas, necesitas transacciones ACID, el esquema es estable.

Usa **NoSQL (DynamoDB)** cuando: necesitas escala automática a millones de ops/segundo, el patrón de acceso es predecible, quieres pagar por uso.

| AWS | Azure | GCP |
|-----|-------|-----|
| DynamoDB | Cosmos DB | Firestore / Datastore |

## El error más común

Modelar DynamoDB como SQL (una tabla por entidad, con relaciones). Esto lleva a `Scan` masivos que son lentos y costosos.

**Regla de oro**: diseña la tabla desde los **patrones de acceso**, no desde las entidades.

---

## AWS DynamoDB con Floci

```bash
eval $(floci env)

# Crea la tabla con PK (Partition Key) y SK (Sort Key)
aws dynamodb create-table \
  --table-name Tareas \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

# Inserta ítems
aws dynamodb put-item --table-name Tareas --item '{
  "PK":{"S":"USER#alice"}, "SK":{"S":"TAREA#001"},
  "titulo":{"S":"Aprender DynamoDB"}, "estado":{"S":"pendiente"}
}'

aws dynamodb put-item --table-name Tareas --item '{
  "PK":{"S":"USER#alice"}, "SK":{"S":"TAREA#002"},
  "titulo":{"S":"Practicar Floci"}, "estado":{"S":"completada"}
}'

# Query (CORRECTO — usa el índice, solo lee las tareas de alice)
aws dynamodb query \
  --table-name Tareas \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values '{":pk":{"S":"USER#alice"}}'

# Get un ítem específico (la operación más eficiente)
aws dynamodb get-item \
  --table-name Tareas \
  --key '{"PK":{"S":"USER#alice"},"SK":{"S":"TAREA#001"}}'

# Scan (INCORRECTO para producción — lee TODA la tabla)
aws dynamodb scan \
  --table-name Tareas \
  --filter-expression "estado = :e" \
  --expression-attribute-values '{":e":{"S":"pendiente"}}'
```

### Actualiza y condiciones

```bash
# Actualizar un campo
aws dynamodb update-item \
  --table-name Tareas \
  --key '{"PK":{"S":"USER#alice"},"SK":{"S":"TAREA#001"}}' \
  --update-expression "SET estado = :nuevo" \
  --expression-attribute-values '{":nuevo":{"S":"completada"}}'

# Escritura condicional — solo inserta si no existe (evita duplicados)
aws dynamodb put-item \
  --table-name Tareas \
  --item '{"PK":{"S":"USER#alice"},"SK":{"S":"TAREA#003"},"titulo":{"S":"Nueva"}}' \
  --condition-expression "attribute_not_exists(PK)"
```

### Global Secondary Index (GSI) — consultar por otros atributos

```bash
# Añade un GSI para consultar por estado
aws dynamodb update-table \
  --table-name Tareas \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=estado,AttributeType=S \
  --global-secondary-index-updates '[{
    "Create": {
      "IndexName": "estado-index",
      "KeySchema": [{"AttributeName":"estado","KeyType":"HASH"}],
      "Projection": {"ProjectionType":"ALL"}
    }
  }]'

# Consulta por estado (todas las tareas pendientes de cualquier usuario)
aws dynamodb query \
  --table-name Tareas \
  --index-name estado-index \
  --key-condition-expression "estado = :e" \
  --expression-attribute-values '{":e":{"S":"pendiente"}}'
```

### TTL — expiración automática

```bash
aws dynamodb update-time-to-live \
  --table-name Tareas \
  --time-to-live-specification Enabled=true,AttributeName=expira

EXPIRA=$(date -d "+1 hour" +%s 2>/dev/null || date -v+1H +%s)
aws dynamodb put-item --table-name Tareas --item "{
  \"PK\":{\"S\":\"USER#alice\"},
  \"SK\":{\"S\":\"TEMP#001\"},
  \"titulo\":{\"S\":\"Expira en 1 hora\"},
  \"expira\":{\"N\":\"$EXPIRA\"}
}"
```

### Desde Python (boto3)

```python
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test"
)
table = dynamodb.Table("Tareas")

# Inserta
table.put_item(Item={"PK":"USER#alice","SK":"TAREA#010","titulo":"Desde Python","estado":"pendiente"})

# Query
resp = table.query(KeyConditionExpression=Key("PK").eq("USER#alice"))
for item in resp["Items"]:
    print(item["titulo"], item["estado"])

# Condicional (no duplicar)
try:
    table.put_item(
        Item={"PK":"USER#alice","SK":"TAREA#010","titulo":"Duplicada"},
        ConditionExpression="attribute_not_exists(PK)"
    )
except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
    print("Ya existe, no se insertó")
```

---

## GCP Firestore con Floci-gcp

```bash
export FIRESTORE_EMULATOR_HOST=localhost:4588
```

```python
import os
os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:4588"

from google.cloud import firestore

db = firestore.Client(project="floci-local")

# Crear documento
ref = db.collection("tareas").document("alice_001")
ref.set({"titulo": "Aprender Firestore", "estado": "pendiente", "usuario": "alice"})

# Leer
doc = ref.get()
print(doc.to_dict())

# Consultar colección con filtro
tareas = db.collection("tareas").where("estado", "==", "pendiente").stream()
for t in tareas:
    print(t.id, t.to_dict())

# Actualizar
ref.update({"estado": "completada"})
```

---

## Azure Cosmos DB con Floci-az

```python
from azure.cosmos import CosmosClient

client = CosmosClient(
    url="http://localhost:4577",
    credential="C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=="
)

db = client.create_database_if_not_exists("MiApp")
container = db.create_container_if_not_exists(id="Tareas", partition_key="/usuario")

container.upsert_item({"id":"t001","usuario":"alice","titulo":"Cosmos DB","estado":"pendiente"})

for item in container.query_items(
    query="SELECT * FROM c WHERE c.usuario = 'alice'",
    enable_cross_partition_query=True
):
    print(item)
```

---

## Comparación

| | DynamoDB | Cosmos DB | Firestore |
|-|----------|-----------|-----------|
| Modelo | Clave-valor + documento | Multi-modelo | Documento |
| Query | Por PK/SK, GSI | SQL, Mongo, Gremlin, Cassandra | Colección + filtros |
| Streams | DynamoDB Streams | Change Feed | Firestore Triggers |
| TTL | Sí | Sí | Sí |

---

## Reto del módulo

1. Crea tabla `Tareas` con PK=`USER#<id>` y SK=`TAREA#<id>`
2. Inserta 5 tareas para `alice` y 3 para `bob`
3. Consulta las tareas de `alice` con Query (no Scan)
4. Crea un GSI por `estado` y lista todas las tareas `pendiente`
5. Escribe una función Python con escritura condicional que no duplique tareas
6. (Bonus) Replica el modelo en Firestore con Floci-gcp

## Preguntas de salida

1. ¿Por qué Scan es peligroso con tablas grandes?
2. ¿Cómo decides qué atributo usar como Partition Key?
3. ¿Cuándo elegirías DynamoDB sobre RDS PostgreSQL?
4. ¿Qué hace un GSI y qué problema resuelve?
