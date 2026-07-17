"""Sube un archivo local a un bucket S3 en Floci.

Uso: python3 s3_upload.py <bucket> <ruta-local> [clave-destino]
"""
import os
import sys

import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)


def main():
    if len(sys.argv) < 3:
        raise SystemExit("Uso: python3 s3_upload.py <bucket> <ruta-local> [clave-destino]")
    bucket, file_path = sys.argv[1], sys.argv[2]
    key = sys.argv[3] if len(sys.argv) > 3 else os.path.basename(file_path)

    s3.upload_file(file_path, bucket, key)
    size = os.path.getsize(file_path)
    print(f"Subido: {file_path} -> s3://{bucket}/{key} ({size} bytes)")


if __name__ == "__main__":
    main()
