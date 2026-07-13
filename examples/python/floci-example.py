"""Cambio P1: ejemplo completo de Floci en Python.

Cubre S3, SQS y DynamoDB con creacion, uso y limpieza.
"""

import time

import boto3
from botocore.exceptions import ClientError


ENDPOINT = "http://localhost:4566"
REGION = "us-east-1"

s3 = boto3.client(
    "s3",
    endpoint_url=ENDPOINT,
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name=REGION,
)
sqs = boto3.client(
    "sqs",
    endpoint_url=ENDPOINT,
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name=REGION,
)
dynamodb = boto3.client(
    "dynamodb",
    endpoint_url=ENDPOINT,
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name=REGION,
)

suffix = str(int(time.time()))
bucket_name = f"academia-floci-python-{suffix}"
object_key = "hola-floci.txt"
queue_name = f"academia-floci-python-{suffix}"
table_name = f"AcademiaFlociPython{suffix}"


def run_s3_example():
    print("\nS3")
    s3.create_bucket(Bucket=bucket_name)
    print("Bucket creado:", bucket_name)

    s3.put_object(Bucket=bucket_name, Key=object_key, Body=b"Hola desde Python y Floci")
    print("Objeto subido:", object_key)

    objects = s3.list_objects_v2(Bucket=bucket_name)
    print("Objetos:", [item["Key"] for item in objects.get("Contents", [])])

    downloaded = s3.get_object(Bucket=bucket_name, Key=object_key)
    print("Descargado:", downloaded["Body"].read().decode("utf-8"))

    s3.delete_object(Bucket=bucket_name, Key=object_key)
    s3.delete_bucket(Bucket=bucket_name)
    print("Bucket limpiado")


def run_sqs_example():
    print("\nSQS")
    created = sqs.create_queue(QueueName=queue_name)
    queue_url = created["QueueUrl"]
    print("Cola creada:", queue_url)

    sqs.send_message(QueueUrl=queue_url, MessageBody="Hola desde SQS en Floci")
    print("Mensaje enviado")

    received = sqs.receive_message(
        QueueUrl=queue_url,
        MaxNumberOfMessages=1,
        WaitTimeSeconds=1,
    )
    message = received.get("Messages", [{}])[0]
    print("Mensaje recibido:", message.get("Body", "sin mensajes"))

    if message.get("ReceiptHandle"):
        sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=message["ReceiptHandle"])
        print("Mensaje eliminado")

    sqs.delete_queue(QueueUrl=queue_url)
    print("Cola eliminada")


def wait_for_table(status):
    for _ in range(20):
        try:
            table = dynamodb.describe_table(TableName=table_name)["Table"]
        except ClientError:
            table = {}
        if table.get("TableStatus") == status:
            return
        time.sleep(1)
    raise RuntimeError(f"La tabla {table_name} no llego a estado {status}")


def run_dynamodb_example():
    print("\nDynamoDB")
    dynamodb.create_table(
        TableName=table_name,
        AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
        BillingMode="PAY_PER_REQUEST",
    )
    wait_for_table("ACTIVE")
    print("Tabla creada:", table_name)

    dynamodb.put_item(
        TableName=table_name,
        Item={
            "id": {"S": "1"},
            "titulo": {"S": "Aprender Floci con Python"},
            "estado": {"S": "pendiente"},
        },
    )
    print("Item insertado")

    item = dynamodb.get_item(TableName=table_name, Key={"id": {"S": "1"}})
    print("Item obtenido:", item.get("Item"))

    scan = dynamodb.scan(TableName=table_name)
    print("Items en tabla:", scan["Count"])

    dynamodb.delete_item(TableName=table_name, Key={"id": {"S": "1"}})
    print("Item eliminado")

    dynamodb.delete_table(TableName=table_name)
    print("Tabla eliminada")


def main():
    run_s3_example()
    run_sqs_example()
    run_dynamodb_example()
    print("\nEjemplo Python completado correctamente")


if __name__ == "__main__":
    try:
        main()
    except ClientError as error:
        print("No se pudo ejecutar el ejemplo contra Floci:", error)
        print("Verifica que Floci este activo con: ./scripts/validate-floci.sh")
        raise SystemExit(1)
