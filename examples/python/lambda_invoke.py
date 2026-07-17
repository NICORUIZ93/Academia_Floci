"""Invoca una función Lambda de forma síncrona y muestra su respuesta.

Uso: python3 lambda_invoke.py <nombre-funcion> [json-de-entrada]
"""
import json
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
        raise SystemExit("Uso: python3 lambda_invoke.py <nombre-funcion> [json-de-entrada]")
    function_name = sys.argv[1]
    payload = sys.argv[2] if len(sys.argv) > 2 else json.dumps({"origen": "lambda_invoke.py"})

    try:
        result = lambda_client.invoke(FunctionName=function_name, Payload=payload.encode("utf-8"))
    except ClientError as error:
        if error.response["Error"]["Code"] == "ResourceNotFoundException":
            raise SystemExit(f'No existe la función "{function_name}". Créala primero con lambda_create_function.py')
        raise

    print("Status code HTTP de la invocación:", result["StatusCode"])
    if result.get("FunctionError"):
        print("La función terminó con error:", result["FunctionError"])
    print("Respuesta:", result["Payload"].read().decode("utf-8"))


if __name__ == "__main__":
    main()
