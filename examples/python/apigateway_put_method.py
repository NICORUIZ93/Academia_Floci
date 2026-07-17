"""Añade un método GET a un recurso, con respuesta mock (sin Lambda todavía).

Uso: python3 apigateway_put_method.py <api-id> <resource-id>
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
    if len(sys.argv) < 3:
        raise SystemExit("Uso: python3 apigateway_put_method.py <api-id> <resource-id>")
    api_id, resource_id = sys.argv[1], sys.argv[2]

    apigateway.put_method(
        restApiId=api_id, resourceId=resource_id, httpMethod="GET", authorizationType="NONE"
    )
    print("Método GET creado en el recurso.")

    # Integración MOCK: responde sin invocar ningún backend real todavía.
    apigateway.put_integration(
        restApiId=api_id,
        resourceId=resource_id,
        httpMethod="GET",
        type="MOCK",
        requestTemplates={"application/json": '{"statusCode": 200}'},
    )
    print("Integración MOCK configurada. Para conectar una Lambda real, usa integración AWS_PROXY.")


if __name__ == "__main__":
    main()
