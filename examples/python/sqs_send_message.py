"""Envía un mensaje a una cola SQS.

Uso: python3 sqs_send_message.py <queue-url> <texto-del-mensaje>
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
        raise SystemExit("Uso: python3 sqs_send_message.py <queue-url> <texto-del-mensaje>")
    queue_url = sys.argv[1]
    message_body = " ".join(sys.argv[2:])

    result = sqs.send_message(QueueUrl=queue_url, MessageBody=message_body)
    print("Mensaje enviado. MessageId:", result["MessageId"])


if __name__ == "__main__":
    main()
