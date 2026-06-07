# Testcontainers — Node.js / TypeScript

El paquete `@floci/testcontainers` integra Floci con [Testcontainers para Node.js](https://node.testcontainers.org/). Funciona con cualquier ejecutor de pruebas que admita `async`/`await`: Jest, Vitest, Mocha y otros.

## Instalación

```sh
npm install --save-dev @floci/testcontainers
```

```sh
# yarn
yarn add --dev @floci/testcontainers

# pnpm
pnpm add -D @floci/testcontainers
```

## Uso básico — Jest

```typescript
import { FlociContainer } from "@floci/testcontainers";
import { S3Client, CreateBucketCommand, ListBucketsCommand } from "@aws-sdk/client-s3";

describe("S3", () => {
    let floci: FlociContainer;

    beforeAll(async () => {
        floci = await new FlociContainer().start();
    });

    afterAll(async () => {
        await floci.stop();
    });

    it("should create and list a bucket", async () => {
        const s3 = new S3Client({
            endpoint: floci.getEndpoint(),
            region: floci.getRegion(),
            credentials: {
                accessKeyId: floci.getAccessKey(),
                secretAccessKey: floci.getSecretKey(),
            },
            forcePathStyle: true,
        });

        await s3.send(new CreateBucketCommand({ Bucket: "my-bucket" }));

        const { Buckets } = await s3.send(new ListBucketsCommand({}));
        expect(Buckets?.some(b => b.Name === "my-bucket")).toBe(true);
    });
});
```

## Ejemplo de SQS

```typescript
import { FlociContainer } from "@floci/testcontainers";
import {
    SQSClient,
    CreateQueueCommand,
    SendMessageCommand,
    ReceiveMessageCommand,
} from "@aws-sdk/client-sqs";

describe("SQS", () => {
    let floci: FlociContainer;
    let sqs: SQSClient;

    beforeAll(async () => {
        floci = await new FlociContainer().start();
        sqs = new SQSClient({
            endpoint: floci.getEndpoint(),
            region: floci.getRegion(),
            credentials: {
                accessKeyId: floci.getAccessKey(),
                secretAccessKey: floci.getSecretKey(),
            },
        });
    });

    afterAll(async () => {
        await floci.stop();
    });

    it("should send and receive a message", async () => {
        const { QueueUrl } = await sqs.send(
            new CreateQueueCommand({ QueueName: "orders" })
        );

        await sqs.send(
            new SendMessageCommand({
                QueueUrl,
                MessageBody: JSON.stringify({ event: "order.placed" }),
            })
        );

        const { Messages } = await sqs.send(
            new ReceiveMessageCommand({ QueueUrl, MaxNumberOfMessages: 1 })
        );

        expect(Messages).toHaveLength(1);
        expect(JSON.parse(Messages![0].Body!).event).toBe("order.placed");
    });
});
```

## Ejemplo de DynamoDB

```typescript
import { FlociContainer } from "@floci/testcontainers";
import {
    DynamoDBClient,
    CreateTableCommand,
    PutItemCommand,
    GetItemCommand,
} from "@aws-sdk/client-dynamodb";

describe("DynamoDB", () => {
    let floci: FlociContainer;
    let dynamo: DynamoDBClient;

    beforeAll(async () => {
        floci = await new FlociContainer().start();
        dynamo = new DynamoDBClient({
            endpoint: floci.getEndpoint(),
            region: floci.getRegion(),
            credentials: {
                accessKeyId: floci.getAccessKey(),
                secretAccessKey: floci.getSecretKey(),
            },
        });
    });

    afterAll(async () => {
        await floci.stop();
    });

    it("should put and get an item", async () => {
        await dynamo.send(
            new CreateTableCommand({
                TableName: "Orders",
                AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
                KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
                BillingMode: "PAY_PER_REQUEST",
            })
        );

        await dynamo.send(
            new PutItemCommand({
                TableName: "Orders",
                Item: {
                    id: { S: "order-1" },
                    status: { S: "placed" },
                },
            })
        );

        const { Item } = await dynamo.send(
            new GetItemCommand({
                TableName: "Orders",
                Key: { id: { S: "order-1" } },
            })
        );

        expect(Item?.status?.S).toBe("placed");
    });
});
```

## Vitest

El mismo patrón funciona con Vitest: reemplace `describe`/`it`/`expect` con sus equivalentes Vitest (el API es idéntico):

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FlociContainer } from "@floci/testcontainers";
import { S3Client, CreateBucketCommand, ListBucketsCommand } from "@aws-sdk/client-s3";

describe("S3", () => {
    let floci: FlociContainer;

    beforeAll(async () => {
        floci = await new FlociContainer().start();
    });

    afterAll(async () => {
        await floci.stop();
    });

    it("should create a bucket", async () => {
        const s3 = new S3Client({
            endpoint: floci.getEndpoint(),
            region: floci.getRegion(),
            credentials: {
                accessKeyId: floci.getAccessKey(),
                secretAccessKey: floci.getSecretKey(),
            },
            forcePathStyle: true,
        });

        await s3.send(new CreateBucketCommand({ Bucket: "vitest-bucket" }));

        const { Buckets } = await s3.send(new ListBucketsCommand({}));
        expect(Buckets?.some(b => b.Name === "vitest-bucket")).toBe(true);
    });
});
```

## Reutilización del contenedor en archivos de prueba

Inicie el contenedor una vez en un archivo de configuración global y exponga el punto final a través de una variable de entorno o un módulo compartido para que los archivos de prueba individuales no inicien cada uno su propio contenedor.

=== "Jest — configuración global"

    ```typescript
    // jest.global-setup.ts
    import { FlociContainer } from "@floci/testcontainers";

    let floci: FlociContainer;

    export async function setup() {
        floci = await new FlociContainer().start();
        process.env.FLOCI_ENDPOINT = floci.getEndpoint();
    }

    export async function teardown() {
        await floci?.stop();
    }
    ```

    ```json
    // jest.config.json
    {
      "globalSetup": "./jest.global-setup.ts"
    }
    ```

=== "Vitest — configuración global"

    ```typescript
    // vitest.global-setup.ts
    import { FlociContainer } from "@floci/testcontainers";

    let floci: FlociContainer;

    export async function setup() {
        floci = await new FlociContainer().start();
        process.env.FLOCI_ENDPOINT = floci.getEndpoint();
    }

    export async function teardown() {
        await floci?.stop();
    }
    ```

    ```typescript
    // vitest.config.ts
    import { defineConfig } from "vitest/config";

    export default defineConfig({
        test: {
            globalSetup: "./vitest.global-setup.ts",
        },
    });
    ```

## Fuente y registro de cambios

[github.com/floci-io/testcontainers-floci-node](https://github.com/floci-io/testcontainers-floci-node)
