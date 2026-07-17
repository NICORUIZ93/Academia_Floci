"""Elimina un objeto de S3 (y opcionalmente el bucket si queda vacío).

Uso: python3 s3_delete.py <bucket> <clave> [--bucket-tambien]
"""
import sys

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
    if len(sys.argv) < 3:
        raise SystemExit("Uso: python3 s3_delete.py <bucket> <clave> [--bucket-tambien]")
    bucket, key = sys.argv[1], sys.argv[2]
    borrar_bucket = "--bucket-tambien" in sys.argv[3:]

    s3.delete_object(Bucket=bucket, Key=key)
    print(f"Objeto eliminado: s3://{bucket}/{key}")

    if borrar_bucket:
        try:
            s3.delete_bucket(Bucket=bucket)
            print(f"Bucket eliminado: {bucket}")
        except ClientError as error:
            if error.response["Error"]["Code"] == "BucketNotEmpty":
                raise SystemExit("El bucket todavía tiene objetos. Elimínalos antes de borrar el bucket.")
            raise


if __name__ == "__main__":
    main()
