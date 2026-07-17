// Crea una politica IAM de solo lectura sobre un bucket S3 especifico
// (principio de minimo privilegio, no AdministratorAccess).
// Uso: go run iam_create_policy.go <nombre-politica> <nombre-bucket>
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/iam"
)

type policyDocument struct {
	Version   string            `json:"Version"`
	Statement []policyStatement `json:"Statement"`
}

type policyStatement struct {
	Effect   string   `json:"Effect"`
	Action   []string `json:"Action"`
	Resource []string `json:"Resource"`
}

func main() {
	if len(os.Args) < 3 {
		log.Fatal("Uso: go run iam_create_policy.go <nombre-politica> <nombre-bucket>")
	}
	policyName := os.Args[1]
	bucketName := os.Args[2]

	document := policyDocument{
		Version: "2012-10-17",
		Statement: []policyStatement{
			{
				Effect:   "Allow",
				Action:   []string{"s3:GetObject", "s3:ListBucket"},
				Resource: []string{"arn:aws:s3:::" + bucketName, "arn:aws:s3:::" + bucketName + "/*"},
			},
		},
	}
	documentJSON, err := json.Marshal(document)
	if err != nil {
		log.Fatalf("Error serializando la politica: %v", err)
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

	result, err := client.CreatePolicy(ctx, &iam.CreatePolicyInput{
		PolicyName:     aws.String(policyName),
		PolicyDocument: aws.String(string(documentJSON)),
	})
	if err != nil {
		log.Fatalf("Error creando la politica: %v", err)
	}
	fmt.Println("Politica creada:", aws.ToString(result.Policy.PolicyName))
	fmt.Println("ARN:", aws.ToString(result.Policy.Arn))
	fmt.Println("Siguiente paso: go run iam_attach_policy.go <usuario>", aws.ToString(result.Policy.Arn))
}
