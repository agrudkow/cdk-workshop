import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import { TableViewer } from 'cdk-dynamo-table-viewer';
import { HitCounter } from './hit-counter';

export class CdkWorkshopStack extends cdk.Stack {
  // exposed outputs
  public readonly hcViewerUrl: cdk.CfnOutput;
  public readonly hcEndpoint: cdk.CfnOutput;
  
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
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

    const gateway = new apigateway.LambdaRestApi(this, 'HelloEndpoint', {
      handler: helloHitCounter.handler,
    });

    const tableViewer = new TableViewer(this, 'ViewHitCounterTable', {
      title: 'Hello Hits',
      table: helloHitCounter.hitsTable,
      sortBy: `-${helloHitCounter.hitsTableHitsCoulumnName}`
    });

    this.hcEndpoint = new cdk.CfnOutput(this, 'GatewayUrl', {
      value: gateway.url
    })

    this.hcViewerUrl = new cdk.CfnOutput(this, 'TableViewerUrl', {
      value: tableViewer.endpoint
    })
  }
}
