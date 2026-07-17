"""Actualiza el atributo "estado" de un item existente sin sobrescribir el resto.

Uso: python3 dynamodb_update_item.py <tabla> <id> <nuevo-estado>
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
    if len(sys.argv) < 4:
        raise SystemExit("Uso: python3 dynamodb_update_item.py <tabla> <id> <nuevo-estado>")
    table_name, item_id, nuevo_estado = sys.argv[1], sys.argv[2], sys.argv[3]

    result = dynamodb.update_item(
        TableName=table_name,
        Key={"id": {"S": item_id}},
        UpdateExpression="SET estado = :nuevoEstado",
        ExpressionAttributeValues={":nuevoEstado": {"S": nuevo_estado}},
        ReturnValues="ALL_NEW",
    )
    print("Item actualizado:")
    print(json.dumps(result["Attributes"], indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
