# CloudFormation

**Protocolo:** Consulta (XML) — `POST http://localhost:4566/` con parámetro `Action=`
**Punto final:** `POST http://localhost:4566/`

## Acciones admitidas

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `DescribeStacks` | Obtener el estado de la pila y los resultados |
| `CreateStack` | Implementar una plantilla CloudFormation |
| `UpdateStack` | Actualizar una pila existente |
| `DeleteStack` | Eliminar una pila y sus recursos |
| `UpdateTerminationProtection` | - |
| `CreateChangeSet` | Crear un conjunto de cambios |
| `DescribeChangeSet` | Obtener detalles del conjunto de cambios (sin diferencia/vista previa calculada) |
| `ExecuteChangeSet` | Aplicar un conjunto de cambios |
| `DeleteChangeSet` | Eliminar un conjunto de cambios |
| `ListChangeSets` | Listar conjuntos de cambios para una pila |
| `DescribeStackEvents` | Obtener historial de eventos de creación/actualización de pila |
| `DescribeStackResources` | Obtenga todos los recursos en una pila |
| `ListStackResources` | Listar resúmenes de recursos |
| `GetTemplate` | Recuperar el cuerpo de la plantilla |
| `ValidateTemplate` | Aceptado; devuelve éxito sin validar (stub) |
| `ListStacks` | Listar pilas por estado |
| `ListExports` | - |
| `SetStackPolicy` | Aceptado; no-op (stub: las políticas de pila no se aplican) |
| `GetStackPolicy` | Aceptado; devuelve una política vacía (stub) |
| `DescribeStackResource` | Obtenga un recurso de pila específico |
| `CreateStackSet` | Crear un conjunto de pilas a partir de una plantilla |
| `DescribeStackSet` | Obtener detalles del conjunto de pilas |
| `ListStackSets` | Listar conjuntos de pilas |
| `UpdateStackSet` | Actualice el conjunto de pilas y vuelva a aplicarlo a las instancias existentes |
| `DeleteStackSet` | Eliminar un conjunto de pilas vacío |
| `CreateStackInstances` | Aprovisionar instancias en cuentas/regiones de destino |
| `ListStackInstances` | Listar instancias (opcionalmente filtradas por cuenta/región) |
| `DescribeStackInstance` | - |
| `DeleteStackInstances` | Eliminar instancias y sus recursos |
| `ListStackSetOperations` | Listar operaciones realizadas en un conjunto de pilas |
| `DescribeStackSetOperation` | - |
<!-- floci:actions:end -->

## Tipos de recursos admitidos

Tipos de recursos aprovisionados durante `CreateStack`/`UpdateStack`/`DeleteStack`. Cada uno delega a
el servicio de respaldo y establece una identificación física real más los atributos `Ref` / `Fn::GetAtt` utilizados por
referencias entre recursos.

| Servicio | Tipos de recursos |
|---|---|
| S3 | `Bucket`, `BucketPolicy` (aceptado; política no aplicada) |
| SQS | `Queue`, `QueuePolicy` (aceptado; política no aplicada) |
| SNS | `Topic`, `Subscription` |
| DynamoDB | `Table`, `GlobalTable` |
| Lambda | `Function` (Zip a través de S3/`ZipFile` en línea e imagen), `LayerVersion`, `EventSourceMapping` (transmisiones SQS, Kinesis, DynamoDB) |
| IAM | `Role`, `User`, `AccessKey`, `Policy`, `ManagedPolicy`, `InstanceProfile` |
| SSM | `Parameter` |
| KMS | `Key`, `Alias` |
| Gerente de Secretos | `Secret` |
| ECR | `Repository` |
| ECS | `Cluster`, `TaskDefinition`, `Service` |
| EKS | `Cluster`, `Nodegroup` |
| RDS | `DBInstance`, `DBCluster`, `DBSubnetGroup`, `DBParameterGroup`, `DBClusterParameterGroup` (DBInstance/DBCluster inicia contenedores reales) |
| EC2 | `VPC`, `Subnet`, `SecurityGroup`, `InternetGateway`, `RouteTable`, `SubnetRouteTableAssociation`, `Route`, `NatGateway`, `EIP`, `Instance` |
| Equilibrio de carga elástico v2 | `LoadBalancer`, `TargetGroup`, `Listener`, `ListenerRule` |
| Escalado automático | `LaunchConfiguration`, `AutoScalingGroup` |
| Ruta 53 | `HostedZone`, `RecordSet` |
| Puerta de enlace API (v1) | `RestApi`, `Resource`, `Authorizer`, `Method`, `Deployment`, `Stage` |
| Puerta de enlace API v2 | `Api`, `Route`, `Integration`, `Stage`, `Deployment` |
| Funciones de paso | `StateMachine` |
| Lote | `ComputeEnvironment`, `JobQueue`, `JobDefinition` |
| cognito | `UserPool`, `UserPoolClient` |
| EventBridge | `Events::Rule` |
| Tuberías | `Pipe` |
| Kinesis | `Stream` |
| Kinesis Datos Firehose | `DeliveryStream` |
| CloudWatch | `Alarm` |
| Registros CloudWatch | `LogGroup` |
| CloudFormation | `Stack` (pilas anidadas), `CustomResource` y `Custom::*` (respaldados por Lambda) |
| CDK | `CDK::Metadata` (aceptado; no operativo) |

Todos los demás tipos de recursos se aceptan sin errores y se les asigna una identificación física sintética (con un
`arn:aws:stub:::<logicalId>` ARN), por lo que las plantillas con tipos no admitidos aún llegan
`CREATE_COMPLETE` en lugar de fallar.

## Actualizaciones de la pila Lambda

Los recursos de `AWS::Lambda::Function` se concilian durante `UpdateStack` de la misma forma que las implementaciones de CloudFormation/CDK:

- Una redistribución sin operación mantiene el nombre de la función física existente y no llama a las API de actualización Lambda, por lo que se pueden reutilizar los contenedores calientes.
- Los cambios de código y configuración mutables actualizan la función existente.
- Los cambios de solo reemplazo, como los cambios `FunctionName` o `PackageType`, crean una función de reemplazo y eliminan la anterior.
- El código respaldado por S3 permanece vinculado a través de `S3Bucket` / `S3Key`, por lo que la sincronización reactiva S3 de Lambda continúa funcionando para las funciones creadas por CloudFormation o CDK.

## Aprovisionamiento consciente de cuentas

Los recursos aprovisionados por `CreateStack`/`UpdateStack` aterrizan en el espacio de nombres **cuenta de la persona que llama**
(determinado a partir de la clave de acceso de la solicitud; consulte [Aislamiento de cuentas múltiples](../configuration/multi-account.md)).
Al eliminar la pila, se eliminan de esa misma cuenta.

## StackSets

StackSets implementa una única plantilla en muchas cuentas y regiones de destino:

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# 1. Create the stack set (in the administration account)
aws cloudformation create-stack-set \
  --stack-set-name my-set \
  --template-body file://template.yml \
  --endpoint-url $AWS_ENDPOINT_URL

# 2. Create instances in two target accounts
aws cloudformation create-stack-instances \
  --stack-set-name my-set \
  --accounts 222222222222 333333333333 \
  --regions us-east-1 \
  --endpoint-url $AWS_ENDPOINT_URL

# 3. The resources materialize in each target account's namespace
aws cloudformation list-stack-instances \
  --stack-set-name my-set \
  --endpoint-url $AWS_ENDPOINT_URL
```

`CreateStackInstances` impulsa el motor de pila única una vez por par `(account, region)`, aprovisionando
los recursos de cada instancia en el espacio de nombres de esa cuenta de destino, por lo que se implementó una cola llamada `orders`
en las cuentas `222222222222` y `333333333333` existe de forma independiente en cada una. El conjunto de pilas, su
instancias y su historial de operaciones se registran en la cuenta de administración (llamante).

`DeleteStackInstances` elimina instancias y sus recursos, a menos que `RetainStacks=true`, que
separa las instancias del conjunto de pilas pero deja sus pilas y recursos subyacentes en su lugar.
Un conjunto de pilas debe estar vacío antes de `DeleteStackSet`.

Una operación `CreateStackInstances` / `UpdateStackSet` informa `FAILED` si alguna de sus instancias falla
implementar (la instancia está marcada como `INOPERABLE`), por lo que el sondeo `DescribeStackSetOperation` refleja datos reales
aprovisionar resultados en lugar de devolver siempre `SUCCEEDED`.

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
