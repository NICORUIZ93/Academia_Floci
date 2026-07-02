// Ejemplo Java para Floci.
// Requiere AWS SDK for Java v2: software.amazon.awssdk:s3.
// Objetivo: mostrar la misma idea del laboratorio en un lenguaje empresarial.

import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;

public class FlociS3Example {
  public static void main(String[] args) {
    // endpointOverride evita llamar a AWS real y redirige todo a Floci.
    // Las credenciales test/test son locales; no sirven para produccion.
    S3Client s3 = S3Client.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .forcePathStyle(true)
        .build();

    try {
      // El bucket debe existir antes de ejecutar esta escritura.
      // Si no existe, el SDK lanzara NoSuchBucket.
      s3.putObject(
          PutObjectRequest.builder()
              .bucket("curso-cloud-local")
              .key("saludos/java.txt")
              .build(),
          RequestBody.fromString("Hola desde Java y Floci\n"));

      // Listar objetos confirma que Floci recibio y guardo la peticion.
      System.out.println(s3.listObjectsV2(
          ListObjectsV2Request.builder().bucket("curso-cloud-local").build()));
    } catch (Exception error) {
      // Errores frecuentes:
      // NoSuchBucket: crea curso-cloud-local.
      // Connection refused: levanta Floci con docker compose up -d.
      // SignatureDoesNotMatch: revisa region us-east-1 y credenciales test/test.
      System.err.println("Fallo controlado en Floci: " + error.getMessage());
      throw error;
    } finally {
      s3.close();
    }
  }
}
