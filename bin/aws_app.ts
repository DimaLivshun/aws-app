#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DeployWebAppStack } from "../lib/deploy-web-app-stack";
import {LambdaStack} from "../lib/lambda-stack";
import {ProductServiceStack} from "../lib/product-service";
import {TodoStack} from "../lib/todo/TodoStack";
import {ImportServiceStack} from "../lib/import-service-stack";
import {ProductSqsStack} from "../lib/product-sqs/product-sqs-stack";
import {ProductSnsStack} from "../lib/product-sns/product-sns-stack";
import {AuthorizerStack} from "../lib/authorizer-stack";
import {HelloRdsStack} from "../lib/hello-rds/hello-rds-stack";
import {AppStack} from "../lib/app-stack";
import * as path from 'path';

const app = new cdk.App();
new DeployWebAppStack(app, "DeployWebAppStack", {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

new LambdaStack(app, 'LambdaStack', {});

new TodoStack(app, 'TodoStack');

new ProductServiceStack(app, 'ProductServiceStack', {})

new ImportServiceStack(app, 'ImportServiceStack', {})

new ProductSqsStack(app, "ProductSqsStack");

new ProductSnsStack(app, "ProductSnsStack");

new AuthorizerStack(app, 'AuthorizerStack');

new HelloRdsStack(app, 'HelloRdsStack', { env: { account: app.account, region: app.region } });

new AppStack(app, 'AppStack', {
  lambdaPath: path.resolve(__dirname, '..', 'nest-app.zip'),
  lambdaHandler: 'dist/lambda.handler',
});


