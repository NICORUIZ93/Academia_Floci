"""Crea un recurso (ruta) /tareas bajo el recurso raíz de una API REST.

Uso: python3 apigateway_create_resource.py <api-id> [ruta]
"""
import sys

import boto3

apigateway = boto3.client(
    "apigateway",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Uso: python3 apigateway_create_resource.py <api-id> [ruta]")
    api_id = sys.argv[1]
    nueva_ruta = sys.argv[2] if len(sys.argv) > 2 else "tareas"

    resources = apigateway.get_resources(restApiId=api_id)
    root = next((r for r in resources["items"] if r["path"] == "/"), None)
    if root is None:
        raise SystemExit('No se encontró el recurso raíz "/" de la API')

    created = apigateway.create_resource(restApiId=api_id, parentId=root["id"], pathPart=nueva_ruta)
    print(f"Recurso creado: /{nueva_ruta}")
    print("Resource ID:", created["id"])
    print("Siguiente paso: python3 apigateway_put_method.py", api_id, created["id"])


if __name__ == "__main__":
    main()
