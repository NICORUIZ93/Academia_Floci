"""Empaqueta un handler mínimo y despliega una función Lambda en Floci.

Uso: python3 lambda_create_function.py [nombre-funcion]
"""
import io
import sys
import zipfile

import boto3

lambda_client = boto3.client(
    "lambda",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)

HANDLER_CODE = """
import json

def handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps({"mensaje": "Hola desde Lambda en Floci", "recibido": event}),
    }
"""


def build_zip():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as zf:
        zf.writestr("handler.py", HANDLER_CODE)
    return buffer.getvalue()


def main():
    function_name = sys.argv[1] if len(sys.argv) > 1 else "mi-funcion"

    lambda_client.create_function(
        FunctionName=function_name,
        Runtime="python3.12",
        Role="arn:aws:iam::000000000000:role/lambda-role",
        Handler="handler.handler",
        Code={"ZipFile": build_zip()},
    )
    print("Función Lambda creada:", function_name)
    print("Invócala con: python3 lambda_invoke.py", function_name)


if __name__ == "__main__":
    main()
