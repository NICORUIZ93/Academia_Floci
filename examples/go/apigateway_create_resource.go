// Crea un recurso (ruta) /tareas bajo el recurso raiz de una API REST.
// Uso: go run apigateway_create_resource.go <api-id> [ruta]
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
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Uso: go run apigateway_create_resource.go <api-id> [ruta]")
	}
	apiID := os.Args[1]
	pathPart := "tareas"
	if len(os.Args) > 2 {
		pathPart = os.Args[2]
	}

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

	resources, err := client.GetResources(ctx, &apigateway.GetResourcesInput{RestApiId: aws.String(apiID)})
	if err != nil {
		log.Fatalf("Error obteniendo los recursos de la API: %v", err)
	}
	var rootID string
	for _, r := range resources.Items {
		if aws.ToString(r.Path) == "/" {
			rootID = aws.ToString(r.Id)
			break
		}
	}
	if rootID == "" {
		log.Fatal("No se encontro el recurso raiz \"/\" de la API")
	}

	created, err := client.CreateResource(ctx, &apigateway.CreateResourceInput{
		RestApiId: aws.String(apiID),
		ParentId:  aws.String(rootID),
		PathPart:  aws.String(pathPart),
	})
	if err != nil {
		log.Fatalf("Error creando el recurso: %v", err)
	}
	fmt.Printf("Recurso creado: /%s\n", pathPart)
	fmt.Println("Resource ID:", aws.ToString(created.Id))
	fmt.Println("Siguiente paso: go run apigateway_put_method.go", apiID, aws.ToString(created.Id))
}
