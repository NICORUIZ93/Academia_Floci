"""Recibe (hasta 10) mensajes de una cola SQS sin eliminarlos todavía.

Uso: python3 sqs_receive_message.py <queue-url>
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
    if len(sys.argv) < 2:
        raise SystemExit("Uso: python3 sqs_receive_message.py <queue-url>")
    queue_url = sys.argv[1]

    result = sqs.receive_message(QueueUrl=queue_url, MaxNumberOfMessages=10, WaitTimeSeconds=2)
    messages = result.get("Messages", [])
    if not messages:
        print("No hay mensajes disponibles ahora mismo.")
        return

    print(f"{len(messages)} mensaje(s) recibido(s):")
    for msg in messages:
        print(f"  - {msg['Body']} (ReceiptHandle: {msg['ReceiptHandle'][:20]}...)")
    print("\nUsa sqs_delete_message.py con el ReceiptHandle completo para confirmarlos.")


if __name__ == "__main__":
    main()
