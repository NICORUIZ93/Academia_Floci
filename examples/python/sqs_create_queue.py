"""Crea una cola SQS en Floci.

Uso: python3 sqs_create_queue.py [nombre-de-cola]
"""
import sys
import time

import boto3

sqs = boto3.client(
    "sqs",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)


def main():
    queue_name = sys.argv[1] if len(sys.argv) > 1 else f"mi-cola-{int(time.time())}"
    result = sqs.create_queue(QueueName=queue_name)
    print("Cola creada:", queue_name)
    print("URL:", result["QueueUrl"])


if __name__ == "__main__":
    main()
