import json

import boto3


ENDPOINT = "http://localhost:4566"
COMMON = {
    "endpoint_url": ENDPOINT,
    "region_name": "us-east-1",
    "aws_access_key_id": "test",
    "aws_secret_access_key": "test",
}

s3 = boto3.client("s3", **COMMON)
sqs = boto3.client("sqs", **COMMON)
dynamodb = boto3.resource("dynamodb", **COMMON)

s3.put_object(
    Bucket="curso-cloud-local",
    Key="saludos/hola.txt",
    Body=b"Hola desde Python y Cloud Local\n",
)

queue_url = sqs.get_queue_url(QueueName="pedidos")["QueueUrl"]
sqs.send_message(
    QueueUrl=queue_url,
    MessageBody=json.dumps({"pedidoId": "P-100", "estado": "creado"}),
)

table = dynamodb.Table("Usuarios")
table.put_item(Item={"id": "u-1", "nombre": "Ana", "pais": "Colombia"})

print("S3:", s3.list_objects_v2(Bucket="curso-cloud-local").get("Contents", []))
print("SQS:", sqs.receive_message(QueueUrl=queue_url).get("Messages", []))
print("DynamoDB:", table.get_item(Key={"id": "u-1"}).get("Item"))

