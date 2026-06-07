# Testcontainers — Go

El módulo `testcontainers-floci-go` integra Floci con [Testcontainers para Go](https://golang.testcontainers.org/). Inicia un contenedor Floci real antes de las pruebas y lo apaga después, sin configuración adicional.

## Instalación de

```bash
go get github.com/floci-io/testcontainers-floci-go
```

Requiere Go 1.25+ y Testcontainers para Go v0.42+.

## Uso básico de

```go
package myservice_test

import (
    "context"
    "testing"

    "github.com/aws/aws-sdk-go-v2/aws"
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/credentials"
    "github.com/aws/aws-sdk-go-v2/service/s3"
    floci "github.com/floci-io/testcontainers-floci-go"
)

func TestS3CreateBucket(t *testing.T) {
    ctx := context.Background()

    container, err := floci.NewFlociContainer().Start(ctx)
    if err != nil {
        t.Fatal(err)
    }
    defer container.Stop(ctx)

    cfg, err := config.LoadDefaultConfig(ctx,
        config.WithRegion(container.GetRegion()),
        config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
            container.GetAccessKey(), container.GetSecretKey(), "",
        )),
        config.WithBaseEndpoint(container.GetEndpoint()),
    )
    if err != nil {
        t.Fatal(err)
    }

    client := s3.NewFromConfig(cfg, func(o *s3.Options) {
        o.UsePathStyle = true
    })

    _, err = client.CreateBucket(ctx, &s3.CreateBucketInput{
        Bucket: aws.String("my-bucket"),
    })
    if err != nil {
        t.Fatal(err)
    }

    out, err := client.ListBuckets(ctx, &s3.ListBucketsInput{})
    if err != nil {
        t.Fatal(err)
    }

    var found bool
    for _, b := range out.Buckets {
        if aws.ToString(b.Name) == "my-bucket" {
            found = true
            break
        }
    }
    if !found {
        t.Error("bucket not found after create")
    }
}
```

## Ejemplo de SQS

```go
func TestSqsSendReceive(t *testing.T) {
    ctx := context.Background()

    container, err := floci.NewFlociContainer().Start(ctx)
    if err != nil {
        t.Fatal(err)
    }
    defer container.Stop(ctx)

    cfg, _ := config.LoadDefaultConfig(ctx,
        config.WithRegion(container.GetRegion()),
        config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
            container.GetAccessKey(), container.GetSecretKey(), "",
        )),
        config.WithBaseEndpoint(container.GetEndpoint()),
    )

    client := sqs.NewFromConfig(cfg)

    queue, err := client.CreateQueue(ctx, &sqs.CreateQueueInput{
        QueueName: aws.String("orders"),
    })
    if err != nil {
        t.Fatal(err)
    }

    _, err = client.SendMessage(ctx, &sqs.SendMessageInput{
        QueueUrl:    queue.QueueUrl,
        MessageBody: aws.String(`{"event":"order.placed"}`),
    })
    if err != nil {
        t.Fatal(err)
    }

    out, err := client.ReceiveMessage(ctx, &sqs.ReceiveMessageInput{
        QueueUrl:            queue.QueueUrl,
        MaxNumberOfMessages: 1,
    })
    if err != nil {
        t.Fatal(err)
    }

    if len(out.Messages) != 1 {
        t.Fatalf("expected 1 message, got %d", len(out.Messages))
    }
}
```

## Ejemplo de DynamoDB

```go
func TestDynamoDBPutGet(t *testing.T) {
    ctx := context.Background()

    container, err := floci.NewFlociContainer().Start(ctx)
    if err != nil {
        t.Fatal(err)
    }
    defer container.Stop(ctx)

    cfg, _ := config.LoadDefaultConfig(ctx,
        config.WithRegion(container.GetRegion()),
        config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
            container.GetAccessKey(), container.GetSecretKey(), "",
        )),
        config.WithBaseEndpoint(container.GetEndpoint()),
    )

    client := dynamodb.NewFromConfig(cfg)

    _, err = client.CreateTable(ctx, &dynamodb.CreateTableInput{
        TableName:   aws.String("Orders"),
        BillingMode: types.BillingModePayPerRequest,
        AttributeDefinitions: []types.AttributeDefinition{
            {AttributeName: aws.String("id"), AttributeType: types.ScalarAttributeTypeS},
        },
        KeySchema: []types.KeySchemaElement{
            {AttributeName: aws.String("id"), KeyType: types.KeyTypeHash},
        },
    })
    if err != nil {
        t.Fatal(err)
    }

    _, err = client.PutItem(ctx, &dynamodb.PutItemInput{
        TableName: aws.String("Orders"),
        Item: map[string]types.AttributeValue{
            "id":     &types.AttributeValueMemberS{Value: "order-1"},
            "status": &types.AttributeValueMemberS{Value: "placed"},
        },
    })
    if err != nil {
        t.Fatal(err)
    }

    result, err := client.GetItem(ctx, &dynamodb.GetItemInput{
        TableName: aws.String("Orders"),
        Key: map[string]types.AttributeValue{
            "id": &types.AttributeValueMemberS{Value: "order-1"},
        },
    })
    if err != nil {
        t.Fatal(err)
    }

    status := result.Item["status"].(*types.AttributeValueMemberS).Value
    if status != "placed" {
        t.Errorf("expected status 'placed', got '%s'", status)
    }
}
```

## Reutilización del contenedor en todas las pruebas

Inicie el contenedor una vez con `TestMain` y compártalo entre todas las pruebas del paquete:

```go
var sharedContainer *floci.StartedFlociContainer

func TestMain(m *testing.M) {
    ctx := context.Background()

    var err error
    sharedContainer, err = floci.NewFlociContainer().Start(ctx)
    if err != nil {
        log.Fatalf("failed to start floci: %v", err)
    }

    code := m.Run()

    sharedContainer.Stop(ctx)
    os.Exit(code)
}

func awsCfg(ctx context.Context) aws.Config {
    cfg, _ := config.LoadDefaultConfig(ctx,
        config.WithRegion(sharedContainer.GetRegion()),
        config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
            sharedContainer.GetAccessKey(), sharedContainer.GetSecretKey(), "",
        )),
        config.WithBaseEndpoint(sharedContainer.GetEndpoint()),
    )
    return cfg
}
```

## Opciones de

Las opciones están encadenadas en el generador antes de llamar a `Start`:

```go
container, err := floci.NewFlociContainer().
    WithRegion("eu-west-1").
    WithAccountID("123456789012").
    WithImage("floci/floci:1.6.0").
    WithDedicatedNetwork().
    Start(ctx)
```

| Método | Predeterminado | Descripción |
|---|---|---|
| `WithImage(image string)` | `floci/floci:latest` | Imagen Docker a utilizar |
| `WithRegion(region string)` | `us-east-1` | Región AWS establecida en Floci y devuelta por `GetRegion()` |
| `WithAccountID(id string)` | `000000000000` | ID de cuenta AWS predeterminado utilizado en los ARN |
| `WithAvailabilityZone(az string)` | `us-east-1a` | Zona de disponibilidad reportada por Floci |
| `WithDedicatedNetwork()` | _(ninguno)_ | Cree una red Docker dedicada para servicios respaldados por contenedores (ElastiCache, RDS, OpenSearch, MSK) |

## Configuración del servicio

Cada servicio expone una estructura de configuración escrita. Páselo con el método `With<Service>Config` correspondiente:

```go
container, err := floci.NewFlociContainer().
    WithS3Config(floci.S3Config{
        Enabled:                    true,
        DefaultPresignExpirySeconds: 7200,
    }).
    WithSqsConfig(floci.SqsConfig{
        Enabled:                  true,
        DefaultVisibilityTimeout: 60,
        MaxMessageSize:           131072,
    }).
    WithDynamoDbConfig(floci.DynamoDbConfig{
        Enabled: true,
    }).
    Start(ctx)
```

Métodos de configuración disponibles: `WithAcmConfig`, `WithApiGatewayConfig`, `WithAppConfigConfig`, `WithAthenaConfig`, `WithBackupConfig`, `WithBedrockRuntimeConfig`, `WithCloudFormationConfig`, `WithCloudWatchLogsConfig`, `WithCloudWatchMetricsConfig`, `WithCodeBuildConfig`, `WithCodeDeployConfig`, `WithCognitoConfig`, `WithDynamoDbConfig`, `WithEc2Config`, `WithEcrConfig`, `WithEcsConfig`, `WithEksConfig`, `WithElastiCacheConfig`, `WithElbConfig`, `WithEventBridgeConfig`, `WithFirehoseConfig`, `WithGlueConfig`, `WithIamConfig`, `WithKinesisConfig`, `WithKmsConfig`, `WithLambdaConfig`, `WithMskConfig`, `WithOpenSearchConfig`, `WithRdsConfig`, `WithRoute53Config`, `WithS3Config`, `WithSchedulerConfig`, `WithSecretsManagerConfig`, `WithSesConfig`, `WithSnsConfig`, `WithSqsConfig`, `WithSsmConfig`, `WithStepFunctionsConfig`, `WithStsConfig`, `WithTextractConfig`, `WithTransferConfig`.

## `StartedFlociContainer` API

| Método | Devoluciones | Descripción |
|---|---|---|
| `GetEndpoint()` | `string` | Punto final HTTP completo, p. `http://localhost:32768` |
| `GetRegion()` | `string` | Región AWS configurada al inicio |
| `GetAccountID()` | `string` | ID de cuenta AWS configurada al inicio |
| `GetAccessKey()` | `string` | Siempre `"test"` |
| `GetSecretKey()` | `string` | Siempre `"test"` |
| `GetAvailabilityZone()` | `string` | Zona de disponibilidad configurada al inicio |
| `GetDedicatedNetworkName()` | `string` | Nombre de red Docker o cadena vacía si no se utiliza una red dedicada |
| `GetMappedPort(ctx, port int)` | `(int, error)` | Puerto anfitrión asignado al puerto de contenedores determinado |
| `Stop(ctx)` | `error` | Terminar el contenedor y limpiar |

## Fuente

[github.com/floci-io/testcontainers-floci-go](https://github.com/floci-io/testcontainers-floci-go)
