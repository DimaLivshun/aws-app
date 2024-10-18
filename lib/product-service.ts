import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

const PRODUCTS_TABLE_NAME = 'Products'

export const productsMock: readonly Product[]= [
  {
    id: "car1",
    title: "Tesla Model S",
    description: "Electric luxury sedan with advanced autopilot features.",
    price: 79999,
    count: 10
  },
  {
    id: "car2",
    title: "Ford Mustang",
    description: "Iconic American muscle car with a 5.0L V8 engine.",
    price: 55999,
    count: 5
  },
  {
    id: "car3",
    title: "BMW X5",
    description: "Luxury mid-size SUV with high-end interior and performance.",
    price: 65999,
    count: 8
  },
  {
    id: "car4",
    title: "Toyota Camry",
    description: "Reliable and fuel-efficient mid-size sedan.",
    price: 27999,
    count: 12
  },
  {
    id: "car5",
    title: "Chevrolet Bolt EV",
    description: "Affordable all-electric car with a long driving range.",
    price: 36999,
    count: 7
  }
];

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.SpecRestApi(this, "products-api", {
      apiDefinition: apigateway.ApiDefinition.fromAsset(path.join(__dirname, '../swagger.yaml')),
      restApiName: "API Gateway for product service",
      description: "This API serves the product lambda functions."
    });

    const productsTable = new dynamodb.Table(this, PRODUCTS_TABLE_NAME, {
      tableName: PRODUCTS_TABLE_NAME,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
    });

    const getAllProductsLambdaFunction = new NodejsFunction(this, 'get-products-list-lambda-function', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      environment: {
        TABLE_NAME: PRODUCTS_TABLE_NAME
      },
      entry: path.join(__dirname, '../lambda/get-products-list-lambda.ts'),
    });

    const getProductByIDLambdaFunction = new NodejsFunction(this, 'get-product-by-id-lambda-function', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      environment: {
        TABLE_NAME: PRODUCTS_TABLE_NAME
      },
      entry: path.join(__dirname, '../lambda/get-product-by-id-lambda.ts'),
    });

    const createProductLambdaFunction = new NodejsFunction(this, 'create-product-lambda-function', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      environment: {
        TABLE_NAME: PRODUCTS_TABLE_NAME
      },
      entry: path.join(__dirname, '../lambda/create-product-lambda.ts'),
    });

    const allProductsLambdaIntegration = new apigateway.LambdaIntegration(getAllProductsLambdaFunction, {
      integrationResponses: [
        {
          statusCode: '200',
        }
      ],
      proxy: true,
    });

    const productsByIDLambdaIntegration = new apigateway.LambdaIntegration(getProductByIDLambdaFunction, {
      integrationResponses: [
        {
          statusCode: '200',
        }
      ],
      proxy: true,
    });

    const createProductLambdaIntegration = new apigateway.LambdaIntegration(createProductLambdaFunction, {
      integrationResponses: [
        {
          statusCode: '200',
        }
      ],
      proxy: true,
    });

    const allProductsResource = api.root.addResource("products");
    const productByIDResource = allProductsResource.addResource('{id}');

    allProductsResource.addMethod('GET', allProductsLambdaIntegration, {
      methodResponses: [{ statusCode: '200' }],
    });

    allProductsResource.addMethod('POST', createProductLambdaIntegration, {
      methodResponses: [{ statusCode: '200' }],
    });

    productByIDResource.addMethod('GET', productsByIDLambdaIntegration, {
      methodResponses: [{ statusCode: '200' }],
    });

    allProductsResource.addCorsPreflight({
      allowOrigins: ['https://dw4y2wj894dn8.cloudfront.net'],
      allowMethods: ['GET'],
    });

    productsTable.grantWriteData(createProductLambdaFunction);
    productsTable.grantReadData(getAllProductsLambdaFunction);
    productsTable.grantReadData(getProductByIDLambdaFunction);
  }
}
