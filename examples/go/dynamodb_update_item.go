// Actualiza el atributo "estado" de un item existente sin sobrescribir el resto.
// Uso: go run dynamodb_update_item.go <tabla> <id> <nuevo-estado>
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
	if len(os.Args) < 4 {
		log.Fatal("Uso: go run dynamodb_update_item.go <tabla> <id> <nuevo-estado>")
	}
	tableName := os.Args[1]
	id := os.Args[2]
	nuevoEstado := os.Args[3]

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

	result, err := client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
		UpdateExpression: aws.String("SET estado = :nuevoEstado"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":nuevoEstado": &types.AttributeValueMemberS{Value: nuevoEstado},
		},
		ReturnValues: types.ReturnValueAllNew,
	})
	if err != nil {
		log.Fatalf("Error actualizando el item: %v", err)
	}

	var plain map[string]interface{}
	if err := attributevalue.UnmarshalMap(result.Attributes, &plain); err != nil {
		log.Fatalf("Error decodificando el item: %v", err)
	}
	out, _ := json.MarshalIndent(plain, "", "  ")
	fmt.Println("Item actualizado:")
	fmt.Println(string(out))
}
