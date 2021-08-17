import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import { HitCounter } from './hit-counter';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Stack definition

    const helloLambda = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda', { exclude: ['*.ts'] }),
      handler: 'hello.handler',
    });

    const helloHitCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: helloLambda,
    });

    new apigateway.LambdaRestApi(this, 'HelloEndpoint', {
      handler: helloHitCounter.handler,
    });
  }
}
