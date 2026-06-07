# Testcontainers — Python

El paquete `testcontainers-floci` integra Floci con [Testcontainers para Python](https://testcontainers-python.readthedocs.io/). Funciona como administrador de contexto y se integra naturalmente con las luminarias pytest.

## Instalación de

```sh
pip install testcontainers-floci
```

```sh
# poetry
poetry add --group dev testcontainers-floci

# uv
uv add --dev testcontainers-floci
```

## Uso básico: administrador de contexto

```python
import boto3
from testcontainers_floci import FlociContainer


def test_s3_create_bucket():
    with FlociContainer() as floci:
        s3 = boto3.client(
            "s3",
            endpoint_url=floci.get_endpoint(),
            region_name=floci.get_region(),
            aws_access_key_id=floci.get_access_key(),
            aws_secret_access_key=floci.get_secret_key(),
        )

        s3.create_bucket(Bucket="my-bucket")

        buckets = [b["Name"] for b in s3.list_buckets()["Buckets"]]
        assert "my-bucket" in buckets
```

## Accesorio Pytest

Utilice un dispositivo con ámbito de sesión para que el contenedor se inicie una vez y se comparta entre todas las pruebas del conjunto.

```python
import pytest
import boto3
from testcontainers_floci import FlociContainer


@pytest.fixture(scope="session")
def floci():
    with FlociContainer() as container:
        yield container


@pytest.fixture(scope="session")
def s3_client(floci):
    return boto3.client(
        "s3",
        endpoint_url=floci.get_endpoint(),
        region_name=floci.get_region(),
        aws_access_key_id=floci.get_access_key(),
        aws_secret_access_key=floci.get_secret_key(),
    )


def test_create_bucket(s3_client):
    s3_client.create_bucket(Bucket="my-bucket")
    buckets = [b["Name"] for b in s3_client.list_buckets()["Buckets"]]
    assert "my-bucket" in buckets


def test_upload_object(s3_client):
    s3_client.create_bucket(Bucket="uploads")
    s3_client.put_object(Bucket="uploads", Key="hello.txt", Body=b"hello floci")
    body = s3_client.get_object(Bucket="uploads", Key="hello.txt")["Body"].read()
    assert body == b"hello floci"
```

## Ejemplo de SQS

```python
import pytest
import boto3
import json
from testcontainers_floci import FlociContainer


@pytest.fixture(scope="session")
def floci():
    with FlociContainer() as container:
        yield container


@pytest.fixture(scope="session")
def sqs_client(floci):
    return boto3.client(
        "sqs",
        endpoint_url=floci.get_endpoint(),
        region_name=floci.get_region(),
        aws_access_key_id=floci.get_access_key(),
        aws_secret_access_key=floci.get_secret_key(),
    )


def test_send_and_receive_message(sqs_client):
    queue_url = sqs_client.create_queue(QueueName="orders")["QueueUrl"]

    sqs_client.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps({"event": "order.placed"}),
    )

    response = sqs_client.receive_message(QueueUrl=queue_url, MaxNumberOfMessages=1)
    messages = response.get("Messages", [])

    assert len(messages) == 1
    assert json.loads(messages[0]["Body"])["event"] == "order.placed"
```

## Ejemplo de DynamoDB

```python
import pytest
import boto3
from testcontainers_floci import FlociContainer


@pytest.fixture(scope="session")
def floci():
    with FlociContainer() as container:
        yield container


@pytest.fixture(scope="session")
def dynamo_client(floci):
    return boto3.client(
        "dynamodb",
        endpoint_url=floci.get_endpoint(),
        region_name=floci.get_region(),
        aws_access_key_id=floci.get_access_key(),
        aws_secret_access_key=floci.get_secret_key(),
    )


def test_put_and_get_item(dynamo_client):
    dynamo_client.create_table(
        TableName="Orders",
        AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
        BillingMode="PAY_PER_REQUEST",
    )

    dynamo_client.put_item(
        TableName="Orders",
        Item={"id": {"S": "order-1"}, "status": {"S": "placed"}},
    )

    item = dynamo_client.get_item(
        TableName="Orders",
        Key={"id": {"S": "order-1"}},
    )["Item"]

    assert item["status"]["S"] == "placed"
```

## Ejemplo de Administrador de secretos

```python
def test_create_and_get_secret(floci):
    sm = boto3.client(
        "secretsmanager",
        endpoint_url=floci.get_endpoint(),
        region_name=floci.get_region(),
        aws_access_key_id=floci.get_access_key(),
        aws_secret_access_key=floci.get_secret_key(),
    )

    sm.create_secret(Name="db/password", SecretString="supersecret")
    value = sm.get_secret_value(SecretId="db/password")["SecretString"]
    assert value == "supersecret"
```

## Patrón conftest.py

Coloque dispositivos compartidos en `conftest.py` para que cada módulo de prueba los recoja automáticamente:

```python
# conftest.py
import pytest
import boto3
from testcontainers_floci import FlociContainer


@pytest.fixture(scope="session")
def floci():
    with FlociContainer() as container:
        yield container


@pytest.fixture(scope="session")
def aws_clients(floci):
    kwargs = dict(
        endpoint_url=floci.get_endpoint(),
        region_name=floci.get_region(),
        aws_access_key_id=floci.get_access_key(),
        aws_secret_access_key=floci.get_secret_key(),
    )
    return {
        "s3": boto3.client("s3", **kwargs),
        "sqs": boto3.client("sqs", **kwargs),
        "dynamodb": boto3.client("dynamodb", **kwargs),
        "secretsmanager": boto3.client("secretsmanager", **kwargs),
    }
```

```python
# test_my_service.py
def test_something(aws_clients):
    s3 = aws_clients["s3"]
    s3.create_bucket(Bucket="test")
    # ...
```

## Fuente y registro de cambios

[github.com/floci-io/testcontainers-floci-python](https://github.com/floci-io/testcontainers-floci-python)
