"""Elimina una función Lambda.

Uso: python3 lambda_delete.py <nombre-funcion>
"""
import sys

import boto3
from botocore.exceptions import ClientError

lambda_client = boto3.client(
    "lambda",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Uso: python3 lambda_delete.py <nombre-funcion>")
    function_name = sys.argv[1]

    try:
        lambda_client.delete_function(FunctionName=function_name)
    except ClientError as error:
        if error.response["Error"]["Code"] == "ResourceNotFoundException":
            raise SystemExit(f'No existe la función "{function_name}" (o ya fue eliminada).')
        raise
    print("Función eliminada:", function_name)


if __name__ == "__main__":
    main()
