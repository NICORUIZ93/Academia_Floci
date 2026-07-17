"""Inserta (o sobrescribe) un item en una tabla DynamoDB.

Uso: python3 dynamodb_put_item.py <tabla> <id> <titulo>
"""
import sys
import time

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
        raise SystemExit("Uso: python3 dynamodb_put_item.py <tabla> <id> <titulo>")
    table_name, item_id = sys.argv[1], sys.argv[2]
    titulo = " ".join(sys.argv[3:]) or "Sin título"

    dynamodb.put_item(
        TableName=table_name,
        Item={
            "id": {"S": item_id},
            "titulo": {"S": titulo},
            "estado": {"S": "pendiente"},
            "creado": {"N": str(int(time.time()))},
        },
    )
    print(f'Item insertado en {table_name}: id={item_id}, titulo="{titulo}"')


if __name__ == "__main__":
    main()
