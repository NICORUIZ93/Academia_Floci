"""Elimina un item de DynamoDB por su clave primaria.

Uso: python3 dynamodb_delete_item.py <tabla> <id>
"""
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
        raise SystemExit("Uso: python3 dynamodb_delete_item.py <tabla> <id>")
    table_name, item_id = sys.argv[1], sys.argv[2]

    dynamodb.delete_item(TableName=table_name, Key={"id": {"S": item_id}})
    print(f'Item id="{item_id}" eliminado de {table_name}.')


if __name__ == "__main__":
    main()
