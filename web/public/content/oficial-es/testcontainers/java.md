# Testcontainers — Java

La biblioteca `testcontainers-floci` integra Floci con [Testcontainers para Java](https://java.testcontainers.org/). Inicia un contenedor Floci real antes de las pruebas y lo apaga después, sin configuración adicional.

Se publican dos líneas de artefactos para mantenerse sincronizadas con la versión principal de Testcontainers:

| Versión Testcontainers | Bota de primavera | Versión de artefacto |
|---|---|---|
| 1.x | 3.x | `1.4.0` |
| 2.x | 4.x | `2.5.0` |

## Instalación

=== "Maven"

    ```xml
    <dependency>
        <groupId>io.floci</groupId>
        <artifactId>testcontainers-floci</artifactId>
        <version>1.4.0</version>
        <scope>test</scope>
    </dependency>
    ```

=== "Gradle"

    ```groovy
    testImplementation 'io.floci:testcontainers-floci:1.4.0'
    ```

## Uso básico — JUnit 5

Anote la clase con `@Testcontainers` y declare un campo `FlociContainer` estático con `@Container`. Testcontainers maneja el ciclo de vida automáticamente.

```java
import io.floci.testcontainers.FlociContainer;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
class S3IntegrationTest {

    @Container
    static FlociContainer floci = new FlociContainer();

    @Test
    void shouldCreateBucket() {
        S3Client s3 = S3Client.builder()
                .endpointOverride(URI.create(floci.getEndpoint()))
                .region(Region.of(floci.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(floci.getAccessKey(), floci.getSecretKey())))
                .forcePathStyle(true)
                .build();

        s3.createBucket(b -> b.bucket("my-bucket"));

        assertThat(s3.listBuckets().buckets())
                .anyMatch(b -> b.name().equals("my-bucket"));
    }
}
```

## Ejemplo de SQS

```java
@Testcontainers
class SqsIntegrationTest {

    @Container
    static FlociContainer floci = new FlociContainer();

    @Test
    void shouldSendAndReceiveMessage() {
        SqsClient sqs = SqsClient.builder()
                .endpointOverride(URI.create(floci.getEndpoint()))
                .region(Region.of(floci.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(floci.getAccessKey(), floci.getSecretKey())))
                .build();

        String queueUrl = sqs.createQueue(b -> b.queueName("orders")).queueUrl();
        sqs.sendMessage(b -> b.queueUrl(queueUrl).messageBody("{\"event\":\"order.placed\"}"));

        var messages = sqs.receiveMessage(b -> b.queueUrl(queueUrl).maxNumberOfMessages(1)).messages();
        assertThat(messages).hasSize(1);
        assertThat(messages.get(0).body()).contains("order.placed");
    }
}
```

## Ejemplo de DynamoDB

```java
@Testcontainers
class DynamoDbIntegrationTest {

    @Container
    static FlociContainer floci = new FlociContainer();

    @Test
    void shouldCreateTableAndPutItem() {
        DynamoDbClient dynamo = DynamoDbClient.builder()
                .endpointOverride(URI.create(floci.getEndpoint()))
                .region(Region.of(floci.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(floci.getAccessKey(), floci.getSecretKey())))
                .build();

        dynamo.createTable(b -> b
                .tableName("Orders")
                .attributeDefinitions(a -> a.attributeName("id").attributeType(ScalarAttributeType.S))
                .keySchema(k -> k.attributeName("id").keyType(KeyType.HASH))
                .billingMode(BillingMode.PAY_PER_REQUEST));

        dynamo.putItem(b -> b
                .tableName("Orders")
                .item(Map.of("id", AttributeValue.fromS("order-1"),
                             "status", AttributeValue.fromS("placed"))));

        var item = dynamo.getItem(b -> b
                .tableName("Orders")
                .key(Map.of("id", AttributeValue.fromS("order-1")))).item();

        assertThat(item.get("status").s()).isEqualTo("placed");
    }
}
```

## Funda de resorte — `@ServiceConnection`

Agregue el artefacto complementario Spring Boot para el cableado automático de configuración cero. La anotación `@ServiceConnection` registra el contenedor como un bean `ConnectionDetails` y configura todos los clientes AWS SDK automáticamente.

=== "Maven"

    ```xml
    <dependency>
        <groupId>io.floci</groupId>
        <artifactId>spring-boot-testcontainers-floci</artifactId>
        <version>1.4.0</version>
        <scope>test</scope>
    </dependency>
    ```

=== "Gradle"

    ```groovy
    testImplementation 'io.floci:spring-boot-testcontainers-floci:1.4.0'
    ```

```java
import io.floci.testcontainers.FlociContainer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import software.amazon.awssdk.services.s3.S3Client;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
class AppIntegrationTest {

    @Container
    @ServiceConnection
    static FlociContainer floci = new FlociContainer();

    @Autowired
    S3Client s3;

    @Test
    void shouldCreateBucket() {
        s3.createBucket(b -> b.bucket("my-bucket"));

        assertThat(s3.listBuckets().buckets())
                .anyMatch(b -> b.name().equals("my-bucket"));
    }
}
```

Con `@ServiceConnection`, Spring Boot configura automáticamente la URL del punto final, la región y las credenciales para cada bean cliente AWS SDK en el contexto de la aplicación; no se necesitan anulaciones de `application-test.yml`.

## Reutilización del contenedor en todas las pruebas

Declare el contenedor en una clase base compartida o una extensión JUnit 5 para iniciarlo una vez por conjunto de pruebas en lugar de una vez por clase:

```java
abstract class FlociTestBase {

    @Container
    static FlociContainer floci = new FlociContainer();

    static S3Client s3;

    @BeforeAll
    static void setUpClients() {
        s3 = S3Client.builder()
                .endpointOverride(URI.create(floci.getEndpoint()))
                .region(Region.of(floci.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(floci.getAccessKey(), floci.getSecretKey())))
                .forcePathStyle(true)
                .build();
    }
}

@Testcontainers
class MyServiceTest extends FlociTestBase {

    @Test
    void myTest() {
        s3.createBucket(b -> b.bucket("test-bucket"));
        // ...
    }
}
```

## Fuente y registro de cambios

[github.com/floci-io/testcontainers-floci](https://github.com/floci-io/testcontainers-floci)
