// Crea un usuario IAM.
// Uso: go run iam_create_user.go [nombre-usuario]
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/iam"
)

func main() {
	userName := "mi-usuario"
	if len(os.Args) > 1 {
		userName = os.Args[1]
	}

	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("test", "test", "")),
	)
	if err != nil {
		log.Fatalf("Error cargando configuracion: %v", err)
	}
	client := iam.NewFromConfig(cfg, func(o *iam.Options) {
		o.BaseEndpoint = aws.String("http://localhost:4566")
	})

	result, err := client.CreateUser(ctx, &iam.CreateUserInput{UserName: aws.String(userName)})
	if err != nil {
		log.Fatalf("Error creando el usuario (¿ya existe %q?): %v", userName, err)
	}
	fmt.Println("Usuario IAM creado:", aws.ToString(result.User.UserName))
	fmt.Println("ARN:", aws.ToString(result.User.Arn))
	fmt.Println("Siguiente paso: go run iam_create_policy.go")
}
