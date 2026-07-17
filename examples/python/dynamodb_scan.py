"""Recorre TODA la tabla, con un filtro opcional. Más costoso que Query: usar con cuidado.

Uso: python3 dynamodb_scan.py <tabla> [estado]
"""
import json
import sys

import boto3

dynamodb = boto3.client(
    "dynamodb",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Uso: python3 dynamodb_scan.py <tabla> [estado]")
    table_name = sys.argv[1]
    estado = sys.argv[2] if len(sys.argv) > 2 else None

    params = {"TableName": table_name}
    if estado:
        # FilterExpression se aplica DESPUÉS de leer cada item de la tabla completa: no reduce
        # el costo de lectura (RCU), solo lo que se devuelve. Para filtrar de forma eficiente,
        # la clave o un GSI (y Query) siguen siendo preferibles a Scan + filtro.
        params["FilterExpression"] = "estado = :estado"
        params["ExpressionAttributeValues"] = {":estado": {"S": estado}}

    result = dynamodb.scan(**params)
    print(f'{result["Count"]} item(s) (de {result["ScannedCount"]} escaneado(s) en total):')
    print(json.dumps(result["Items"], indent=2, ensure_ascii=False))
    if result.get("LastEvaluatedKey"):
        print("\nHay más resultados: pagina con ExclusiveStartKey usando LastEvaluatedKey.")


if __name__ == "__main__":
    main()
