# Ejemplos de referencia

Esta carpeta contiene implementaciones de comparación, no el punto de partida.

Regla del curso: intenta cada reto durante al menos 30 minutos, registra el error
y explica con tus palabras qué esperabas antes de consultar estos archivos.

- `python/demo.py`: cliente de S3, SQS y DynamoDB.
- `node/demo.mjs`: cliente de S3 y SQS.
- `init/ready.d/10-seed.sh`: ejemplo de inicialización idempotente.

El `docker-compose.yml` principal no monta el hook de inicialización. Si llegas
al módulo de hooks, deberás descubrir y agregar tú mismo el montaje correcto.

