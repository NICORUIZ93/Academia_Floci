"""Crea una tabla DynamoDB con clave primaria simple "id".

Uso: python3 dynamodb_create_table.py [nombre-tabla]
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
    table_name = sys.argv[1] if len(sys.argv) > 1 else f"MiTabla{int(time.time())}"

    dynamodb.create_table(
        TableName=table_name,
        AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
        BillingMode="PAY_PER_REQUEST",
    )
    waiter = dynamodb.get_waiter("table_exists")
    waiter.wait(TableName=table_name)
    print("Tabla creada y activa:", table_name)


if __name__ == "__main__":
    main()
