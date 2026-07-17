// Obtiene un item de DynamoDB por su clave primaria.
// Uso: go run dynamodb_get_item.go <tabla> <id>
// Requiere ademas: go get github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue
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
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func main() {
	if len(os.Args) < 3 {
		log.Fatal("Uso: go run dynamodb_get_item.go <tabla> <id>")
	}
	tableName := os.Args[1]
	id := os.Args[2]

	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("test", "test", "")),
	)
	if err != nil {
		log.Fatalf("Error cargando configuracion: %v", err)
	}
	client := dynamodb.NewFromConfig(cfg, func(o *dynamodb.Options) {
		o.BaseEndpoint = aws.String("http://localhost:4566")
	})

	result, err := client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil {
		log.Fatalf("Error obteniendo el item: %v", err)
	}
	if result.Item == nil {
		fmt.Printf("No existe ningun item con id=%q en %s.\n", id, tableName)
		return
	}

	var plain map[string]interface{}
	if err := attributevalue.UnmarshalMap(result.Item, &plain); err != nil {
		log.Fatalf("Error decodificando el item: %v", err)
	}
	out, _ := json.MarshalIndent(plain, "", "  ")
	fmt.Println("Item encontrado:")
	fmt.Println(string(out))
}
