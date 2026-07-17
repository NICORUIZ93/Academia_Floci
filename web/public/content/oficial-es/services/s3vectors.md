# S3 Vectores

**Protocolo:** REST JSON
**Punto final:** `POST /{OperationName}` (por ejemplo, `POST /CreateVectorBucket`)

Floci emula los vectores S3 API: depósitos de vectores, índices de vectores y
almacenamiento con consultas de similitud. Todas las operaciones utilizan el cable AWS REST JSON
forma, por lo que los clientes AWS SDK y CLI `s3vectors` funcionan sin modificaciones.

## Operaciones compatibles

| Categoría | Operaciones |
|---|---|
| **Cubos vectoriales** | CreateVectorBucket, GetVectorBucket, ListVectorBuckets, DeleteVectorBucket |
| **Índices** | CreateIndex, GetIndex, ListIndexes, DeleteIndex |
| **Vectores** | PutVectors, GetVectors, DeleteVectors, QueryVectors |

## Ejemplo de

```bash
aws s3vectors create-vector-bucket --vector-bucket-name my-vectors \
  --endpoint-url http://localhost:4566

aws s3vectors create-index --vector-bucket-name my-vectors \
  --index-name embeddings --dimension 4 --distance-metric cosine \
  --data-type float32 \
  --endpoint-url http://localhost:4566

aws s3vectors put-vectors --vector-bucket-name my-vectors --index-name embeddings \
  --vectors '[{"key":"a","data":{"float32":[0.1,0.2,0.3,0.4]}}]' \
  --endpoint-url http://localhost:4566

aws s3vectors query-vectors --vector-bucket-name my-vectors --index-name embeddings \
  --query-vector '{"float32":[0.1,0.2,0.3,0.4]}' --top-k 1 \
  --endpoint-url http://localhost:4566
```
