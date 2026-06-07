# CloudFormation

**Protocolo:** Consulta (XML) — `POST http://localhost:4566/` con parámetro `Action=`
**Punto final:** `POST http://localhost:4566/`

## Acciones admitidas

| Acción | Descripción |
|---|---|
| `CreateStack` | Implementar una plantilla CloudFormation |
| `UpdateStack` | Actualizar una pila existente |
| `DeleteStack` | Eliminar una pila y sus recursos |
| `DescribeStacks` | Obtener el estado de la pila y los resultados |
| `ListStacks` | Listar pilas por estado |
| `DescribeStackEvents` | Obtener historial de eventos de creación/actualización de pila |
| `DescribeStackResources` | Obtenga todos los recursos en una pila |
| `DescribeStackResource` | Obtenga un recurso de pila específico |
| `ListStackResources` | Listar resúmenes de recursos |
| `GetTemplate` | Recuperar el cuerpo de la plantilla |
| `ValidateTemplate` | Validar una plantilla sin implementar |
| `CreateChangeSet` | Crear un conjunto de cambios |
| `DescribeChangeSet` | Obtener detalles del conjunto de cambios |
| `ExecuteChangeSet` | Aplicar un conjunto de cambios |
| `ListChangeSets` | Listar conjuntos de cambios para una pila |
| `DeleteChangeSet` | Eliminar un conjunto de cambios |
| `SetStackPolicy` | Establecer una política de pila |
| `GetStackPolicy` | Recuperar la política de pila actual |
| `ListStackSets` | Listado StackSets |
| `DescribeStackSet` | Obtenga detalles sobre StackSet |
| `CreateStackSet` | Cree un nuevo StackSet |

## Tipos de recursos compatibles con

Tipos de recursos aprovisionados durante `CreateStack`/`UpdateStack`/`DeleteStack`:

| Tipo de recurso | Notas |
|---|---|
| `AWS::S3::Bucket` | |
| `AWS::S3::BucketPolicy` | Aceptado; política no aplicada |
| `AWS::SQS::Queue` | |
| `AWS::SQS::QueuePolicy` | Aceptado; política no aplicada |
| `AWS::SNS::Topic` | |
| `AWS::DynamoDB::Table` | |
| `AWS::DynamoDB::GlobalTable` | |
| `AWS::Lambda::Function` | Tipos de paquetes Zip (S3 o `ZipFile` en línea) e imagen |
| `AWS::Lambda::EventSourceMapping` | Fuentes de transmisiones SQS, Kinesis y DynamoDB |
| `AWS::IAM::Role` | |
| `AWS::IAM::User` | |
| `AWS::IAM::AccessKey` | |
| `AWS::IAM::Policy` | |
| `AWS::IAM::ManagedPolicy` | |
| `AWS::IAM::InstanceProfile` | |
| `AWS::SSM::Parameter` | |
| `AWS::KMS::Key` | |
| `AWS::KMS::Alias` | |
| `AWS::SecretsManager::Secret` | |
| `AWS::ECR::Repository` | |
| `AWS::Events::Rule` | |
| `AWS::ApiGateway::RestApi` | |
| `AWS::ApiGateway::Resource` | |
| `AWS::ApiGateway::Method` | |
| `AWS::ApiGateway::Deployment` | |
| `AWS::ApiGateway::Stage` | |
| `AWS::ApiGatewayV2::Api` | |
| `AWS::ApiGatewayV2::Route` | |
| `AWS::ApiGatewayV2::Integration` | |
| `AWS::ApiGatewayV2::Stage` | |
| `AWS::ApiGatewayV2::Deployment` | |
| `AWS::Pipes::Pipe` | |
| `AWS::CloudFormation::Stack` | Pilas anidadas (con trozos: devuelve el ID de pila sintético) |
| `AWS::CDK::Metadata` | Aceptado; sin operación |
| `AWS::Route53::HostedZone` | Aplastado |
| `AWS::Route53::RecordSet` | Aplastado |

Todos los demás tipos de recursos se aceptan sin errores y se les asigna una identificación física sintética, por lo que las plantillas con tipos no admitidos aún se implementan en lugar de fallar.

## Actualizaciones de la pila Lambda

Los recursos de `AWS::Lambda::Function` se concilian durante `UpdateStack` de la misma forma que las implementaciones de CloudFormation/CDK:

- Una redistribución sin operación mantiene el nombre de la función física existente y no llama a las API de actualización Lambda, por lo que se pueden reutilizar los contenedores calientes.
- Los cambios de código y configuración mutables actualizan la función existente.
- Los cambios de solo reemplazo, como los cambios `FunctionName` o `PackageType`, crean una función de reemplazo y eliminan la anterior.
- El código respaldado por S3 permanece vinculado a través de `S3Bucket`/`S3Key`, por lo que la sincronización reactiva S3 de Lambda continúa funcionando para las funciones creadas por CloudFormation o CDK.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_CLOUDFORMATION_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Validate a template
aws cloudformation validate-template \
  --template-body file://template.yml \
  --endpoint-url $AWS_ENDPOINT_URL

# Deploy a stack
aws cloudformation create-stack \
  --stack-name my-stack \
  --template-body file://template.yml \
  --parameters ParameterKey=Env,ParameterValue=dev \
  --endpoint-url $AWS_ENDPOINT_URL

# Check status
aws cloudformation describe-stacks \
  --stack-name my-stack \
  --endpoint-url $AWS_ENDPOINT_URL

# Watch events
aws cloudformation describe-stack-events \
  --stack-name my-stack \
  --endpoint-url $AWS_ENDPOINT_URL

# Update
aws cloudformation update-stack \
  --stack-name my-stack \
  --template-body file://template.yml \
  --endpoint-url $AWS_ENDPOINT_URL

# Delete
aws cloudformation delete-stack \
  --stack-name my-stack \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a change set
aws cloudformation create-change-set \
  --stack-name my-stack \
  --change-set-name my-change-set \
  --template-body file://template.yml \
  --endpoint-url $AWS_ENDPOINT_URL

# List change sets
aws cloudformation list-change-sets \
  --stack-name my-stack \
  --endpoint-url $AWS_ENDPOINT_URL

# Describe a change set
aws cloudformation describe-change-set \
  --stack-name my-stack \
  --change-set-name my-change-set \
  --endpoint-url $AWS_ENDPOINT_URL

# Delete a change set
aws cloudformation delete-change-set \
  --stack-name my-stack \
  --change-set-name my-change-set \
  --endpoint-url $AWS_ENDPOINT_URL
```

## Lambda + SQS Asignación de origen de eventos

Implemente una función Lambda conectada a una cola SQS como una sola pila:

```yaml
# template.yml
Resources:
  MyQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: my-queue

  MyFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: my-function
      Runtime: nodejs22.x
      Handler: index.handler
      Role: arn:aws:iam::000000000000:role/lambda-role
      Code:
        ZipFile: |
          exports.handler = async (event) => {
            console.log(JSON.stringify(event));
          };

  MyESM:
    Type: AWS::Lambda::EventSourceMapping
    Properties:
      FunctionName: !Ref MyFunction
      EventSourceArn: !GetAtt MyQueue.Arn
      Enabled: true
      BatchSize: 10
```

```bash
aws cloudformation create-stack \
  --stack-name my-lambda-sqs-stack \
  --template-body file://template.yml \
  --endpoint-url $AWS_ENDPOINT_URL
```

!!! nota "orden de dependencia"
    Utilice `!Ref MyFunction` (no una cadena simple) para `FunctionName`, por lo que CloudFormation
    aprovisiona la función antes del mapeo del origen del evento.
