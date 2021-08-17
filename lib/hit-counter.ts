import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export interface HitCounterProps {
  /**
   * the funditon for which we want to count the url hits
   */
  downstream: lambda.IFunction;
}

export class HitCounter extends cdk.Construct {
  /** alows accessing the coutner funciton */
  public readonly handler: lambda.IFunction;

  constructor(scope: cdk.Construct, id: string, { downstream }: HitCounterProps) {
    super(scope, id);

    const hitsTable = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hit-counter.handler',
      code: lambda.Code.fromAsset('lambda', { exclude: ['*.ts'] }),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: downstream.functionName,
        HITS_TABLE_NAME: hitsTable.tableName,
      },
    });

    // grant read/write persmissions for table Hits for lambda func
    hitsTable.grantWriteData(this.handler);

    // grant invoke persmissions
    downstream.grantInvoke(this.handler);
  }
}
