// Ejemplo Go para Floci.
// Requiere AWS SDK for Go v2:
// go get github.com/aws/aws-sdk-go-v2/config github.com/aws/aws-sdk-go-v2/service/s3
package main

import (
	"context"
	"fmt"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func main() {
	ctx := context.Background()

	// La configuracion fuerza region y credenciales locales.
	// EndpointResolverWithOptions redirige S3 a Floci en localhost:4566.
	cfg, err := config.LoadDefaultConfig(
		ctx,
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("test", "test", "")),
	)
	if err != nil {
		panic(err)
	}

	client := s3.NewFromConfig(cfg, func(options *s3.Options) {
		options.UsePathStyle = true
		options.BaseEndpoint = aws.String("http://localhost:4566")
	})

	_, err = client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String("curso-cloud-local"),
		Key:    aws.String("saludos/go.txt"),
		Body:   strings.NewReader("Hola desde Go y Floci\n"),
	})
	if err != nil {
		explainError(err)
		panic(err)
	}

	output, err := client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket: aws.String("curso-cloud-local"),
	})
	if err != nil {
		explainError(err)
		panic(err)
	}

	fmt.Printf("Objetos en Floci: %+v\n", output.Contents)
}

func explainError(err error) {
	// Errores frecuentes:
	// NoSuchBucket: crea curso-cloud-local antes de ejecutar.
	// connection refused: ejecuta docker compose up -d.
	// firma invalida: usa region us-east-1 y credenciales test/test.
	fmt.Printf("Fallo controlado en Floci: %v\n", err)
}
