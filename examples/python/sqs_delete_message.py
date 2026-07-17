"""Elimina (confirma el procesamiento de) un mensaje de una cola SQS.

Uso: python3 sqs_delete_message.py <queue-url> <receipt-handle>
"""
import sys

import boto3

sqs = boto3.client(
    "sqs",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)


def main():
    if len(sys.argv) < 3:
        raise SystemExit("Uso: python3 sqs_delete_message.py <queue-url> <receipt-handle>")
    queue_url, receipt_handle = sys.argv[1], sys.argv[2]

    sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt_handle)
    print("Mensaje eliminado de la cola.")


if __name__ == "__main__":
    main()
