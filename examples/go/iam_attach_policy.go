// Asigna (adjunta) una politica IAM a un usuario.
// Uso: go run iam_attach_policy.go <nombre-usuario> <arn-politica>
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
	if len(os.Args) < 3 {
		log.Fatal("Uso: go run iam_attach_policy.go <nombre-usuario> <arn-politica>")
	}
	userName := os.Args[1]
	policyArn := os.Args[2]

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

	_, err = client.AttachUserPolicy(ctx, &iam.AttachUserPolicyInput{
		UserName:  aws.String(userName),
		PolicyArn: aws.String(policyArn),
	})
	if err != nil {
		log.Fatalf("Error asignando la politica: %v", err)
	}
	fmt.Printf("Politica %s asignada a %s.\n", policyArn, userName)

	attached, err := client.ListAttachedUserPolicies(ctx, &iam.ListAttachedUserPoliciesInput{UserName: aws.String(userName)})
	if err != nil {
		log.Fatalf("Error listando las politicas asignadas: %v", err)
	}
	fmt.Print("Politicas actualmente asignadas: [")
	for i, p := range attached.AttachedPolicies {
		if i > 0 {
			fmt.Print(" ")
		}
		fmt.Print(aws.ToString(p.PolicyName))
	}
	fmt.Println("]")
}
