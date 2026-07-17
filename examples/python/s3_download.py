"""Descarga un objeto de S3 a un archivo local.

Uso: python3 s3_download.py <bucket> <clave> [ruta-destino]
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
        raise SystemExit("Uso: python3 s3_download.py <bucket> <clave> [ruta-destino]")
    bucket, key = sys.argv[1], sys.argv[2]
    output = sys.argv[3] if len(sys.argv) > 3 else key.split("/")[-1]

    try:
        s3.download_file(bucket, key, output)
    except ClientError as error:
        if error.response["Error"]["Code"] == "404":
            raise SystemExit(f'No existe el objeto "{key}" en el bucket "{bucket}".')
        raise

    print(f"Descargado: s3://{bucket}/{key} -> {output}")


if __name__ == "__main__":
    main()
