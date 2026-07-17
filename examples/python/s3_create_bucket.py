"""Crea un bucket S3 nuevo en Floci.

Uso: python3 s3_create_bucket.py [nombre-del-bucket]
"""
import sys
import time

import boto3
from botocore.exceptions import ClientError

s3 = boto3.client(
    "s3",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)


def main():
    bucket_name = sys.argv[1] if len(sys.argv) > 1 else f"mi-bucket-{int(time.time())}"
    try:
        s3.create_bucket(Bucket=bucket_name)
        print("Bucket creado:", bucket_name)
    except ClientError as error:
        if error.response["Error"]["Code"] == "BucketAlreadyOwnedByYou":
            print(f'El bucket "{bucket_name}" ya existe. Elige otro nombre o elimínalo primero.')
        else:
            raise


if __name__ == "__main__":
    main()
