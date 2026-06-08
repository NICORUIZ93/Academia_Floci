# Módulo 11 · Infraestructura como código: CloudFormation

## ¿Qué es la infraestructura como código?

En lugar de crear recursos manualmente con la consola o CLI, defines toda tu infraestructura en archivos de texto (YAML o JSON). Esto te permite:

- Reproducir entornos idénticos (dev, staging, prod)
- Versionar la infraestructura en git
- Detectar cambios con diff
- Revertir si algo sale mal

**CloudFormation** es el servicio nativo de AWS para IaC. Cada archivo describe un **stack** (conjunto de recursos relacionados).

---

## Tu primer template CloudFormation

```bash
eval $(floci env)

cat > mi-stack.yaml << 'EOF'
AWSTemplateFormatVersion: "2010-09-09"
Description: Stack básico con S3, SQS y DynamoDB

Parameters:
  NombreApp:
    Type: String
    Default: mi-app
    Description: Prefijo para los nombres de recursos

Resources:
  MiBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub "${NombreApp}-bucket"
      VersioningConfiguration:
        Status: Enabled

  MiCola:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: !Sub "${NombreApp}-cola"
      VisibilityTimeout: 30

  MiColaErrores:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: !Sub "${NombreApp}-dlq"

  MiTabla:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "${NombreApp}-tareas"
      AttributeDefinitions:
        - AttributeName: PK
          AttributeType: S
        - AttributeName: SK
          AttributeType: S
      KeySchema:
        - AttributeName: PK
          KeyType: HASH
        - AttributeName: SK
          KeyType: RANGE
      BillingMode: PAY_PER_REQUEST

  MiRolLambda:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Sub "${NombreApp}-rol-lambda"
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      Policies:
        - PolicyName: permisos-app
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow
                Action:
                  - s3:GetObject
                  - s3:PutObject
                Resource: !Sub "arn:aws:s3:::${NombreApp}-bucket/*"
              - Effect: Allow
                Action:
                  - dynamodb:GetItem
                  - dynamodb:PutItem
                  - dynamodb:Query
                Resource: !GetAtt MiTabla.Arn
              - Effect: Allow
                Action:
                  - sqs:SendMessage
                  - sqs:ReceiveMessage
                  - sqs:DeleteMessage
                Resource: !GetAtt MiCola.Arn

Outputs:
  BucketNombre:
    Value: !Ref MiBucket
    Description: Nombre del bucket S3
  ColaNombre:
    Value: !Ref MiCola
    Description: URL de la cola SQS
  TablaARN:
    Value: !GetAtt MiTabla.Arn
    Description: ARN de la tabla DynamoDB
EOF
```

### Despliega el stack

```bash
# Crea el stack
aws cloudformation create-stack \
  --stack-name mi-stack \
  --template-body file://mi-stack.yaml \
  --parameters ParameterKey=NombreApp,ParameterValue=mi-app \
  --capabilities CAPABILITY_NAMED_IAM

# Espera a que termine
aws cloudformation wait stack-create-complete \
  --stack-name mi-stack

# Verifica el estado
aws cloudformation describe-stacks \
  --stack-name mi-stack \
  --query "Stacks[0].StackStatus"

# Ve los outputs
aws cloudformation describe-stacks \
  --stack-name mi-stack \
  --query "Stacks[0].Outputs"

# Lista los recursos creados
aws cloudformation list-stack-resources \
  --stack-name mi-stack
```

### Actualiza el stack

```bash
# Modifica el template y actualiza
aws cloudformation update-stack \
  --stack-name mi-stack \
  --template-body file://mi-stack.yaml \
  --parameters ParameterKey=NombreApp,ParameterValue=mi-app \
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation wait stack-update-complete --stack-name mi-stack
```

### Change Set — revisa antes de aplicar

```bash
# Crea un change set (previsualiza qué va a cambiar)
aws cloudformation create-change-set \
  --stack-name mi-stack \
  --change-set-name cambios-v2 \
  --template-body file://mi-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM

# Revisa los cambios
aws cloudformation describe-change-set \
  --stack-name mi-stack \
  --change-set-name cambios-v2

# Si te parece bien, aplica
aws cloudformation execute-change-set \
  --stack-name mi-stack \
  --change-set-name cambios-v2
```

---

## Stack completo: aplicación serverless

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: API serverless completa con Lambda + API Gateway + DynamoDB

Resources:
  TablaTareas:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: Tareas
      AttributeDefinitions:
        - AttributeName: PK
          AttributeType: S
        - AttributeName: SK
          AttributeType: S
      KeySchema:
        - AttributeName: PK
          KeyType: HASH
        - AttributeName: SK
          KeyType: RANGE
      BillingMode: PAY_PER_REQUEST

  RolLambda:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      Policies:
        - PolicyName: acceso-dynamo
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow
                Action: ["dynamodb:*"]
                Resource: !GetAtt TablaTareas.Arn

  FuncionAPI:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: api-tareas-lambda
      Runtime: python3.11
      Handler: index.handler
      Role: !GetAtt RolLambda.Arn
      Code:
        ZipFile: |
          import json, boto3, os
          db = boto3.resource("dynamodb",
            endpoint_url=os.environ.get("AWS_ENDPOINT_URL","http://localhost:4566"),
            region_name="us-east-1", aws_access_key_id="test", aws_secret_access_key="test")
          def handler(event, context):
            return {"statusCode":200,"body":json.dumps({"ok":True})}
      Environment:
        Variables:
          TABLA_NOMBRE: !Ref TablaTareas

  ApiHTTP:
    Type: AWS::ApiGatewayV2::Api
    Properties:
      Name: api-tareas
      ProtocolType: HTTP

  IntegracionLambda:
    Type: AWS::ApiGatewayV2::Integration
    Properties:
      ApiId: !Ref ApiHTTP
      IntegrationType: AWS_PROXY
      IntegrationUri: !GetAtt FuncionAPI.Arn
      PayloadFormatVersion: "2.0"

  RutaGet:
    Type: AWS::ApiGatewayV2::Route
    Properties:
      ApiId: !Ref ApiHTTP
      RouteKey: "GET /tareas"
      Target: !Sub "integrations/${IntegracionLambda}"

  StageDev:
    Type: AWS::ApiGatewayV2::Stage
    Properties:
      ApiId: !Ref ApiHTTP
      StageName: dev
      AutoDeploy: true

Outputs:
  ApiUrl:
    Value: !Sub "http://localhost:4566/restapis/${ApiHTTP}/dev/_user_request_"
```

---

## Elimina el stack y todos sus recursos

```bash
# Elimina el stack (borra TODOS los recursos que creó)
aws cloudformation delete-stack --stack-name mi-stack
aws cloudformation wait stack-delete-complete --stack-name mi-stack
```

---

## Alternativas a CloudFormation

| Herramienta | Descripción |
|-------------|-------------|
| **Terraform** | IaC multi-nube (AWS + Azure + GCP) con su propio lenguaje (HCL) |
| **AWS CDK** | Define infraestructura con código real (Python, TypeScript, Java) |
| **Pulumi** | IaC con lenguajes de programación reales, multi-nube |
| **Azure Bicep** | Equivalente de CloudFormation para Azure |

---

## Reto del módulo

1. Escribe un template CloudFormation que cree bucket S3 + tabla DynamoDB + cola SQS
2. Despliégalo y verifica con `list-stack-resources`
3. Agrega un cambio (ej: habilitar versionado en S3) usando un Change Set
4. Elimina el stack y verifica que los recursos desaparecieron

## Preguntas de salida

1. ¿Qué ventaja tiene CloudFormation sobre crear recursos manualmente?
2. ¿Qué es un Change Set y por qué es importante usarlo en producción?
3. ¿Cuándo elegirías CDK sobre CloudFormation?
4. ¿Qué pasa si eliminas un stack — los datos en S3 y DynamoDB se borran?
