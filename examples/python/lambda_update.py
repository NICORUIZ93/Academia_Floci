"""Actualiza el código de una función Lambda existente y la vuelve a invocar.

Uso: python3 lambda_update.py <nombre-funcion>
"""
import io
import json
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

NUEVO_HANDLER = """
import json

def handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps({"mensaje": "Versión actualizada del handler", "recibido": event}),
    }
"""


def build_zip():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as zf:
        zf.writestr("handler.py", NUEVO_HANDLER)
    return buffer.getvalue()


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Uso: python3 lambda_update.py <nombre-funcion>")
    function_name = sys.argv[1]

    lambda_client.update_function_code(FunctionName=function_name, ZipFile=build_zip())
    print("Código actualizado para:", function_name)

    result = lambda_client.invoke(
        FunctionName=function_name,
        Payload=json.dumps({"prueba": "post-actualización"}).encode("utf-8"),
    )
    print("Respuesta tras actualizar:", result["Payload"].read().decode("utf-8"))


if __name__ == "__main__":
    main()
