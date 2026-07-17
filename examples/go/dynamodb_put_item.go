// Inserta (o sobrescribe) un item en una tabla DynamoDB.
// Uso: go run dynamodb_put_item.go <tabla> <id> <titulo>
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func main() {
	if len(os.Args) < 3 {
		log.Fatal("Uso: go run dynamodb_put_item.go <tabla> <id> <titulo>")
	}
	tableName := os.Args[1]
	id := os.Args[2]
	titulo := "Sin titulo"
	if len(os.Args) > 3 {
		titulo = strings.Join(os.Args[3:], " ")
	}

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

	_, err = client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item: map[string]types.AttributeValue{
			"id":     &types.AttributeValueMemberS{Value: id},
			"titulo": &types.AttributeValueMemberS{Value: titulo},
			"estado": &types.AttributeValueMemberS{Value: "pendiente"},
			"creado": &types.AttributeValueMemberN{Value: strconv.FormatInt(time.Now().UnixMilli(), 10)},
		},
	})
	if err != nil {
		log.Fatalf("Error insertando el item: %v", err)
	}
	fmt.Printf("Item insertado en %s: id=%s, titulo=%q\n", tableName, id, titulo)
}
