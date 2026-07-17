"""Despliega una API REST a un stage, dejándola accesible por HTTP.

Uso: python3 apigateway_deploy.py <api-id> [stage]
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
        raise SystemExit("Uso: python3 apigateway_deploy.py <api-id> [stage]")
    api_id = sys.argv[1]
    stage = sys.argv[2] if len(sys.argv) > 2 else "dev"

    # CreateDeployment congela una "foto" de los recursos/métodos actuales de la API y la
    # publica bajo un stage. Sin este paso, los métodos configurados con apigateway_put_method
    # solo existen en la definición de la API, pero no son alcanzables por HTTP todavía.
    apigateway.create_deployment(restApiId=api_id, stageName=stage)

    invoke_url = f"http://localhost:4566/restapis/{api_id}/{stage}/_user_request_"
    print(f'API desplegada en el stage "{stage}".')
    print("URL de invocación:", invoke_url)
    print(f"Prueba con: curl {invoke_url}/tareas")


if __name__ == "__main__":
    main()
