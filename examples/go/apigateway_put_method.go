// Añade un metodo GET a un recurso, con respuesta mock (sin Lambda todavia).
// Uso: go run apigateway_put_method.go <api-id> <resource-id>
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/apigateway"
	"github.com/aws/aws-sdk-go-v2/service/apigateway/types"
)

func main() {
	if len(os.Args) < 3 {
		log.Fatal("Uso: go run apigateway_put_method.go <api-id> <resource-id>")
	}
	apiID := os.Args[1]
	resourceID := os.Args[2]

	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("test", "test", "")),
	)
	if err != nil {
		log.Fatalf("Error cargando configuracion: %v", err)
	}
	client := apigateway.NewFromConfig(cfg, func(o *apigateway.Options) {
		o.BaseEndpoint = aws.String("http://localhost:4566")
	})

	_, err = client.PutMethod(ctx, &apigateway.PutMethodInput{
		RestApiId:          aws.String(apiID),
		ResourceId:         aws.String(resourceID),
		HttpMethod:         aws.String("GET"),
		AuthorizationType:  aws.String("NONE"),
	})
	if err != nil {
		log.Fatalf("Error creando el metodo: %v", err)
	}
	fmt.Println("Metodo GET creado en el recurso.")

	_, err = client.PutIntegration(ctx, &apigateway.PutIntegrationInput{
		RestApiId:        aws.String(apiID),
		ResourceId:       aws.String(resourceID),
		HttpMethod:       aws.String("GET"),
		Type:             types.IntegrationTypeMock,
		RequestTemplates: map[string]string{"application/json": `{"statusCode": 200}`},
	})
	if err != nil {
		log.Fatalf("Error configurando la integracion: %v", err)
	}
	fmt.Println("Integracion MOCK configurada. Para conectar una Lambda real, usa integracion AWS_PROXY.")
}
