// Crea una tabla DynamoDB con clave primaria simple "id".
// Uso: go run dynamodb_create_table.go [nombre-tabla]
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func main() {
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

	tableName := fmt.Sprintf("MiTabla%d", time.Now().UnixMilli())
	if len(os.Args) > 1 {
		tableName = os.Args[1]
	}

	_, err = client.CreateTable(ctx, &dynamodb.CreateTableInput{
		TableName: aws.String(tableName),
		AttributeDefinitions: []types.AttributeDefinition{
			{AttributeName: aws.String("id"), AttributeType: types.ScalarAttributeTypeS},
		},
		KeySchema: []types.KeySchemaElement{
			{AttributeName: aws.String("id"), KeyType: types.KeyTypeHash},
		},
		BillingMode: types.BillingModePayPerRequest,
	})
	if err != nil {
		log.Fatalf("Error creando la tabla: %v", err)
	}

	if err := waitForActive(ctx, client, tableName); err != nil {
		log.Fatal(err)
	}
	fmt.Println("Tabla creada y activa:", tableName)
}

func waitForActive(ctx context.Context, client *dynamodb.Client, tableName string) error {
	for attempt := 0; attempt < 20; attempt++ {
		result, err := client.DescribeTable(ctx, &dynamodb.DescribeTableInput{TableName: aws.String(tableName)})
		if err == nil && result.Table.TableStatus == types.TableStatusActive {
			return nil
		}
		time.Sleep(500 * time.Millisecond)
	}
	return fmt.Errorf("la tabla %s no llego a estado ACTIVE a tiempo", tableName)
}
