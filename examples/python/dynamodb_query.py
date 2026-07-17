"""Consulta items de DynamoDB por clave de partición con Query (más eficiente que Scan).

Uso: python3 dynamodb_query.py <tabla> <id>
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
    if len(sys.argv) < 3:
        raise SystemExit("Uso: python3 dynamodb_query.py <tabla> <id>")
    table_name, item_id = sys.argv[1], sys.argv[2]

    # Query exige una condición de igualdad sobre la clave de partición (KeyConditionExpression).
    # Con una tabla de clave simple como esta, Query devuelve como máximo un item: su verdadera
    # ventaja aparece con una clave de ordenación o un índice secundario (GSI, ver Módulo 4),
    # donde puedes acotar un rango de items relacionados sin recorrer la tabla entera.
    result = dynamodb.query(
        TableName=table_name,
        KeyConditionExpression="id = :id",
        ExpressionAttributeValues={":id": {"S": item_id}},
    )

    if not result["Items"]:
        print(f'No existe ningún item con id="{item_id}" en {table_name}.')
        return
    print(f'{result["Count"]} item(s) encontrado(s) (escaneados: {result["ScannedCount"]}):')
    print(json.dumps(result["Items"], indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
